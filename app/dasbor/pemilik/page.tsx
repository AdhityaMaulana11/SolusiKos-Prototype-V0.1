"use client";

import { Suspense } from "react";
import PemilikContent from "./PemilikContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PemilikContent />
    </Suspense>
  );
}
