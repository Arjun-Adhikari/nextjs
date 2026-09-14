"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // useEffect(() => {
  //   // This runs behind the scenes. In production, it's a good place
  //   // to send the error to services like Sentry or Datadog.
  //   console.error(error);
  // }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Generic Warning Icon */}
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-6">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Oops! Something went wrong
      </h2>

      <p className="text-slate-500 mb-8 max-w-md">
        We encountered an unexpected error while trying to process your request.
        {/* The digest is a secure hash Next.js generates in production.
            Users can quote this code to your support team to track down the exact bug. */}
        {error.digest && (
          <span className="block mt-4 text-xs font-mono bg-slate-100 p-2 rounded">
            Error ID: {error.digest}
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => retry()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}