import SalesIntentionForm from '@/components/SalesIntentionForm';

export const metadata = {
  title: 'Registrar intenção de venda'
};

export default function SalesIntentionPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-5xl px-4">
        <SalesIntentionForm />
      </div>
    </main>
  );
}
