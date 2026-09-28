import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() { return <div className="page-stack" role="status" aria-label="กำลังโหลด"><div className="space-y-2"><Skeleton className="h-7 w-52" /><Skeleton className="h-4 w-80 max-w-full" /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div><Skeleton className="h-72" /></div>; }
