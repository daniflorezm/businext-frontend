import { Finances } from "@/lib/finances/types";
import { Reservation } from "@/lib/reservation/types";

function parseUTC(dateStr: string): Date {
  return new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
}

function isToday(dateStr: string): boolean {
  const d = parseUTC(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function generateDailyCsv(financesData: Finances[], reservationData: Reservation[]): string {
  const todayIncome = financesData.filter(
    (f) =>
      f.type === "INCOME" &&
      f.created_at &&
      isToday(f.created_at)
  );

  const groupMap = new Map<string, Finances[]>();
  for (const record of todayIncome) {
    const existing = groupMap.get(record.creator) ?? [];
    existing.push(record);
    groupMap.set(record.creator, existing);
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(`Resumen del día - ${dateStr}`);
  lines.push("");

  let grandTotal = 0;

  for (const [creator, records] of groupMap.entries()) {
    lines.push(creator);
    lines.push("Concepto,Cliente,Tipo,Importe,Hora");

    let subtotal = 0;
    for (const r of records) {
      const type = r.reservation_id != null ? "Reserva" : "Producto";
      const customerName = r.reservation_id != null
        ? reservationData.find((res) => res.id === r.reservation_id)?.customerName ?? ""
        : "";
      const amount = r.amount.toFixed(2);
      const time = r.created_at
        ? parseUTC(r.created_at).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const concept = r.concept.includes(",")
        ? `"${r.concept}"`
        : r.concept;
      const customer = customerName.includes(",")
        ? `"${customerName}"`
        : customerName;
      lines.push(`${concept},${customer},${type},${amount},${time}`);
      subtotal += r.amount;
    }

    lines.push(`Total ${creator},,,${subtotal.toFixed(2)},`);
    lines.push("");
    grandTotal += subtotal;
  }

  lines.push(`TOTAL GENERAL,,,${grandTotal.toFixed(2)},`);

  return lines.join("\n");
}

export function downloadCsv(csvContent: string, filename: string): void {
  // UTF-8 BOM for Excel compatibility
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
