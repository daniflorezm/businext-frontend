"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { PackageSearch } from "lucide-react";
import { Product } from "@/lib/product/types";
import { useProduct } from "@/hooks/useProduct";
import SkeletonLoader from "@/components/common/SkeletonLoader";

export default function ProductsPage() {
  const {
    productData,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
  } = useProduct();
  const { register, setValue, control, handleSubmit } = useForm<{
    products: Product[];
  }>({
    defaultValues: { products: [{ name: "", price: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({
    name: "products",
    control,
  });

  const addProduct = () => {
    if (append) {
      append({ name: "", price: 0 });
    }
  };

  const removeProduct = (index: number) => {
    if (remove) {
      remove(index);
    }
  };
  const onSubmit: SubmitHandler<{ products: Product[] }> = (data) => {
    data.products.forEach((product) => {
      if (product.name == "") return;
      if (product.id) {
        updateProduct(product);
      } else {
        createProduct(product);
      }
    });
    const elementsToDelete = productData.filter((p) => {
      return !data.products.some((dp) => dp.id === p.id);
    });
    elementsToDelete.forEach((product) => {
      deleteProduct(product.id!);
    });
  };

  useEffect(() => {
    getAllProducts();
  }, []);
  useEffect(() => {
    if (productData.length > 0) {
      setValue("products", productData);
    }
  }, [productData]);

  if (loading) {
    return <SkeletonLoader />;
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full min-h-screen py-10 px-2 sm:px-4 md:px-8 items-center gap-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 drop-shadow-sm">
          Configuración de Productos
        </h1>
        <p className="text-lg md:text-2xl text-center text-gray-600 max-w-2xl">
          Configura los productos o servicios de tu negocio
        </p>
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200">
          <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                <PackageSearch className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Productos o servicios
                </h2>
                <p className="text-gray-500 text-sm md:text-base">
                  Incluye cada producto o servicio con su precio
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl font-semibold bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow hover:from-orange-500 hover:to-orange-700 transition px-4 py-2 text-base md:text-lg"
              onClick={addProduct}
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {(fields.length > 0 ? fields : [{}]).map((field, index) => (
              <div
                className="w-full bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-4"
                key={"id" in field ? field.id : index}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base md:text-lg font-bold text-blue-700">
                    Producto/Servicio
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="hover:scale-110 transition"
                  >
                    <img
                      src="/trash-icon.svg"
                      alt="Eliminar"
                      className="h-6 w-6"
                    />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    {...register(`products.${index}.name`)}
                    placeholder="Producto o servicio"
                    defaultValue=""
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-800 text-base md:text-lg"
                  />
                  <input
                    {...register(`products.${index}.price`)}
                    placeholder="Precio"
                    defaultValue=""
                    className="w-full sm:w-40 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-800 text-base md:text-lg"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center w-full">
          <button
            type="submit"
            className="rounded-xl px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:from-blue-600 hover:to-blue-800 transition text-lg md:text-xl mt-4"
          >
            Guardar Productos
          </button>
        </div>
      </div>
    </form>
  );
}
