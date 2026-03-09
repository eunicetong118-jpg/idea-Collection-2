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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={clsx(
          "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px]",
          type === "success"
            ? "bg-white border-emerald-100 text-emerald-900"
            : "bg-white border-red-100 text-red-900"
        )}
      >
        {type === "success" ? (
          <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
        ) : (
          <XCircle className="text-red-500 shrink-0" size={24} />
        )}

        <p className="flex-1 font-semibold text-sm">{message}</p>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
