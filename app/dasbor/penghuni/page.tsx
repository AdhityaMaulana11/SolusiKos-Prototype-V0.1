"use client";

import { Suspense } from "react";
import TenantPageContent from "./TenantPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <TenantPageContent />
    </Suspense>
  );
}
