"use client";

import { Fragment, type ReactNode } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  children,
  className,
}: DrawerProps) {
  const isLeft = side === "left";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-fluid duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-snappy duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </TransitionChild>

        {/* Panel */}
        <div
          className={cn(
            "fixed inset-y-0 flex",
            isLeft ? "left-0" : "right-0"
          )}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-fluid duration-250"
            enterFrom={isLeft ? "-translate-x-full" : "translate-x-full"}
            enterTo="translate-x-0"
            leave="ease-snappy duration-200"
            leaveFrom="translate-x-0"
            leaveTo={isLeft ? "-translate-x-full" : "translate-x-full"}
          >
            <DialogPanel
              className={cn(
                "w-full max-w-sm bg-surface border-border shadow-lg overflow-y-auto",
                isLeft ? "border-r" : "border-l",
                className
              )}
            >
              <div className="flex items-center justify-end p-4">
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-foreground-muted transition-colors duration-150 ease-snappy hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
