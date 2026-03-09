"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import clsx from "clsx";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div
        className={clsx(
          "flex items-center gap-4 px-8 py-5 rounded-full shadow-2xl border-none min-w-[320px] shadow-paper-shadow",
          type === "success"
            ? "bg-white text-emerald-900"
            : "bg-white text-red-900"
        )}
      >
        {type === "success" ? (
          <div className="p-1 bg-emerald-50 rounded-full">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
          </div>
        ) : (
          <div className="p-1 bg-red-50 rounded-full">
            <XCircle className="text-red-500 shrink-0" size={20} />
          </div>
        )}

        <p className="flex-1 font-bold text-sm tracking-tight">{message}</p>

        <button
          onClick={onClose}
          className="text-lab-text/20 hover:text-lab-text transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
