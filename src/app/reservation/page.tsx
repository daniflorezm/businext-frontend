"use client";

import { useState, useMemo } from "react";
import { useReservation } from "@/hooks/useReservation";
import { useProduct } from "@/hooks/useProduct";
import { Reservation } from "@/lib/reservation/types";
import { Product } from "@/lib/product/types";
import { ServiceCard } from "@/components/reservation/ServiceCard";
import { BookingForm } from "@/components/reservation/BookingForm";
import { ReservationCard } from "@/components/reservation/ReservationCard";
import { 
  Sparkles, 
  CalendarDays, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Clock,
  Users
} from "lucide-react";

// Datos de mockup para productos/servicios
const mockProducts: Product[] = [
  { id: 1, name: "Corte de cabello", price: 25000, type: "service", imageUrl: "" },
  { id: 2, name: "Tinte completo", price: 85000, type: "service", imageUrl: "" },
  { id: 3, name: "Manicure", price: 20000, type: "service", imageUrl: "" },
  { id: 4, name: "Pedicure", price: 25000, type: "service", imageUrl: "" },
  { id: 5, name: "Tratamiento capilar", price: 45000, type: "service", imageUrl: "" },
  { id: 6, name: "Masaje relajante", price: 60000, type: "service", imageUrl: "" },
  { id: 7, name: "Shampoo premium", price: 35000, type: "product", imageUrl: "" },
  { id: 8, name: "Acondicionador", price: 32000, type: "product", imageUrl: "" },
  { id: 9, name: "Aceite capilar", price: 28000, type: "product", imageUrl: "" },
];

// Datos de mockup para reservas
const today = new Date();
const mockReservations: Reservation[] = [
  {
    id: 1,
    customerName: "Maria Garcia",
    inCharge: "Carlos Martinez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Corte de cabello",
  },
  {
    id: 2,
    customerName: "Juan Rodriguez",
    inCharge: "Ana Lopez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30).toISOString(),
    timePerReservation: 120,
    status: "PENDING",
    service: "Tinte completo",
  },
  {
    id: 3,
    customerName: "Laura Sanchez",
    inCharge: "Carlos Martinez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Manicure",
  },
  {
    id: 4,
    customerName: "Pedro Hernandez",
    inCharge: "Ana Lopez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30).toISOString(),
    timePerReservation: 90,
    status: "PENDING",
    service: "Masaje relajante",
  },
  {
    id: 5,
    customerName: "Sofia Morales",
    inCharge: "Carlos Martinez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 30).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Pedicure",
  },
  {
    id: 6,
    customerName: "Diego Torres",
    inCharge: "Ana Lopez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Corte de cabello",
  },
  {
    id: 7,
    customerName: "Valentina Castro",
    inCharge: "Carlos Martinez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Tratamiento capilar",
  },
  {
    id: 8,
    customerName: "Andres Ruiz",
    inCharge: "Ana Lopez",
    reservationStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 0).toISOString(),
    reservationEndDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 16, 0).toISOString(),
    timePerReservation: 60,
    status: "PENDING",
    service: "Corte de cabello",
  },
];

const mockEmployees = ["Carlos Martinez", "Ana Lopez", "Roberto Diaz"];

export default function ReservationPage() {
  const { createReservation, reservationData: apiReservationData, loading: reservationLoading } = useReservation();
  const { productData: apiProductData, loading: productLoading } = useProduct();
  
  // Usar datos de mockup si no hay datos de la API
  const productData = apiProductData.length > 0 ? apiProductData : mockProducts;
  const reservationData = apiReservationData.length > 0 ? apiReservationData : mockReservations;
  
  // UI State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "service" | "product">("all");
  
  const itemsPerPage = 6;

  // Get unique employees from reservations
  const employees = useMemo(() => {
    const set = new Set<string>();
    reservationData.forEach((r) => {
      if (r.inCharge && typeof r.inCharge === "string") set.add(r.inCharge);
    });
    return Array.from(set);
  }, [reservationData]);

  // Filter products by type
  const filteredProducts = useMemo(() => {
    if (productTypeFilter === "all") return productData;
    return productData.filter(p => p.type === productTypeFilter);
  }, [productData, productTypeFilter]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    let filtered = [...reservationData].filter((res) => res.status === "PENDING");

    // Customer search
    if (customerSearch.trim()) {
      filtered = filtered.filter((res) =>
        res.customerName?.toLowerCase().includes(customerSearch.trim().toLowerCase())
      );
    }

    // Employee filter
    if (employeeFilter !== "ALL") {
      filtered = filtered.filter((res) => res.inCharge === employeeFilter);
    }

    // Time filter
    const today = new Date();
    if (filter === "TODAY") {
      filtered = filtered.filter((res) => {
        const resDate = new Date(res.reservationStartDate);
        return (
          resDate.getFullYear() === today.getFullYear() &&
          resDate.getMonth() === today.getMonth() &&
          resDate.getDate() === today.getDate()
        );
      });
    } else if (filter === "WEEK") {
      const day = today.getDay();
      const daysSinceMonday = (day + 6) % 7;
      const monday = new Date(today);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(today.getDate() - daysSinceMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      filtered = filtered.filter((res) => {
        const resDate = new Date(res.reservationStartDate);
        return resDate >= monday && resDate <= sunday;
      });
    }

    // Sort by date
    filtered.sort(
      (a, b) =>
        new Date(a.reservationStartDate).getTime() -
        new Date(b.reservationStartDate).getTime()
    );

    return filtered;
  }, [reservationData, customerSearch, employeeFilter, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCreateReservation = async (reservation: Omit<Reservation, "id">) => {
    return createReservation(reservation);
  };

  const isLoading = reservationLoading || productLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 md:pt-8">
        {/* Header */}
        <header className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10 glow-primary">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
          </div>
          <p className="text-muted-foreground">
            Selecciona un servicio o producto para crear una nueva reserva
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Services/Products and Booking Form */}
          <div className="lg:col-span-3 space-y-6">
            {selectedProduct ? (
              /* Booking Form */
              <div className="glass rounded-3xl border border-border p-6">
                <BookingForm
                  selectedProduct={selectedProduct}
                  employees={employees.length > 0 ? employees : mockEmployees}
                  existingReservations={reservationData}
                  onSubmit={handleCreateReservation}
                  onBack={() => setSelectedProduct(null)}
                  loading={reservationLoading}
                />
              </div>
            ) : (
              /* Products/Services Section */
              <section className="glass rounded-3xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/10">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Servicios y Productos</h2>
                      <p className="text-sm text-muted-foreground">{filteredProducts.length} disponibles</p>
                    </div>
                  </div>

                  {/* Type filter */}
                  <div className="flex gap-2">
                    {[
                      { label: "Todos", value: "all" },
                      { label: "Servicios", value: "service" },
                      { label: "Productos", value: "product" },
                    ].map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setProductTypeFilter(btn.value as "all" | "service" | "product")}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                          ${productTypeFilter === btn.value
                            ? "bg-primary text-white"
                            : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
                          }
                        `}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 stagger-children">
                    {filteredProducts.map((product) => (
                      <ServiceCard
                        key={product.id}
                        product={product}
                        isSelected={selectedProduct?.id === product.id}
                        onSelect={() => handleProductSelect(product)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No hay productos disponibles
                    </h3>
                    <p className="text-muted-foreground">
                      Crea productos o servicios en la sección de configuración
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Quick Stats */}
            {!selectedProduct && (
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-2xl border border-border p-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{filteredReservations.length}</p>
                      <p className="text-xs text-muted-foreground">Pendientes</p>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border p-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/10">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {reservationData.filter(r => {
                          const today = new Date();
                          const resDate = new Date(r.reservationStartDate);
                          return resDate.toDateString() === today.toDateString() && r.status === "PENDING";
                        }).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Hoy</p>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-border p-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-success/10">
                      <Users className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                      <p className="text-xs text-muted-foreground">Empleados</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Reservations List */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="glass rounded-3xl border border-border p-6">
              {/* Filters header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Filter className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Mis Reservas</h2>
                </div>

                {/* Time filters */}
                <div className="flex gap-2 mb-4">
                  {[
                    { label: "Hoy", value: "TODAY" },
                    { label: "Semana", value: "WEEK" },
                    { label: "Todas", value: "ALL" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => { setFilter(btn.value); setCurrentPage(1); }}
                      className={`
                        flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${filter === btn.value
                          ? "bg-primary text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
                        }
                      `}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar cliente..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all text-sm"
                  />
                </div>

                {/* Employee filter */}
                {employees.length > 0 && (
                  <select
                    value={employeeFilter}
                    onChange={(e) => { setEmployeeFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="ALL">Todos los empleados</option>
                    {employees.map((emp) => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reservations list */}
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />
                  ))
                ) : paginatedReservations.length > 0 ? (
                  paginatedReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay reservas para mostrar</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-secondary text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`
                            w-9 h-9 rounded-xl text-sm font-medium transition-all
                            ${currentPage === pageNum
                              ? "bg-primary text-white"
                              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
                            }
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-secondary text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="glass rounded-2xl border border-accent/20 p-4 flex items-start gap-3 animate-fade-in-up">
              <div className="p-2 rounded-xl bg-accent/10 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">
                Al completar una reserva, se crea automáticamente un registro financiero de tipo <span className="text-success font-medium">ingreso</span>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
