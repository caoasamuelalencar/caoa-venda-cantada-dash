import { Suspense } from "react";
import ResetPasswordContent from "@/components/reset-password-content";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
