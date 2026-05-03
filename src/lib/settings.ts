import { supabaseAdmin } from './supabase';
import { SITE_CONFIG } from './config';

export interface SiteSettings {
  address: string;
  phone: string;
  instagram: string;
  instagram_url: string;
  master_name: string;
}

const FALLBACK: SiteSettings = {
  address: SITE_CONFIG.address,
  phone: SITE_CONFIG.phone,
  instagram: SITE_CONFIG.instagram,
  instagram_url: SITE_CONFIG.instagramUrl,
  master_name: SITE_CONFIG.masterName,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value');
    if (error || !data) return FALLBACK;
    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
    return {
      address:       map.address       || FALLBACK.address,
      phone:         map.phone         || FALLBACK.phone,
      instagram:     map.instagram     || FALLBACK.instagram,
      instagram_url: map.instagram_url || FALLBACK.instagram_url,
      master_name:   map.master_name   || FALLBACK.master_name,
    };
  } catch {
    return FALLBACK;
  }
}
