import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/auth';

async function checkAuth(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  const cookie = req.headers.get('cookie') || '';
  const session = cookie.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
  return !(!session || !secret || !(await verifyAdminToken(session, secret)));
}

export interface ServiceCostLine {
  material_id: string;
  name: string;
  unit: string;
  amount: number;
  avg_cost_per_unit: number;
  subtotal: number;
}

export interface ServiceCost {
  service_id: string;
  material_cost: number;
  lines: ServiceCostLine[];
}

export async function GET(req: Request) {
  if (!(await checkAuth(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('service_materials')
    .select(`
      service_id,
      amount,
      inventory_items (id, name, unit, avg_cost_per_unit)
    `);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Группируем по service_id
  const map = new Map<string, ServiceCost>();

  for (const row of (data ?? []) as any[]) {
    const item = row.inventory_items;
    if (!item) continue;

    const costPerUnit = item.avg_cost_per_unit ?? 0;
    const subtotal = row.amount * costPerUnit;

    if (!map.has(row.service_id)) {
      map.set(row.service_id, { service_id: row.service_id, material_cost: 0, lines: [] });
    }

    const entry = map.get(row.service_id)!;
    entry.lines.push({
      material_id: item.id,
      name: item.name,
      unit: item.unit,
      amount: row.amount,
      avg_cost_per_unit: costPerUnit,
      subtotal,
    });
    entry.material_cost += subtotal;
  }

  return NextResponse.json(Array.from(map.values()));
}
