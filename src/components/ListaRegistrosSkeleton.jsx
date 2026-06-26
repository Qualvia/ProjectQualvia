import React from "react";

function ShimmerBlock({ className = "" }) {
  return (
    <div className={`bg-secondary/70 rounded-lg animate-pulse ${className}`} />
  );
}

export default function ListaRegistrosSkeleton({ count = 4 }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border animate-kpi-1">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between bg-secondary border-b border-border/40">
        <ShimmerBlock className="h-4 w-40" />
        <ShimmerBlock className="h-9 w-9 rounded-xl" />
      </div>
      {/* Items */}
      <div className="p-4 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-border rounded-xl px-5 py-4 space-y-2.5"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center gap-2">
              <ShimmerBlock className="h-4 w-32" />
              <ShimmerBlock className="h-5 w-16 rounded-full" />
            </div>
            <ShimmerBlock className="h-6 w-20" />
            <div className="flex items-center gap-3">
              <ShimmerBlock className="h-3 w-28" />
              <ShimmerBlock className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}