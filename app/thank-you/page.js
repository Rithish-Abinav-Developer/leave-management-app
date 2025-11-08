"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function StatusMessage() {
  const params = useSearchParams();
  const status = params.get("status");

  return (
    <div className="application_apply_redirect">
      <div className="">
        {status === "approved" ? (
          <>
            <h1 className="text-green-600 text-2xl font-semibold">✅ Application Approved</h1>
            <p className="mt-2 text-gray-600">
              The employee has been notified about the approval.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-red-600 text-2xl font-semibold">❌ Application Rejected</h1>
            <p className="mt-2 text-gray-600">
              The employee has been notified about the rejection.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <StatusMessage />
    </Suspense>
  );
}
