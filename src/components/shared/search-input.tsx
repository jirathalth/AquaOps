"use client";

import { Search, X } from "lucide-react";
import { useRef, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & { value: string; onValueChange: (value: string) => void };

export function SearchInput({ className, value, onValueChange, disabled, readOnly, ...props }: SearchInputProps) { const inputRef = useRef<HTMLInputElement>(null); const canClear = Boolean(value) && !disabled && !readOnly; return <div className={cn("relative", className)}><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input ref={inputRef} className="search-input pl-9 pr-10" type="search" value={value} disabled={disabled} readOnly={readOnly} onChange={(event) => onValueChange(event.target.value)} {...props} />{canClear && <Button type="button" variant="ghost" size="icon" className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-sm text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground sm:size-7" aria-label="ล้างคำค้นหา" onClick={() => { onValueChange(""); inputRef.current?.focus(); }}><X className="size-3.5" aria-hidden="true" /></Button>}</div>; }
