import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>; }
function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn("[&_tr]:border-b", className)} {...props} />; }
function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />; }
function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("h-10 border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5", className)} {...props} />; }
function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-9 whitespace-nowrap px-3 text-left align-middle type-table-header text-muted-foreground", className)} {...props} />; }
function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("max-w-80 px-3 py-2 align-middle type-table-cell", className)} {...props} />; }
function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) { return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />; }
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
