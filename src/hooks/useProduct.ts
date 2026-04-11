"use client";
import useSWR from "swr";
import { Product } from "@/lib/product/types";
import { fetcher } from "@/lib/fetcher";

const SWR_KEY = "/api/products";

function mapProduct(data: Record<string, unknown>): Product {
  return {
    id: data.id as number,
    name: data.name as string,
    price: data.price as number,
    type: data.type as string | undefined,
    imageUrl: data.image_url as string | undefined,
  };
}

function toApiBody(product: Omit<Product, "id">) {
  return {
    name: product.name,
    price: product.price,
    type: product.type ?? null,
    image_url: product.imageUrl ?? null,
  };
}

export function useProduct() {
  const {
    data: rawData = [],
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Record<string, unknown>[]>(SWR_KEY, fetcher);

  const productData: Product[] = rawData.map(mapProduct);

  const getAllProducts = () => mutate();

  const createProduct = async (
    newProduct: Omit<Product, "id">
  ): Promise<Product | null> => {
    const body = toApiBody(newProduct);
    const tempId = -Date.now();
    const optimisticItem: Record<string, unknown> = { ...body, id: tempId };

    try {
      await mutate(
        async (current: Record<string, unknown>[] = []) => {
          const response = await fetch("/api/products", {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to create product");
          const data = await response.json();
          return [...current.filter((p) => p.id !== tempId), data];
        },
        {
          optimisticData: (current: Record<string, unknown>[] = []) => [
            ...current,
            optimisticItem,
          ],
          rollbackOnError: true,
          revalidate: false,
        }
      );
      return newProduct as Product;
    } catch {
      return null;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await mutate(
        async (current: Record<string, unknown>[] = []) => {
          const response = await fetch(`/api/products?id=${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to delete product");
          return current.filter((p) => p.id !== id);
        },
        {
          optimisticData: (current: Record<string, unknown>[] = []) =>
            current.filter((p) => p.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch {
      return null;
    }
  };

  const updateProduct = async (product: Product) => {
    const { id, ...rest } = product;
    const body = toApiBody(rest);

    try {
      await mutate(
        async (current: Record<string, unknown>[] = []) => {
          const response = await fetch(`/api/products?id=${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to update product");
          const updated = await response.json();
          return current.map((p) => (p.id === id ? updated : p));
        },
        {
          optimisticData: (current: Record<string, unknown>[] = []) =>
            current.map((p) => (p.id === id ? { ...p, ...body, id } : p)),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    } catch {
      return null;
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Error al subir la imagen");
      }
      const { url } = await response.json();
      return url as string;
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
    uploadProductImage,
  };
}
