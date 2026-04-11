"use client";

import React, { useEffect, useRef, useState } from "react";
import { PackageSearch, Plus, Pencil, Trash2, X, ImageIcon } from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { Product } from "@/lib/product/types";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const EMPTY_FORM: Omit<Product, "id"> = {
  name: "",
  price: 0,
  type: "producto",
  imageUrl: undefined,
};

export function ProductsSection() {
  const {
    productData,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
  } = useProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      type: product.type ?? "producto",
      imageUrl: product.imageUrl,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl ?? null);
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        const uploaded = await uploadProductImage(imageFile);
        if (!uploaded) {
          setError("No se pudo subir la imagen. Intenta de nuevo.");
          setSaving(false);
          return;
        }
        imageUrl = uploaded;
      }

      const payload = { ...form, imageUrl };

      if (editing?.id) {
        await updateProduct({ ...payload, id: editing.id });
      } else {
        await createProduct(payload);
      }

      closeModal();
    } catch {
      setError("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 md:p-8 bg-white/90 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3">
          <PackageSearch className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos y Servicios</h2>
          <p className="text-gray-600">Gestiona los productos o servicios de tu negocio.</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-gray-500 text-sm">Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create button — first item */}
          <button
            type="button"
            onClick={openCreate}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all min-h-[140px] cursor-pointer group"
          >
            <div className="p-3 rounded-full bg-blue-200 group-hover:bg-blue-300 transition">
              <Plus className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-sm font-semibold text-blue-700">Nuevo producto</span>
          </button>

          {/* Product cards */}
          {productData.map((product) => (
            <div
              key={product.id}
              className="relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow min-h-[140px]"
            >
              {/* Image */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-28 object-cover"
                />
              ) : (
                <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col gap-0.5 px-3 py-2 flex-1">
                <span className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                  {product.name}
                </span>
                {product.type && (
                  <span className="text-xs text-blue-600 font-medium capitalize">
                    {product.type}
                  </span>
                )}
                <span className="text-sm font-bold text-green-700 mt-auto">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow text-blue-600 hover:text-blue-800 transition"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(product.id!)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow text-red-500 hover:text-red-700 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? "Editar producto" : "Nuevo producto"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Corte de cabello"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required
                />
              </div>

              {/* Price + Type row */}
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.00"
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Tipo</label>
                  <select
                    value={form.type ?? "producto"}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Imagen (opcional)
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer px-3 py-2 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
                    Subir imagen
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setForm((f) => ({ ...f, imageUrl: undefined }));
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">JPEG, PNG o WEBP · Máx 2MB</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-800 text-sm transition disabled:opacity-70"
                >
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="¿Eliminar este producto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          if (confirmDeleteId !== null) {
            await deleteProduct(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>

  );
}
