"use client";

import React, { useEffect, useRef, useState } from "react";
import { PackageSearch, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { ProductPlaceholder } from "@/components/common/ProductPlaceholder";
import { useProduct } from "@/hooks/useProduct";
import { useGlobalToast } from "@/context/ToastContext";
import { Product } from "@/lib/product/types";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";

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
  const { showToast } = useGlobalToast();

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
          showToast("error", "No se pudo subir la imagen. Intenta de nuevo.");
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

      showToast("success", editing ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      closeModal();
    } catch {
      showToast("error", "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-3">
            <PackageSearch className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-h3 font-bold text-foreground">
              Productos y Servicios
            </h2>
            <p className="text-body-sm text-foreground-muted">
              Gestiona los productos o servicios de tu negocio.
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-body-sm text-foreground-muted">
            Cargando productos...
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Create button */}
            <button
              type="button"
              onClick={openCreate}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all duration-150 ease-snappy min-h-[140px] cursor-pointer group"
            >
              <div className="p-3 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors duration-150 ease-snappy">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-caption font-semibold text-primary">
                Nuevo producto
              </span>
            </button>

            {/* Product cards */}
            {productData.map((product) => (
              <div
                key={product.id}
                className="relative flex flex-col rounded-lg border border-border-subtle bg-surface overflow-hidden hover:border-primary/40 hover:shadow-glow-primary transition-all duration-150 ease-snappy min-h-[140px]"
              >
                {/* Image */}
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <ProductPlaceholder
                    type={product.type ?? "producto"}
                    className="w-full h-28"
                  />
                )}

                {/* Info */}
                <div className="flex flex-col gap-0.5 px-3 py-2 flex-1">
                  <span className="font-semibold text-foreground text-body-sm leading-tight line-clamp-2">
                    {product.name}
                  </span>
                  {product.type && (
                    <span className="text-caption text-primary font-medium capitalize">
                      {product.type}
                    </span>
                  )}
                  <span className="text-body-sm font-bold text-success mt-auto">
                    {Number(product.price).toFixed(2)}€
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="p-1.5 rounded-md bg-surface-overlay hover:bg-surface-raised text-primary hover:text-foreground transition-colors duration-150"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(product.id!)}
                    className="p-1.5 rounded-md bg-surface-overlay hover:bg-danger/15 text-danger transition-colors duration-150"
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
        <Modal open={modalOpen} onClose={closeModal}>
          <ModalHeader onClose={closeModal}>
            {editing ? "Editar producto" : "Nuevo producto"}
          </ModalHeader>
          <ModalContent>
            <form
              id="product-form"
              onSubmit={handleSave}
              className="flex flex-col gap-3"
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-label font-semibold text-foreground-muted">
                  Nombre <span className="text-danger">*</span>
                </label>
                <Input
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej: Corte de cabello"
                  state={error && !form.name.trim() ? "error" : "default"}
                  required
                />
              </div>

              {/* Price + Type row */}
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-label font-semibold text-foreground-muted">
                    Precio <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label font-semibold text-foreground-muted">
                    Tipo
                  </label>
                  <Select
                    value={form.type ?? "producto"}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </Select>
                </div>
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-1">
                <label className="text-label font-semibold text-foreground-muted">
                  Imagen (opcional)
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-16 h-16 rounded-lg object-cover border border-border-subtle"
                    />
                  ) : (
                    <ProductPlaceholder
                      type={form.type ?? "producto"}
                      className="w-16 h-16 rounded-lg border border-dashed border-border"
                    />
                  )}
                  <label className="cursor-pointer px-3 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary text-caption font-medium hover:bg-primary/20 transition-colors duration-150">
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
                      className="text-caption text-danger hover:underline transition-colors duration-150 ease-snappy"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-caption text-foreground-subtle">
                  JPEG, PNG o WEBP - Max 2MB
                </p>
              </div>

              {error && (
                <p className="text-caption text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
            </form>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="product-form"
              variant="primary"
              loading={saving}
            >
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </ModalFooter>
        </Modal>

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
              showToast("success", "Producto eliminado correctamente.");
            }
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </CardContent>
    </Card>
  );
}
