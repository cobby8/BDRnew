"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
}

export function Checkbox({ className, checked, onCheckedChange, disabled, id }: CheckboxProps) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                "peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50",
                checked ? "bg-slate-900 text-white border-slate-900" : "bg-white",
                className
            )}
            id={id}
        >
            <div className={cn("flex items-center justify-center text-current", checked ? "opacity-100" : "opacity-0")}>
                <Check className="h-4 w-4" />
            </div>
        </button>
    );
}
