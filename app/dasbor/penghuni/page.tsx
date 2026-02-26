"use client";

import { Suspense } from "react";
import PenghuniContent from "./PenghuniContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PenghuniContent />
    </Suspense>
  );
}
