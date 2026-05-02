import { supabaseAdmin } from './supabase';

const TOKEN = process.env.TELEGRAM_TOKEN;

export async function checkInventoryAlerts(appointmentId: string) {
  try {
    const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? '')
      .split(',').map(s => s.trim()).filter(Boolean);

    if (!chatIds.length || !TOKEN) return;

    // 1. Get all materials involved in this appointment
    const { data: materials, error } = await supabaseAdmin
      .from('appointment_services')
      .select(`
        service_id,
        service_materials (
          amount,
          inventory_items (id, name, unit, actual_stock, reserved_stock, min_threshold)
        )
      `)
      .eq('appointment_id', appointmentId);

    if (error || !materials) return;

    // 2. Flatten and unique materials
    const uniqueMats = new Map();
    materials.forEach((s: any) => {
      if (s.service_materials) {
        s.service_materials.forEach((sm: any) => {
          const item = sm.inventory_items;
          if (item && !uniqueMats.has(item.id)) {
            uniqueMats.set(item.id, item);
          }
        });
      }
    });

    // 3. For each material, check if we need an alert
    for (const item of uniqueMats.values()) {
      // Re-fetch to be 100% sure we have latest data after DB trigger
      const { data: freshItem } = await supabaseAdmin
        .from('inventory_items')
        .select('*')
        .eq('id', item.id)
        .single();
      
      if (!freshItem) continue;

      const available = freshItem.actual_stock - freshItem.reserved_stock;
      
      let message = '';
      if (available < 0) {
        message = `🚨 *ДЕФИЦИТ МАТЕРИАЛА!* \n\nНа новую запись не хватает: *${freshItem.name}*.\n\n📊 В наличии: ${freshItem.actual_stock} ${freshItem.unit}\n📅 В резерве (будущие записи): ${freshItem.reserved_stock} ${freshItem.unit}\n⚠️ Недостача: *${Math.abs(available)} ${freshItem.unit}*`;
      } else if (available <= freshItem.min_threshold) {
        message = `⚠️ *СКЛАД: ЗАПАСЫ НА ИСХОДЕ* \n\nМатериал: *${freshItem.name}*\n\n📊 Доступно после записи: ${available} ${freshItem.unit}\n📉 Порог уведомления: ${freshItem.min_threshold} ${freshItem.unit}\n\nРекомендуем пополнить запасы.`;
      }

      if (message) {
        await Promise.allSettled(chatIds.map(chatId =>
          fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown'
            })
          })
        ));
      }
    }
  } catch (e) {
    console.error('Inventory alert error:', e);
  }
}
