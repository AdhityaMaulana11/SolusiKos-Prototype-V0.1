"use client";

import { Suspense } from "react";
import OwnerPageContent from "./OwnerPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <OwnerPageContent />
    </Suspense>
  );
}
