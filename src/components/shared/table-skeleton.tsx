import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) { return <div className="divide-y" role="status" aria-label="กำลังโหลดตาราง">{Array.from({ length: rows }, (_, row) => <div key={row} className="grid h-10 items-center gap-4 px-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(5rem, 1fr))` }}>{Array.from({ length: columns }, (__, column) => <Skeleton key={column} className="h-3.5 w-full max-w-28" />)}</div>)}</div>; }
