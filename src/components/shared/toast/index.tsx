"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import successIcon from '@/assets/icons/dashboards/success-toast-icon.svg'
import errorIcon from '@/assets/icons/dashboards/error-toast-icon.svg'
import Image from "next/image";

export type ToastType = "success" | "error";

export type ToastAction = {
  id: string;
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  id?: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  actions?: ToastAction[];
};

type ToastInternal = Required<Pick<ToastOptions, "id" | "type" | "title">> & {
  description?: string;
  duration: number;
  actions?: ToastAction[];
};

const ToastCtx = createContext<{
  show: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
} | null>(null);

export function useToast(): {
  show: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
} {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const idSeq = useRef(0);

  // Set isMounted to true when component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? `t_${++idSeq.current}`;
    const duration = opts.duration ?? 5000;
    
    const next: ToastInternal = {
      id,
      type: opts.type,
      title: opts.title,
      description: opts.description,
      actions: opts.actions,
      duration,
    };
    
    setToasts((prev) => [...prev, next]);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const contextValue = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastCtx.Provider value={contextValue}>
      {children}
      {isMounted && createPortal(
        <ToastViewport toasts={toasts} onDismiss={dismiss} />, 
        document.body
      )}
    </ToastCtx.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: ToastInternal[]; onDismiss: (id: string) => void }) {
  // Don't render anything if there are no toasts
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex justify-center">
      <ul className="flex w-full flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.li
              key={t.id}
              initial={{ y: -100, opacity: 0, scale: 0.8, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ x: 300, opacity: 0, scale: 0.5, rotate: 15 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 24,
                opacity: { duration: 0.2 }
              }}
              className="pointer-events-auto"
            >
              <ToastCard toast={t} onClose={() => onDismiss(t.id)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastInternal; onClose: () => void }) {
  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? successIcon : errorIcon;

  return (
    <div
      className="border shadow-sm px-2 py-2 w-full bg-[#FFFFFF] border-[#D0D5DD] rounded-[12px] shadow-[0px_1px_2px_0px_#1018280D]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-2">
          <Image src={Icon} alt="" width={20} height={20} />
       
          <div className="flex-1">
            <div className="text-[#344054] font-medium text-[14px] leading-[20px]">{toast.title}</div>
            {toast.description ? (
              <p className="text-[14px] text-[#667085] font-normal">{toast.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toast.actions?.map((a) => (
            <button
              key={a.id}
              onClick={a.onClick}
              className={[
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                isSuccess
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "border-rose-300 text-rose-700 hover:bg-rose-100",
              ].join(" ")}
            >
              {a.label}
            </button>
          ))}
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-black/5"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}