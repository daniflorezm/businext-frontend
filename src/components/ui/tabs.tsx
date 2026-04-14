"use client";

import { type ReactNode } from "react";
import {
  TabGroup as HeadlessTabGroup,
  TabList as HeadlessTabList,
  Tab as HeadlessTab,
  TabPanels as HeadlessTabPanels,
  TabPanel as HeadlessTabPanel,
} from "@headlessui/react";
import { cn } from "@/lib/utils";

interface TabGroupProps {
  children: ReactNode;
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function TabGroup({
  children,
  defaultIndex,
  selectedIndex,
  onChange,
  className,
}: TabGroupProps) {
  return (
    <HeadlessTabGroup
      defaultIndex={defaultIndex}
      selectedIndex={selectedIndex}
      onChange={onChange}
      className={className}
    >
      {children}
    </HeadlessTabGroup>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <HeadlessTabList
      className={cn(
        "flex gap-1 border-b border-border-subtle",
        className
      )}
    >
      {children}
    </HeadlessTabList>
  );
}

interface TabProps {
  children: ReactNode;
  className?: string;
}

export function Tab({ children, className }: TabProps) {
  return (
    <HeadlessTab
      className={cn(
        "px-4 py-2.5 text-body-sm font-medium transition-colors duration-150 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "text-foreground-muted hover:text-foreground",
        "border-b-2 border-transparent data-[selected]:border-primary data-[selected]:text-foreground",
        className
      )}
    >
      {children}
    </HeadlessTab>
  );
}

interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export function TabPanels({ children, className }: TabPanelsProps) {
  return (
    <HeadlessTabPanels className={cn("mt-4", className)}>
      {children}
    </HeadlessTabPanels>
  );
}

interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <HeadlessTabPanel
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
        className
      )}
    >
      {children}
    </HeadlessTabPanel>
  );
}
