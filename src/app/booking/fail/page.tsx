import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function BookingFailPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full text-center space-y-6 shadow-xl">
        <XCircle size={64} className="mx-auto text-red-400" />
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0A0A0A] mb-2">Оплата отменена</h1>
          <p className="text-zinc-400 font-medium">Запись не была создана. Попробуйте снова или позвоните нам.</p>
        </div>
        <Link
          href="/booking"
          className="block w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white text-center"
          style={{ backgroundColor: '#D14D72' }}
        >
          Попробовать снова
        </Link>
        <Link href="/" className="block text-xs font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-500 transition-colors">
          На главную
        </Link>
      </div>
    </div>
  );
}
