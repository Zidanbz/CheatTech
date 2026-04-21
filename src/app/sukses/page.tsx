import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000C26]" />}>
      <SuccessClient />
    </Suspense>
  );
}

