"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState, type ChangeEvent, type ComponentProps, type FocusEvent, type KeyboardEvent, type Ref } from "react";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<ComponentProps<"input">, "type" | "value" | "defaultValue" | "min" | "max"> & {
  value?: string;
  defaultValue?: string;
  min?: string | number;
  max?: string | number;
  containerClassName?: string;
};

const weekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const monthFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", { month: "long", year: "numeric" });
const displayFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", { day: "2-digit", month: "short", year: "numeric" });
const accessibleFormatter = new Intl.DateTimeFormat("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" });

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) { if (typeof ref === "function") ref(value); else if (ref) ref.current = value; }
function parseDate(value?: string) { if (!value) return null; const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); if (!match) return null; const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])); return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null; }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addDays(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount); }
function addMonths(date: Date, amount: number) { const target = new Date(date.getFullYear(), date.getMonth() + amount, 1); const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate(); return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay)); }
function calendarDays(month: Date) { const first = startOfMonth(month); const start = addDays(first, -first.getDay()); return Array.from({ length: 42 }, (_, index) => addDays(start, index)); }
function isUnavailable(value: string, min?: string, max?: string) { return Boolean((min && value < min) || (max && value > max)); }
function displayDate(value: string) { const date = parseDate(value); return date ? displayFormatter.format(date) : ""; }

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  className,
  containerClassName,
  defaultValue = "",
  disabled,
  id,
  max,
  min,
  name,
  onBlur,
  onChange,
  placeholder = "เลือกวันที่",
  readOnly,
  required,
  value,
  ...inputProps
}, forwardedRef) {
  const generatedId = useId();
  const isRequired = required || ariaRequired === true || ariaRequired === "true";
  const triggerId = id ?? `date-input-${generatedId}`;
  const dialogId = `${triggerId}-calendar`;
  const controlled = value !== undefined;
  const minValue = min === undefined ? undefined : String(min);
  const maxValue = max === undefined ? undefined : String(max);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const selectedDate = parseDate(selectedValue);
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate ?? new Date()));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const today = new Date();
  const todayValue = dateKey(today);
  const days = calendarDays(viewMonth);

  function setInputRef(node: HTMLInputElement | null) { inputRef.current = node; assignRef(forwardedRef, node); }
  function emitChange(nextValue: string) { if (!controlled) setInternalValue(nextValue); const input = inputRef.current; if (input) { input.value = nextValue; onChange?.({ target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>); } }
  function focusDate(date: Date) { const key = dateKey(date); window.requestAnimationFrame(() => wrapperRef.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus()); }
  function openCalendar() { if (disabled || readOnly) return; const initial = selectedDate ?? (!isUnavailable(todayValue, minValue, maxValue) ? today : parseDate(minValue) ?? parseDate(maxValue) ?? today); setViewMonth(startOfMonth(initial)); const rect = wrapperRef.current?.getBoundingClientRect(); setAlignRight(Boolean(rect && rect.left + 320 > window.innerWidth - 16)); setOpen(true); focusDate(initial); }
  function closeCalendar(focusTrigger = false) { setOpen(false); if (focusTrigger) window.requestAnimationFrame(() => triggerRef.current?.focus()); }
  function selectDate(date: Date) { const nextValue = dateKey(date); if (isUnavailable(nextValue, minValue, maxValue)) return; emitChange(nextValue); closeCalendar(true); }
  function clearDate() { emitChange(""); closeCalendar(true); }
  function reportBlur(event: FocusEvent<HTMLDivElement>) { if (event.currentTarget.contains(event.relatedTarget)) return; closeCalendar(); const input = inputRef.current; if (input) onBlur?.({ target: input, currentTarget: input } as FocusEvent<HTMLInputElement>); }
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, date: Date) { let next: Date | null = null; if (event.key === "ArrowLeft") next = addDays(date, -1); if (event.key === "ArrowRight") next = addDays(date, 1); if (event.key === "ArrowUp") next = addDays(date, -7); if (event.key === "ArrowDown") next = addDays(date, 7); if (event.key === "Home") next = addDays(date, -date.getDay()); if (event.key === "End") next = addDays(date, 6 - date.getDay()); if (event.key === "PageUp") next = addMonths(date, -1); if (event.key === "PageDown") next = addMonths(date, 1); if (!next) return; event.preventDefault(); setViewMonth(startOfMonth(next)); focusDate(next); }

  useEffect(() => { if (!open) return; function handlePointerDown(event: PointerEvent) { if (!wrapperRef.current?.contains(event.target as Node)) closeCalendar(); } function handleKeyDown(event: globalThis.KeyboardEvent) { if (event.key === "Escape") { event.preventDefault(); closeCalendar(true); } } document.addEventListener("pointerdown", handlePointerDown); document.addEventListener("keydown", handleKeyDown); return () => { document.removeEventListener("pointerdown", handlePointerDown); document.removeEventListener("keydown", handleKeyDown); }; }, [open]);

  const previousMonth = addMonths(viewMonth, -1);
  const nextMonth = addMonths(viewMonth, 1);
  const previousDisabled = Boolean(minValue && dateKey(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0)) < minValue);
  const nextDisabled = Boolean(maxValue && dateKey(nextMonth) > maxValue);

  return <div ref={wrapperRef} className={cn("relative w-full", containerClassName)} onBlurCapture={reportBlur}>
    <input {...inputProps} ref={setInputRef} type="hidden" name={name} value={selectedValue} disabled={disabled} readOnly />
    <button ref={triggerRef} id={triggerId} type="button" role="combobox" className={cn("flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-1 text-left text-base shadow-xs transition-[color,background-color,border-color,box-shadow] focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:outline-danger sm:h-9 sm:text-sm", !selectedValue && "text-muted-foreground", className)} disabled={disabled} aria-controls={dialogId} aria-describedby={ariaDescribedBy} aria-expanded={open} aria-haspopup="dialog" aria-invalid={ariaInvalid} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} aria-readonly={readOnly || undefined} aria-required={isRequired || undefined} onClick={() => open ? closeCalendar() : openCalendar()}>
      <span className="min-w-0 truncate tabular-nums">{selectedValue ? displayDate(selectedValue) : placeholder}</span>
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
    {open && <><div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] sm:hidden" aria-hidden="true" /><div id={dialogId} role="dialog" aria-modal="false" aria-label="เลือกวันที่" className={cn("fixed right-4 left-4 top-1/2 z-50 w-auto -translate-y-1/2 rounded-md border border-border/80 bg-popover p-3 text-popover-foreground shadow-md sm:absolute sm:top-full sm:mt-1 sm:w-80 sm:max-w-[calc(100vw-2rem)] sm:translate-y-0", alignRight ? "sm:right-0 sm:left-auto" : "sm:right-auto sm:left-0")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40" aria-label="เดือนก่อนหน้า" disabled={previousDisabled} onClick={() => setViewMonth(previousMonth)}><ChevronLeft className="size-4" aria-hidden="true" /></button>
        <p className="text-sm font-semibold">{monthFormatter.format(viewMonth)}</p>
        <button type="button" className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40" aria-label="เดือนถัดไป" disabled={nextDisabled} onClick={() => setViewMonth(nextMonth)}><ChevronRight className="size-4" aria-hidden="true" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">{weekdays.map((day) => <span key={day} className="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground">{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{days.map((date) => { const key = dateKey(date); const selected = key === selectedValue; const current = key === todayValue; const outside = date.getMonth() !== viewMonth.getMonth(); const unavailable = isUnavailable(key, minValue, maxValue); return <button key={key} type="button" data-date={key} className={cn("relative flex size-9 items-center justify-center rounded-sm text-sm tabular-nums transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring", outside && "text-muted-foreground/60", current && !selected && "font-semibold text-primary ring-1 ring-primary/35", selected && "bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground", unavailable && "pointer-events-none opacity-30")} disabled={unavailable} aria-label={accessibleFormatter.format(date)} aria-current={current ? "date" : undefined} aria-pressed={selected} onClick={() => selectDate(date)} onKeyDown={(event) => moveFocus(event, date)}>{date.getDate()}</button>; })}</div>
      <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
        {!isRequired ? <button type="button" className="rounded-sm px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50" disabled={!selectedValue} onClick={clearDate}>ล้าง</button> : <span />}
        <button type="button" className="rounded-sm px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40" disabled={isUnavailable(todayValue, minValue, maxValue)} onClick={() => selectDate(today)}>วันนี้</button>
      </div>
    </div></>}
  </div>;
});

export { DateInput };
