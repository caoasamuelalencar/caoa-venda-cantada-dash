import SalesIntentionForm from '@/components/SalesIntentionForm';

export const metadata = {
  title: 'Registrar intenção de venda'
};

export default function SalesIntentionPage() {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)] py-0 sm:py-6">
      <div className="mx-auto w-full max-w-4xl px-0 sm:px-4">
        <SalesIntentionForm />
      </div>
    </main>
  );
}
