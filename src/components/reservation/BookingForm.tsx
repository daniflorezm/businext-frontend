"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/product/types";
import { Reservation } from "@/lib/reservation/types";
import { Configuration } from "@/lib/configuration/types";
import { User, Calendar, Clock, Sparkles, ChevronLeft, Send } from "lucide-react";

interface BookingFormProps {
  selectedProduct: Product;
  employees: string[];
  existingReservations: Reservation[];
  onSubmit: (reservation: Omit<Reservation, "id">) => Promise<Reservation | null>;
  onBack: () => void;
  loading?: boolean;
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export function BookingForm({ 
  selectedProduct, 
  employees, 
  existingReservations, 
  onSubmit, 
  onBack,
  loading 
}: BookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0] || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Calculate available time slots for the selected employee and date
  useEffect(() => {
    if (!selectedDate || !selectedEmployee) {
      setAvailableSlots(TIME_SLOTS);
      return;
    }

    const selectedDateStr = selectedDate;
    const employeeReservations = existingReservations.filter(r => {
      const resDate = new Date(r.reservationStartDate).toISOString().split('T')[0];
      return r.inCharge === selectedEmployee && resDate === selectedDateStr && r.status === "PENDING";
    });

    const available = TIME_SLOTS.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotStart = new Date(`${selectedDate}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      return !employeeReservations.some(r => {
        const resStart = new Date(r.reservationStartDate);
        const resEnd = new Date(r.reservationEndDate);
        return (slotStart < resEnd && slotEnd > resStart);
      });
    });

    setAvailableSlots(available);
  }, [selectedDate, selectedEmployee, existingReservations, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedEmployee || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    
    const startDate = new Date(`${selectedDate}T${selectedTime}:00`);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const newReservation: Omit<Reservation, "id"> = {
      customerName,
      inCharge: selectedEmployee,
      reservationStartDate: startDate.toISOString(),
      reservationEndDate: endDate.toISOString(),
      timePerReservation: duration,
      status: "PENDING",
      service: selectedProduct.name,
    };

    await onSubmit(newReservation);
    setIsSubmitting(false);
    
    // Reset form
    setCustomerName("");
    setSelectedTime("");
    onBack();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in-up">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Nueva Reserva</h2>
          <p className="text-sm text-muted-foreground">
            Reservando: <span className="text-primary font-medium">{selectedProduct.name}</span>
          </p>
        </div>
      </div>

      {/* Selected product summary */}
      <div className="glass rounded-2xl p-4 mb-6 border border-border flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
          {selectedProduct.imageUrl ? (
            <img 
              src={selectedProduct.imageUrl} 
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{selectedProduct.name}</h3>
          <p className="text-sm text-muted-foreground">
            {selectedProduct.type === "service" ? "Servicio" : "Producto"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">
            ${selectedProduct.price?.toLocaleString("es-CO") ?? 0}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Nombre del cliente
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ingresa el nombre del cliente"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>

        {/* Employee selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Encargado
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
            required
          >
            {employees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        {/* Date selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Duración
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>1 hora</option>
            <option value={90}>1 hora 30 min</option>
            <option value={120}>2 horas</option>
          </select>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="space-y-3 animate-fade-in-up">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Horas disponibles
              <span className="text-xs text-muted-foreground ml-auto">
                {availableSlots.length} horarios libres
              </span>
            </label>
            
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`
                      py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${selectedTime === slot
                        ? "bg-primary text-white glow-primary"
                        : "bg-secondary border border-border text-foreground hover:border-primary hover:bg-primary/10"
                      }
                    `}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-secondary rounded-xl">
                No hay horarios disponibles para este día
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!customerName || !selectedEmployee || !selectedDate || !selectedTime || isSubmitting || loading}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
            flex items-center justify-center gap-2
            ${(!customerName || !selectedEmployee || !selectedDate || !selectedTime || isSubmitting || loading)
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90 glow-primary animate-pulse-glow"
            }
          `}
        >
          {isSubmitting || loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creando reserva...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Confirmar Reserva
            </>
          )}
        </button>
      </form>
    </div>
  );
}
