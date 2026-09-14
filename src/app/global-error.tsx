"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // global-error must render its own <html> and <body> tags,
  // replacing the root layout when an error is thrown there.
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 max-w-md">
          We encountered an unexpected error while trying to process your request.
          {error.digest && (
            <span className="block mt-4 text-xs font-mono bg-slate-100 p-2 rounded">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={() => retry()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Try again
        </button>
      </body>
    </html>
  );
}