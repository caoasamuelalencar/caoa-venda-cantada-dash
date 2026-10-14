"use client";

import { ChevronDown, CircleHelp } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  themedInputClass,
  themedTextMutedClass,
  themedTinyLabelClass,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
type FilterStatusChipVariant = "neutral" | "pending" | "applied";

export function FilterStatusChip({
  children,
  className = "",
  variant = "neutral",
  title,
}: {
  children: ReactNode;
  className?: string;
  variant?: FilterStatusChipVariant;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-normal uppercase tracking-[0.12em] transition-colors",
        variant === "applied" &&
          "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
        variant === "pending" &&
          "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
        variant === "neutral" &&
          "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TooltipIcon({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Ajuda: ${text}`}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-sky-500 transition hover:bg-sky-500/10 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 touch-manipulation dark:text-cyan-300 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-200",
            compact ? "h-6 w-6" : "h-7 w-7",
          )}
        >
          <CircleHelp className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        className="z-[80] w-72 max-w-[calc(100vw-2rem)] px-3 py-2 text-xs leading-5"
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}

export function FilterDateInput({
  value,
  onChange,
  min,
  max,
  className = "",
  ...props
}: Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "min" | "max"
> & {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  const openDatePicker = (target: HTMLInputElement) => {
    const pickerTarget = target as HTMLInputElement & { showPicker?: () => void };
    pickerTarget.showPicker?.();
  };

  return (
    <input
      {...props}
      type="date"
      value={value}
      min={min}
      max={max}
      inputMode="none"
      onClick={(event) => {
        openDatePicker(event.currentTarget);
      }}
      onChange={(event) => onChange(event.target.value)}
      className={cn("cursor-pointer", className)}
    />
  );
}

export function FilterSelectCard({
  label,
  value,
  options,
  onChange,
  tooltip,
  disabled = false,
  formatLabel,
}: {
  label: string;
  value: string[];
  appliedValue?: string[];
  options: string[];
  onChange: (value: string[]) => void;
  tooltip: string;
  disabled?: boolean;
  formatLabel?: (value: string) => string;
}) {
  const displayValue =
    value.length === 0
      ? "Todos"
      : value.length === 1
        ? (formatLabel?.(value[0]) ?? value[0])
        : `${value.length} selecionados`;
  const toggleOption = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...new Set([...value, option])]);
      return;
    }

    onChange(value.filter((item) => item !== option));
  };

  return (
    <div className="min-w-0 rounded-xl bg-slate-50/80 p-2 dark:bg-white/5 sm:p-2.5">
      <div className="flex items-center gap-1.5">
        <p
          className={cn(
            themedTinyLabelClass,
            "min-w-0 flex-1 truncate text-[9px] leading-4 tracking-[0.1em] sm:text-[10px] sm:tracking-[0.14em]",
          )}
        >
          {label}
        </p>
        <TooltipIcon text={tooltip} compact />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            aria-label={`${label}: ${displayValue}`}
            className={cn(
              "mt-1.5 flex h-9 w-full items-center justify-between gap-2 rounded-xl border px-2.5 text-left text-xs outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2",
              themedInputClass,
            )}
          >
            <span className="truncate">{displayValue}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0", themedTextMutedClass)} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="z-[70] max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] min-w-48 overflow-y-auto rounded-xl p-1.5"
        >
          <DropdownMenuLabel className="px-2 py-1 text-xs">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={value.length === 0}
            onCheckedChange={() => onChange([])}
          >
            Todos
          </DropdownMenuCheckboxItem>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={value.includes(option)}
              onCheckedChange={(checked) => toggleOption(option, checked === true)}
            >
              {formatLabel?.(option) ?? option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
