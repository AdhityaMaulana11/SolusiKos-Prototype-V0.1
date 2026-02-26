"use client";

import { Suspense } from "react";
import PenghuniContent from "./PenyediaContent";
import PenyediaContent from "./PenyediaContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PenyediaContent />
    </Suspense>
  );
}
