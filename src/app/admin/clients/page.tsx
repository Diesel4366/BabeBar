import { supabaseAdmin } from '@/lib/supabase';
import ClientsClient from './ClientsClient';

async function getClientsData() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, name, phone, nickname,
        telegram_username, telegram_id, vk_id,
        created_at, birthday,
        appointments ( id, total_price, status, date )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (profiles || []).map(p => {
      const completed = (p.appointments as { status: string; total_price: number; date: string }[] || [])
        .filter(a => a.status === 'completed');
      const totalSpent = completed.reduce((sum, a) => sum + (a.total_price || 0), 0);
      const lastVisit = completed.length > 0
        ? completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;
      return { ...p, totalVisits: completed.length, totalSpent, lastVisit };
    });
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function AdminClients() {
  const clients = await getClientsData();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
          База <span className="text-primary italic">клиентов</span>
        </h1>
        <p className="text-zinc-400 font-medium uppercase text-[10px] tracking-[0.2em]">
          Всего {clients.length} уникальных пользователей
        </p>
      </div>

      <ClientsClient clients={clients} />
    </div>
  );
}
