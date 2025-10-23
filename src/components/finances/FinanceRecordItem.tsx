"use client";
import React, { useState, useEffect } from "react";
import { DeleteFinancesRecordModal } from "@/components/finances/DeleteFinancesRecordModal";
import { useFinances } from "@/hooks/useFinances";
import { Finances } from "@/lib/finances/types";
export const FinanceRecordItem = (financeRecord: Finances) => {
  const { concept, amount, creator, type, created_at, id } = financeRecord;
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(!openDeleteModal);
  };
  const { deleteFinance } = useFinances();
  const dateFormatted = new Date(created_at ? created_at : "");

  const imageSelected = type === "INCOME" ? "/arrow-up.png" : "/arrow-down.png";

  return (
    <div className="w-full">
      <div
        className={`w-full max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center bg-white/95 p-5 md:p-6 rounded-2xl shadow-xl border ${
          type === "INCOME" ? "border-green-200" : "border-red-200"
        } transition-all duration-300 mb-4 hover:shadow-2xl hover:scale-[1.012]`}
      >
        {/* Left: Icon and Info */}
        <div className="flex items-center gap-4 w-full md:w-auto mb-3 md:mb-0">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md border-2 ${
              type === "INCOME"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <img src={imageSelected} alt="Finance Icon" className="w-7 h-7" />
          </div>
          <div className="flex flex-col ml-2">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 tracking-tight mb-1">
              {concept}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Emisor: {creator}
            </p>
          </div>
        </div>
        {/* Right: Amount, Date, Delete */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 w-full md:w-auto justify-end">
          <span
            className={`$ {
              type === "INCOME" ? "text-green-600" : "text-red-600"
            } font-extrabold text-lg md:text-xl drop-shadow-sm`}
          >
            {amount}€
          </span>
          <span className="text-xs text-gray-400 font-semibold">
            {dateFormatted.toLocaleDateString("es-ES")}
          </span>
          <button
            onClick={() => setOpenDeleteModal(true)}
            type="button"
            className="ml-2 p-2 rounded-full hover:bg-red-100 transition"
            title="Eliminar registro"
          >
            <img
              src="/delete-icon.png"
              alt="trash icon"
              className="h-6 w-6 hover:scale-110 transition-transform"
            />
          </button>
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
