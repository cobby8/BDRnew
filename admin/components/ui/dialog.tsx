"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setVisible(false), 300); // Wait for animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className={cn(
                "relative bg-white rounded-[28px] w-full max-w-2xl p-8 shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar",
                isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            )}>
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-50">
                    <h2 className="text-2xl font-bold text-[#191F28] tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
