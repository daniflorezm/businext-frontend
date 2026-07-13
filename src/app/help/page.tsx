"use client";

import { useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { useAccessContext } from "@/hooks/useAccessContext";
import { Card, CardContent } from "@/components/ui/card";
import { SectionSkeleton } from "@/components/common/SkeletonLoader";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { FAQ_CATEGORIES } from "@/lib/help/faqData";

export default function HelpPage() {
  const { capabilities, context, loading } = useAccessContext();
  const isOwner = context?.role === "owner";

  const visibleCategories = useMemo(() => {
    return FAQ_CATEGORIES.filter((category) => {
      if (category.ownerOnly && !isOwner) return false;
      if (category.cap && !capabilities[category.cap]) return false;
      return true;
    })
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (item.ownerOnly && !isOwner) return false;
          if (item.cap && !capabilities[item.cap]) return false;
          return true;
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [isOwner, capabilities]);

  return (
    <div className="min-h-screen w-full bg-background pt-14 md:pt-0">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-heading text-h2 font-bold text-foreground">
            Ayuda
          </h1>
          <p className="text-body text-foreground-muted mt-1">
            Preguntas frecuentes sobre cómo configurar y usar tu negocio en Businext.
          </p>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <TabGroup>
                <TabList className="flex-wrap">
                  {visibleCategories.map((category) => (
                    <Tab key={category.id}>
                      <span className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </span>
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {visibleCategories.map((category) => (
                    <TabPanel key={category.id}>
                      <Accordion>
                        {category.items.map((item) => (
                          <AccordionItem key={item.question} question={item.question}>
                            {item.answer}
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </TabPanel>
                  ))}
                </TabPanels>
              </TabGroup>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3 bg-surface-raised/60 border border-border-subtle rounded-md px-4 py-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/15 flex-shrink-0">
            <HelpCircle className="h-4 w-4 text-primary" />
          </span>
          <span className="text-body-sm text-foreground-muted">
            ¿No encuentras respuesta a tu duda? Usa el icono{" "}
            <span className="font-semibold text-foreground">
              &quot;Enviar dudas o quejas&quot;
            </span>{" "}
            junto al logo para escribirnos directamente.
          </span>
        </div>
      </div>
    </div>
  );
}
