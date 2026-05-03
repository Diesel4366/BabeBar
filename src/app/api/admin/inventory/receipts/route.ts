import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';

async function checkAuth(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  const cookie = req.headers.get('cookie') || '';
  const session = cookie.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
  return !(!session || !secret || !(await verifyAdminToken(session, secret)));
}

export async function GET(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('inventory_receipts')
    .select(`
      id, number, date, supplier, comment, created_at,
      receipt_purchase_groups (
        id, name, total_price, packages_count,
        inventory_receipt_items (
          id, quantity, cost_per_unit,
          inventory_items (id, name, unit)
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Типы входящего запроса
interface SimpleItem {
  type: 'simple';
  item_id: string;
  packages_count: number;   // сколько упаковок куплено
  units_per_package: number; // единиц в одной упаковке
  package_price: number;    // цена одной упаковки
}

interface BundleGroup {
  type: 'bundle';
  name?: string;
  packages_count: number;   // сколько комплектов куплено
  total_price: number;      // цена одного комплекта
  lines: { item_id: string; qty_per_package: number }[];
}

type PurchaseLine = SimpleItem | BundleGroup;

export async function POST(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { date, supplier, comment, lines } = body as {
    date: string;
    supplier?: string;
    comment?: string;
    lines: PurchaseLine[];
  };

  if (!lines || lines.length === 0)
    return NextResponse.json({ error: 'Нет строк в документе' }, { status: 400 });

  // Генерируем номер документа
  const { count } = await supabaseAdmin
    .from('inventory_receipts')
    .select('*', { count: 'exact', head: true });
  const number = `ПП-${String((count ?? 0) + 1).padStart(3, '0')}`;

  // Создаём шапку
  const { data: receipt, error: rErr } = await supabaseAdmin
    .from('inventory_receipts')
    .insert({ number, date, supplier: supplier || null, comment: comment || null })
    .select()
    .single();

  if (rErr || !receipt) return NextResponse.json({ error: rErr?.message }, { status: 500 });

  // Обрабатываем каждую строку
  for (const line of lines) {
    if (line.type === 'simple') {
      // Простая позиция: одна упаковка → один материал
      const totalQty = line.packages_count * line.units_per_package;
      const totalCost = line.packages_count * line.package_price;
      const costPerUnit = line.units_per_package > 0 ? line.package_price / line.units_per_package : 0;

      // Создаём группу
      const { data: group } = await supabaseAdmin
        .from('receipt_purchase_groups')
        .insert({
          receipt_id: receipt.id,
          name: null,
          total_price: line.package_price,
          packages_count: line.packages_count,
        })
        .select()
        .single();

      if (!group) continue;

      // Создаём строку
      await supabaseAdmin.from('inventory_receipt_items').insert({
        receipt_id: receipt.id,
        group_id: group.id,
        item_id: line.item_id,
        quantity: totalQty,
        price_per_unit: costPerUnit,
        cost_per_unit: costPerUnit,
      });

      // Обновляем средневзвешенную себестоимость
      await updateAvgCost(line.item_id, totalQty, costPerUnit);

      // Пополняем остаток
      await addStock(line.item_id, totalQty);

    } else {
      // Комплект: одна цена → несколько материалов
      const totalUnitsPerPackage = line.lines.reduce((s, l) => s + l.qty_per_package, 0);
      const costPerUnit = totalUnitsPerPackage > 0 ? line.total_price / totalUnitsPerPackage : 0;

      // Создаём группу
      const { data: group } = await supabaseAdmin
        .from('receipt_purchase_groups')
        .insert({
          receipt_id: receipt.id,
          name: line.name || null,
          total_price: line.total_price,
          packages_count: line.packages_count,
        })
        .select()
        .single();

      if (!group) continue;

      // Создаём строки для каждого материала комплекта
      for (const l of line.lines) {
        const totalQty = l.qty_per_package * line.packages_count;

        await supabaseAdmin.from('inventory_receipt_items').insert({
          receipt_id: receipt.id,
          group_id: group.id,
          item_id: l.item_id,
          quantity: totalQty,
          price_per_unit: costPerUnit,
          cost_per_unit: costPerUnit,
        });

        await updateAvgCost(l.item_id, totalQty, costPerUnit);
        await addStock(l.item_id, totalQty);
      }
    }
  }

  return NextResponse.json({ success: true, receipt });
}

export async function DELETE(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Получаем строки для отката остатков
  const { data: items } = await supabaseAdmin
    .from('inventory_receipt_items')
    .select('item_id, quantity')
    .eq('receipt_id', id);

  if (items) {
    for (const item of items) {
      await addStock(item.item_id, -item.quantity);
    }
  }

  const { error } = await supabaseAdmin.from('inventory_receipts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Пересчитываем avg_cost_per_unit из оставшихся поступлений
  if (items) {
    const affectedItemIds = [...new Set(items.map(i => i.item_id))];
    for (const itemId of affectedItemIds) {
      await recalcAvgCost(itemId);
    }
  }

  return NextResponse.json({ success: true });
}

// Средневзвешенная себестоимость
async function updateAvgCost(itemId: string, receivedQty: number, newCost: number) {
  const { data } = await supabaseAdmin
    .from('inventory_items')
    .select('actual_stock, avg_cost_per_unit')
    .eq('id', itemId)
    .single();
  if (!data) return;
  const currentStock = data.actual_stock ?? 0;
  const oldAvg = data.avg_cost_per_unit ?? 0;
  const newAvg = currentStock + receivedQty > 0
    ? (currentStock * oldAvg + receivedQty * newCost) / (currentStock + receivedQty)
    : newCost;
  await supabaseAdmin
    .from('inventory_items')
    .update({ avg_cost_per_unit: Math.round(newAvg * 10000) / 10000 })
    .eq('id', itemId);
}

async function addStock(itemId: string, delta: number) {
  const { data } = await supabaseAdmin
    .from('inventory_items')
    .select('actual_stock')
    .eq('id', itemId)
    .single();
  if (!data) return;
  await supabaseAdmin
    .from('inventory_items')
    .update({ actual_stock: (data.actual_stock ?? 0) + delta })
    .eq('id', itemId);
}

// Пересчёт средневзвешенной из всех оставшихся поступлений
async function recalcAvgCost(itemId: string) {
  const { data } = await supabaseAdmin
    .from('inventory_receipt_items')
    .select('quantity, cost_per_unit')
    .eq('item_id', itemId);

  if (!data || data.length === 0) {
    await supabaseAdmin
      .from('inventory_items')
      .update({ avg_cost_per_unit: 0 })
      .eq('id', itemId);
    return;
  }

  const totalQty = data.reduce((s, r) => s + Number(r.quantity), 0);
  const weightedSum = data.reduce((s, r) => s + Number(r.quantity) * Number(r.cost_per_unit), 0);
  const newAvg = totalQty > 0 ? weightedSum / totalQty : 0;

  await supabaseAdmin
    .from('inventory_items')
    .update({ avg_cost_per_unit: Math.round(newAvg * 10000) / 10000 })
    .eq('id', itemId);
}
