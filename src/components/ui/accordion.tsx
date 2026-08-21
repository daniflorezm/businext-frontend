"use client";

import { type ReactNode } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  question: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ question, children, className }: AccordionItemProps) {
  return (
    <Disclosure
      as="div"
      className={cn("border-b border-border-subtle last:border-b-0", className)}
    >
      <DisclosureButton className="flex w-full items-center justify-between gap-3 py-4 text-left text-body font-medium text-foreground transition-colors duration-150 ease-snappy hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span>{question}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-foreground-muted transition-transform duration-150 ease-snappy data-[open]:rotate-180" />
      </DisclosureButton>
      <DisclosurePanel className="pb-4 text-body-sm text-foreground-muted">
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("divide-y-0", className)}>{children}</div>;
}
