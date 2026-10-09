/** Fallback while an admin page's session check and data load stream in. */
export function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-background" />)}
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-background" />
    </div>
  );
}
