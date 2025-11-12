import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useFinances } from "@/hooks/useFinances";
import {
  FinancesModalProps,
  Finances,
  FinancesTypeOptions,
} from "@/lib/finances/types";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  FinancesInput,
  FinancesInputError,
  FinancesInputSelect,
} from "@/components/finances/FinancesInputs";

export const FinancesModal = ({
  isOpen,
  handleOpenModal,
}: FinancesModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Finances>();
  const { createFinance, loading } = useFinances();

  const onSubmit: SubmitHandler<Finances> = async (data: Finances) => {
    data = { ...data, reservation_id: null };
    const result = await createFinance(data);
    window.location.reload();
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => handleOpenModal()}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-2 sm:p-4 bg-black/30 z-50">
        <DialogPanel className="w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 bg-white p-4 sm:p-8 space-y-6">
          <DialogTitle className="text-2xl font-bold text-purple-700 text-center mb-2">
            Crear registro financiero
          </DialogTitle>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FinancesInput
              label="concept"
              register={register}
              required={true}
            />
            <FinancesInputError
              error={errors.concept}
              message="Indica un concepto"
            />
            <FinancesInput
              label="amount"
              register={register}
              required={true}
              type="number"
            />
            <FinancesInputError
              error={errors.amount}
              message="Indica un monto"
            />
            <FinancesInputSelect
              label="type"
              register={register}
              required={true}
              options={FinancesTypeOptions}
            />
            <FinancesInputError
              error={errors.type}
              message="Indica tipo de registro financiero"
            />
            <FinancesInput
              label="creator"
              register={register}
              required={true}
            />
            <FinancesInputError
              error={errors.creator}
              message="Indica el emisor del registro"
            />
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow hover:from-gray-400 hover:to-gray-500 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow hover:from-green-500 hover:to-green-700 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
