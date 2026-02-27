"use client";
import { useState } from "react";
import { Product } from "@/lib/product/types";
export function useProduct() {
  const [productData, setProductData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const getAllProducts: () => Promise<Product[]> = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProductData(data);
      return data;
    } catch (error) {
      setError(error as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const createProduct: (
    newProduct: Omit<Product, "id">
  ) => Promise<Product> = async (newProduct) => {
    try {
      setLoading(true);
      const response = await fetch("api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      setLoading(true);
      const { id, ...updateData } = product;
      const response = await fetch(`/api/products?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
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
