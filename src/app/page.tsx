import type { Metadata } from 'next';
import MovedClient from './_moved-client';

export const metadata: Metadata = {
  title: 'BABEBAR переехал на babebar.ru',
  description: 'Наш сайт онлайн-записи переехал на новый адрес: babebar.ru',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://babebar.ru' },
};

export default function Page() {
  return <MovedClient />;
}
