import SalesIntentionForm from '@/components/SalesIntentionForm';

export const metadata = {
  title: 'Registrar intenção de venda'
};

export default function SalesIntentionPage() {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eaf3ff_100%)] py-0 sm:py-6 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto w-full max-w-4xl px-0 sm:px-4">
        <SalesIntentionForm />
      </div>
    </main>
  );
}
