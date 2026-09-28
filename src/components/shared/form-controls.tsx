"use client";

import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NumberInput(props: Omit<ComponentProps<typeof Input>, "type">) { return <Input type="number" inputMode="decimal" {...props} />; }
export function CurrencyInput({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) { return <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span><Input type="number" inputMode="decimal" step="0.01" className={cn("pl-8 text-right tabular-nums", className)} {...props} /></div>; }
export function DateInput(props: Omit<ComponentProps<typeof Input>, "type">) { return <Input type="date" {...props} />; }

type ComboboxProps = Omit<ComponentProps<typeof Input>, "list"> & { options: Array<{ value: string; label: string }> };
export function Combobox({ options, ...props }: ComboboxProps) { const id = useId(); return <><Input list={id} role="combobox" autoComplete="off" {...props} /><datalist id={id}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</datalist></>; }

type RadioGroupProps = { name: string; value?: string; defaultValue?: string; onChange?: (value: string) => void; options: Array<{ value: string; label: string; disabled?: boolean }>; disabled?: boolean };
export function RadioGroup({ name, value, defaultValue, onChange, options, disabled }: RadioGroupProps) { return <div role="radiogroup" className="flex flex-wrap gap-x-4 gap-y-2">{options.map((option) => <label key={option.value} className="flex items-center gap-2 text-sm"><input type="radio" name={name} value={option.value} checked={value !== undefined ? value === option.value : undefined} defaultChecked={value === undefined ? defaultValue === option.value : undefined} disabled={disabled || option.disabled} onChange={(event) => onChange?.(event.target.value)} className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" /><span>{option.label}</span></label>)}</div>; }
