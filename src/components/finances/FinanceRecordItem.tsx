"use client";
import React, { useState } from "react";
import { DeleteFinancesRecordModal } from "@/components/finances/DeleteFinancesRecordModal";
import { useFinances } from "@/hooks/useFinances";
import { FinanceRecordItemProps } from "@/lib/finances/types";
import { Trash2, TrendingUp, TrendingDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const FinanceRecordItem = (financeRecord: FinanceRecordItemProps) => {
  const { concept, amount, creator, type, created_at, id, customerName } =
    financeRecord;
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };
  const { deleteFinance } = useFinances();
  const dateFormatted = new Date(created_at ? created_at : "");

  const isIncome = type === "INCOME";

  return (
    <div className="w-full">
      <div
        className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface p-4 sm:p-5 rounded-lg border-l-4 ${
          isIncome ? "border-success" : "border-danger"
        } border border-l-4 border-border-subtle transition-all duration-150 ease-snappy hover:bg-surface-raised`}
      >
        {/* Left: Icon and Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0 min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
              isIncome ? "bg-success/15" : "bg-danger/15"
            }`}
          >
            {isIncome ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-body-sm font-semibold text-foreground truncate">
              {concept}
            </h2>
            <p className="text-caption text-foreground-muted">
              Emisor: {creator}
            </p>
            {customerName && (
              <p className="text-caption text-primary flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {customerName}
              </p>
            )}
          </div>
        </div>
        {/* Right: Amount, Date, Delete */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3">
            <span
              className={`font-bold text-body ${
                isIncome ? "text-success" : "text-danger"
              }`}
            >
              {amount}&euro;
            </span>
            <Badge variant="muted">
              {dateFormatted.toLocaleDateString("es-ES")}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenDeleteModal(true)}
            title="Eliminar registro"
            className="text-foreground-muted hover:text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {openDeleteModal && (
        <DeleteFinancesRecordModal
          concept={concept}
          deleteFinanceRecord={deleteFinance}
          handleOpenDeleteModal={handleOpenDeleteModal}
          id={id!}
          openDeleteModal={openDeleteModal}
        />
      )}
    </div>
  );
};
