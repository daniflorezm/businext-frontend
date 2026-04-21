"use client";

import { useState, useCallback } from "react";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleReview } from "@/lib/google-reviews/types";

type AiResponseEditorProps = {
  review: GoogleReview;
  onGenerate: (reviewId: number) => Promise<string | null>;
  generating: boolean;
};

export function AiResponseEditor({
  review,
  onGenerate,
  generating,
}: AiResponseEditorProps) {
  const [response, setResponse] = useState(review.aiGeneratedResponse || "");
  const [showEditor, setShowEditor] = useState(!!review.aiGeneratedResponse);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setShowEditor(true);
    const result = await onGenerate(review.id);
    if (result) setResponse(result);
  }, [onGenerate, review.id]);

  const handleCopy = useCallback(async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  if (!showEditor) {
    return (
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-caption font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/10 transition-all disabled:opacity-50"
      >
        {generating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Generar respuesta
      </button>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border-subtle">
      <p className="text-caption font-semibold text-foreground flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> Respuesta generada por IA
      </p>

      {generating ? (
        <div className="flex items-center gap-2 py-4 text-body-sm text-foreground-muted">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Generando respuesta...
        </div>
      ) : (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={4}
            className="w-full bg-surface-raised border border-border-subtle rounded-xl p-4 text-body-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
