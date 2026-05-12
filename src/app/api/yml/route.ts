import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: services } = await supabaseAdmin
    .from('services')
    .select('id, name, description, price, category')
    .eq('is_active', true)
    .eq('is_addon', false)
    .order('category')
    .order('price');

  if (!services) {
    return new NextResponse('Service unavailable', { status: 503 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://babe-bar.vercel.app').replace(/\/$/, '');
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  // Собираем уникальные категории
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const categoryIndex = Object.fromEntries(categories.map((c, i) => [c, i + 1]));

  const esc = (s?: string | null) =>
    (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const categoriesXml = categories
    .map(c => `    <category id="${categoryIndex[c]}">${esc(c)}</category>`)
    .join('\n');

  const offersXml = services
    .map(s => {
      const catId = categoryIndex[s.category ?? ''] ?? 1;
      // Услуги с ценой 0 — бесплатно, пишем 1 (Яндекс не принимает 0)
      const price = s.price > 0 ? s.price : 1;
      return `    <offer id="${s.id}" available="true">
      <url>${siteUrl}/booking</url>
      <name>${esc(s.name)}</name>
      <categoryId>${catId}</categoryId>
      <price>${price}</price>
      <currencyId>RUR</currencyId>${s.description ? `\n      <description>${esc(s.description)}</description>` : ''}
    </offer>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${now}">
  <shop>
    <name>BABEBAR</name>
    <company>BABEBAR Beauty Studio</company>
    <url>${siteUrl}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
