"use client";
import useSWR from "swr";
import { Product } from "@/lib/product/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/products";

export function useProduct() {
  const {
    data: productData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Product[]>(SWR_KEY, fetcher);

  const getAllProducts = () => mutate();

  const createProduct = async (
    newProduct: Omit<Product, "id">
  ): Promise<Product | null> => {
    try {
      const response = await fetch("api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create product");
      const data = await response.json();
      await mutate();
      return data;
    } catch {
      return null;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete product");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { id, ...updateData } = product;
      const response = await fetch(`/api/products?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update product");
      await mutate();
      return response.json();
    } catch {
      return null;
    }
  };

  return {
    productData,
    loading,
    error,
    getAllProducts,
    createProduct,
    deleteProduct,
    updateProduct,
  };
}
