import { Suspense } from "react";
import ChangePasswordClient from "./ChangePasswordClient";

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
          <p className="text-sm font-semibold text-muted">Loading…</p>
        </div>
      }
    >
      <ChangePasswordClient />
    </Suspense>
  );
}
