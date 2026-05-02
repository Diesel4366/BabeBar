'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import { CATEGORY_ORDER } from '@/lib/config';
import { Plus, Trash2, Edit2, Clock, X, Check } from 'lucide-react';

type ServiceForm = Omit<Service, 'id' | 'created_at'>;

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  price: 0,
  duration_minutes: 60,
  image_url: null,
  is_active: true,
  category: 'Ресницы',
  is_addon: false,
  addon_for_category: null,
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; service?: Service } | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch { /* silent */ }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: 'add' });
  };

  const openEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      image_url: service.image_url,
      is_active: service.is_active,
      category: service.category,
      is_addon: service.is_addon,
      addon_for_category: service.addon_for_category,
    });
    setModal({ mode: 'edit', service });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal?.mode === 'add') {
        await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else if (modal?.service) {
        await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modal.service.id, ...form }),
        });
      }
      setModal(null);
      await fetchServices();
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      setDeleteId(null);
      await fetchServices();
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Каталог <span className="text-primary italic">услуг</span>
          </h1>
          <p className="text-zinc-400 font-medium uppercase text-[10px] tracking-[0.2em]">
            {services.length} услуг доступно для записи
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#0A0A0A] text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-black/10">
          <Plus size={20} />
          Добавить новую
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className={`bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 group ${!service.is_active ? 'opacity-50' : ''}`}>
              <div className="relative h-56 bg-zinc-100 flex items-center justify-center overflow-hidden">
                {service.image_url ? (
                  <Image src={service.image_url} alt={service.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <span className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em]">Нет фото</span>
                )}
                {!service.is_active && (
                  <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full">Архив</span>
                  </div>
                )}
                {service.is_addon && (
                  <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-primary/30">
                    Addon
                  </div>
                )}
              </div>

              <div className="p-10 flex-1 flex flex-col">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-3">{service.category}</div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#0A0A0A] mb-3 leading-none group-hover:text-primary transition-colors">{service.name}</h3>
                <p className="text-zinc-400 text-xs mb-8 line-clamp-2 leading-relaxed font-medium flex-1 italic">
                  {service.description || 'Описание не добавлено'}
                </p>

                <div className="flex justify-between items-center bg-zinc-50/50 border border-zinc-100 p-5 rounded-3xl mb-8">
                  <div className="flex items-center gap-2 text-zinc-400 font-black text-[9px] uppercase tracking-widest">
                    <Clock size={14} className="text-primary" />
                    <span>{service.duration_minutes} мин</span>
                  </div>
                  <div className="text-xl font-black text-[#0A0A0A]">
                    {service.price > 0 ? `${service.price} ₽` : '0 ₽'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(service)}
                    className="flex-1 py-4 rounded-2xl bg-white border border-zinc-100 text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all flex justify-center items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Изменить
                  </button>
                  <button
                    onClick={() => setDeleteId(service.id)}
                    className="w-14 h-14 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border border-zinc-100 border-dashed">
              <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.3em]">Каталог пуст</p>
              <button onClick={openAdd} className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-4">
                Создать первую услугу
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit / Add Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-10 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {modal.mode === 'add' ? 'Новая' : 'Изменить'} <span className="text-primary italic">услугу</span>
              </h2>
              <button onClick={() => setModal(null)} className="text-zinc-300 hover:text-zinc-600 transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Название услуги</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-6 py-5 font-bold text-sm focus:border-primary outline-none transition-all"
                  placeholder="Напр: Ламинирование ресниц"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Категория</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-6 py-5 font-bold text-sm focus:border-primary outline-none appearance-none"
                  >
                    {CATEGORY_ORDER.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Цена (₽)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-6 py-5 font-bold text-sm focus:border-primary outline-none transition-all text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Длительность (минуты)</label>
                <input
                  type="range"
                  min={15}
                  max={240}
                  step={15}
                  value={form.duration_minutes}
                  onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  className="w-full accent-primary mb-2"
                />
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span>15 мин</span>
                  <span className="text-primary text-sm font-black italic">{form.duration_minutes} минут</span>
                  <span>4 часа</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Описание</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-6 py-5 font-bold text-sm focus:border-primary outline-none resize-none transition-all"
                  placeholder="Расскажите об услуге..."
                />
              </div>

              <div className="space-y-6 bg-zinc-50/50 p-8 rounded-[2rem] border border-zinc-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Показывать на сайте</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.is_active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-zinc-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${form.is_active ? 'left-7' : 'left-1'}`} />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer group border-t border-zinc-100 pt-6">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Это дополнительная услуга</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_addon: !form.is_addon, addon_for_category: !form.is_addon ? form.category : null })}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.is_addon ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-zinc-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${form.is_addon ? 'left-7' : 'left-1'}`} />
                  </button>
                </label>
              </div>
            </div>

            <div className="p-10 border-t border-zinc-100 flex gap-4">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-5 rounded-2xl border border-zinc-100 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-5 rounded-2xl bg-[#0A0A0A] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
              >
                {saving
                  ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : <><Check size={16} /> {modal.mode === 'add' ? 'СОЗДАТЬ' : 'СОХРАНИТЬ'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-12 shadow-2xl text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Удалить услугу?</h3>
              <p className="text-zinc-400 text-xs font-medium leading-relaxed italic px-4">Это действие нельзя будет отменить, услуга исчезнет из каталога.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-5 rounded-2xl border border-zinc-100 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
