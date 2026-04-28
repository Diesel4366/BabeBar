import { supabaseAdmin } from '@/lib/supabase';
import { Service } from '@/types';
import { Clock, DollarSign, Calendar, MessageSquare, Camera } from 'lucide-react';

export default async function Home() {
  const { data: services } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
            BABE<span className="gold-text">BAR</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light italic">
            Искусство красоты в каждой детали
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/babebar_booking_bot" target="_blank" className="gold-button flex items-center justify-center gap-2 text-lg">
              <Calendar size={20} />
              Записаться онлайн
            </a>
            <a href="#services" className="px-8 py-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              Услуги
            </a>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Наши услуги</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services?.map((service: Service) => (
              <div key={service.id} className="premium-card p-6 flex flex-col justify-between group">
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:gold-text transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                    {service.description || 'Индивидуальный подход и премиальные материалы для вашей красоты.'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock size={16} className="gold-text" />
                    <span>{service.duration_minutes} мин</span>
                  </div>
                  <div className="font-bold gold-text">
                    {service.price} ₽
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/About Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="gold-text" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Наши работы</h3>
            <p className="text-muted-foreground">Следите за обновлениями в наших соцсетях</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="gold-text" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Поддержка 24/7</h3>
            <p className="text-muted-foreground">Наш бот ответит на ваши вопросы и поможет с записью</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="gold-text" size={32} />
            </div>
            <h3 className="text-xl font-semibold">Удобная запись</h3>
            <p className="text-muted-foreground">Выбирайте удобное время в пару кликов</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 text-center bg-zinc-900/50">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} BABEBAR SALON. Все права защищены.
        </p>
      </footer>
    </div>
  );
}
