"use client";

import { Fragment, useState } from "react";
import { useGlobalToast } from "@/context/ToastContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CalendarDays,
  ChartBarBig,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircleQuestion,
  Star,
  Brain,
} from "lucide-react";
import { useAccessContext } from "@/hooks/useAccessContext";
import { logout } from "@/app/login/logout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";

const NAV_LINKS = [
  {
    href: "/reservation",
    label: "Reservas",
    icon: CalendarDays,
    cap: "canManageReservations" as const,
  },
  {
    href: "/finances",
    label: "Finanzas",
    icon: ChartBarBig,
    cap: "canManageFinances" as const,
  },
  {
    href: "/reviews",
    label: "Reseñas",
    icon: Star,
    cap: "canManageFinances" as const,
  },
  {
    href: "/intelligence",
    label: "Inteligencia",
    icon: Brain,
    cap: "canManageTeam" as const,
  },
  {
    href: "/configuration",
    label: "Configuración",
    icon: Settings,
    cap: "canManageConfiguration" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { context, capabilities } = useAccessContext();
  const { showToast } = useGlobalToast();
  const [open, setOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);

  const displayName =
    context?.profile?.displayName ||
    context?.profile?.email ||
    "Usuario";

  const roleLabel =
    context?.role === "owner"
      ? "Owner"
      : context?.role === "manager"
      ? "Manager"
      : "Empleado";

  const sendContactEmail = async () => {
    setSending(true);
    try {
      await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contactMessage }),
      });
      showToast("success", "¡Mensaje enviado!");
      setContactMessage("");
      setShowContact(false);
    } catch {
      showToast("error", "Error al enviar el mensaje. Intenta de nuevo.");
    }
    setSending(false);
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border-subtle">
        <span className="font-heading text-h4 font-bold text-foreground tracking-tight select-none">
          Businext
        </span>
        <button
          type="button"
          onClick={() => setShowContact(true)}
          className="ml-1 rounded-md p-1 text-foreground-muted transition-colors duration-150 ease-snappy hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Enviar dudas o quejas"
        >
          <MessageCircleQuestion className="h-5 w-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon, cap }) => {
          if (!capabilities[cap]) return null;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-body-sm font-medium transition-all duration-150 ease-snappy",
                active
                  ? "bg-primary/20 text-foreground border-l-2 border-primary shadow-sm"
                  : "text-foreground-muted hover:bg-surface-raised hover:text-accent"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-border-subtle flex flex-col gap-2">
        <div className="px-4 py-2 rounded-lg bg-surface-raised">
          <p className="text-body-sm font-semibold text-foreground truncate">
            {displayName}
          </p>
          <p className="text-caption text-foreground-muted">{roleLabel}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-body-sm font-medium text-danger transition-colors duration-150 ease-snappy hover:bg-danger/10"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle fixed top-0 left-0 h-full z-30">
        {navContent}
      </aside>

      {/* Mobile: hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-surface shadow-md border border-border text-foreground"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: sliding sidebar via Headless UI Dialog */}
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50 md:hidden">
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

          {/* Sliding panel */}
          <div className="fixed inset-y-0 left-0 flex">
            <TransitionChild
              as={Fragment}
              enter="ease-fluid duration-250"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-snappy duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="w-72 bg-surface shadow-lg flex flex-col">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 rounded-md p-1.5 text-foreground-muted transition-colors duration-150 ease-snappy hover:bg-surface-raised hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
                {navContent}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Contact modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)}>
        <ModalHeader onClose={() => setShowContact(false)}>
          Enviar dudas o quejas
        </ModalHeader>
        <ModalContent>
          <p className="text-body-sm text-foreground-muted mb-4">
            ¿Tienes alguna duda, sugerencia o queja? Escríbenos aquí:
          </p>
          <textarea
            className="flex w-full min-h-[80px] rounded-md border border-input bg-surface px-3 py-2 text-body-sm text-foreground placeholder:text-foreground-subtle transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Escribe tu mensaje..."
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            disabled={sending}
          />
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowContact(false)}
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={sendContactEmail}
            disabled={sending || !contactMessage.trim()}
            loading={sending}
          >
            Enviar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
