'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import { CATEGORY_ORDER } from '@/lib/config';
import { Plus, Trash2, Edit2, Clock, ChevronLeft, X } from 'lucide-react';

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
    } catch {
      // silent
    }
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
    } catch {
      // silent
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      setDeleteId(null);
      await fetchServices();
    } catch {
      // silent
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-24 pb-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-[#0A0A0A] mb-2 tracking-tight uppercase">Услуги</h1>
              <p className="text-zinc-500 font-medium text-sm">
                {services.length} услуг в каталоге
              </p>
            </div>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
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
              <div key={service.id} className={`card-modern p-0 overflow-hidden flex flex-col ${!service.is_active ? 'opacity-50' : ''}`}>
                <div className="relative h-48 bg-zinc-100 flex items-center justify-center overflow-hidden">
                  {service.image_url ? (
                    <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                  ) : (
                    <span className="text-zinc-300 text-xs font-bold uppercase tracking-widest">Нет фото</span>
                  )}
                  {!service.is_active && (
                    <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full">Скрыта</span>
                    </div>
                  )}
                  {service.is_addon && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      Доп
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-2">{service.category}</div>
                  <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 leading-tight">{service.name}</h3>
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
                    {service.description || 'Описание не добавлено'}
                  </p>

                  <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase">
                      <Clock size={14} />
                      <span>{service.duration_minutes} мин</span>
                    </div>
                    <div className="text-lg font-black text-primary">
                      {service.price > 0 ? `${service.price} ₽` : 'Бесплатно'}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(service)}
                      className="flex-1 py-3 rounded-xl bg-white border border-zinc-100 text-sm font-bold hover:bg-zinc-50 transition-colors flex justify-center items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Изменить
                    </button>
                    <button
                      onClick={() => setDeleteId(service.id)}
                      className="p-3 rounded-xl bg-pink-50 text-primary hover:bg-pink-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full py-32 text-center card-modern">
                <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">Каталог пуст</p>
                <button onClick={openAdd} className="mt-4 text-primary font-bold">
                  Добавить первую услугу
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {modal.mode === 'add' ? 'Новая услуга' : 'Изменить услугу'}
              </h2>
              <button onClick={() => setModal(null)} className="text-zinc-300 hover:text-zinc-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Название</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none"
                  placeholder="Название услуги"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Категория</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none"
                >
                  {CATEGORY_ORDER.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Цена (₽)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Длительность (мин)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_minutes}
                    onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Описание</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none resize-none"
                  placeholder="Краткое описание"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Фото (URL)</label>
                <input
                  type="url"
                  value={form.image_url ?? ''}
                  onChange={e => setForm({ ...form, image_url: e.target.value || null })}
                  className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <div className="mt-3 relative h-32 rounded-2xl overflow-hidden bg-zinc-100">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <label className="flex items-center gap-4 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    style={{ backgroundColor: form.is_active ? '#D14D72' : '#E4E4E7' }}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                  >
                    <span
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
                      style={{ transform: form.is_active ? 'translateX(22px)' : 'translateX(4px)' }}
                    />
                  </button>
                  <span className="font-bold text-sm">Активна (показывается на сайте)</span>
                </label>

                <label className="flex items-center gap-4 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_addon: !form.is_addon, addon_for_category: !form.is_addon ? form.category : null })}
                    style={{ backgroundColor: form.is_addon ? '#D14D72' : '#E4E4E7' }}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                  >
                    <span
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
                      style={{ transform: form.is_addon ? 'translateX(22px)' : 'translateX(4px)' }}
                    />
                  </button>
                  <span className="font-bold text-sm">Дополнительная услуга</span>
                </label>

                {form.is_addon && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Доп к категории</label>
                    <select
                      value={form.addon_for_category ?? ''}
                      onChange={e => setForm({ ...form, addon_for_category: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm focus:border-primary outline-none"
                    >
                      {CATEGORY_ORDER.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-zinc-100 flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-4 rounded-2xl border border-zinc-100 font-black text-sm uppercase tracking-widest hover:bg-zinc-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 btn-primary py-4 text-[11px]"
              >
                {saving
                  ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                  : modal.mode === 'add' ? 'ДОБАВИТЬ' : 'СОХРАНИТЬ'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Удалить услугу?</h3>
              <p className="text-zinc-400 text-sm font-medium">Это действие необратимо</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl border border-zinc-100 font-black text-sm uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-widest transition-colors"
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
