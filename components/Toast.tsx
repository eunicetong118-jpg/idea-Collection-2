"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  isLG2?: boolean;
}

export default function Toast({ message, type, onClose, duration = 3000, isLG2 = false }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-300 pointer-events-none">
      <div
        className={clsx(
          "flex items-center gap-4 px-8 py-5 rounded-full shadow-2xl border-none min-w-[320px] pointer-events-auto",
          isLG2 ? "lg2-glass-board" : "bg-white shadow-paper-shadow",
          type === "success"
            ? (isLG2 ? "text-slate-800" : "bg-white text-emerald-900")
            : (isLG2 ? "text-red-800" : "bg-white text-red-900")
        )}
      >
        {type === "success" ? (
          <div className={clsx("p-1 rounded-full", isLG2 ? "bg-teal-50" : "bg-emerald-50")}>
            <CheckCircle2 className={clsx("shrink-0", isLG2 ? "text-teal-500" : "text-emerald-500")} size={20} />
          </div>
        ) : (
          <div className="p-1 bg-red-50 rounded-full">
            <XCircle className="text-red-500 shrink-0" size={20} />
          </div>
        )}

        <p className="flex-1 font-bold text-sm tracking-tight">{message}</p>

        <button
          onClick={onClose}
          className={clsx("transition-colors p-1", isLG2 ? "text-slate-300 hover:text-slate-600" : "text-lab-text/20 hover:text-lab-text")}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
