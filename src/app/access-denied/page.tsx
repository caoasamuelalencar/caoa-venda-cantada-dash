import { Suspense } from "react";
import AccessDeniedContent from "@/components/access-denied-content";

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
