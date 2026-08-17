import { TourKey, TourStep } from "@/lib/tour/types";

const OWNER_STEPS: TourStep[] = [
  {
    target: "config-nav-business",
    title: "1. Los datos de tu negocio",
    body: "Empieza por aquí: nombre, teléfono y email de contacto. Es lo que verán tus clientes al reservar.",
    placement: "right",
    route: "/configuration",
    section: "business",
  },
  {
    target: "config-nav-locations",
    title: "2. Tus locales",
    body: "Añade cada local en el que atiendes. Aquí es donde vinculas la dirección de Google Maps, para que tus clientes te encuentren y podamos traer tus reseñas.",
    placement: "right",
    route: "/configuration",
    section: "locations",
  },
  {
    target: "config-nav-hours",
    title: "3. Tu horario",
    body: "Define los días y las horas en que aceptas reservas. Fuera de este horario, los huecos no se ofrecen.",
    placement: "right",
    route: "/configuration",
    section: "hours",
  },
  {
    target: "config-nav-products",
    title: "4. Productos y servicios",
    body: "Da de alta lo que ofreces con su precio y duración. La duración es la que decide cuántas reservas caben en tu agenda.",
    placement: "right",
    route: "/configuration",
    section: "products",
  },
  {
    target: "config-nav-team",
    title: "5. Tu equipo",
    body: "Invita a tus empleados por email. Recibirán un enlace para crear su contraseña y entrar con su propio acceso.",
    placement: "right",
    route: "/configuration",
    section: "team",
  },
  {
    target: "config-nav-booking",
    title: "6. Tu link de reserva",
    body: "Aquí tienes el enlace y el código QR para que tus clientes reserven solos. Compártelo en redes, en tu web o imprímelo en el local.",
    placement: "right",
    route: "/configuration",
    section: "booking",
  },
  {
    target: "nav-reservation",
    title: "Tu agenda",
    body: "El día a día ocurre aquí: ves y gestionas todas las reservas de tu negocio.",
    placement: "right",
    route: "/configuration",
  },
  {
    target: "nav-notifications",
    title: "Solicitudes pendientes",
    body: "Cuando un cliente pide hora, la solicitud aparece aquí para que la aceptes o la rechaces. El contador rojo te avisa de las que están sin responder.",
    placement: "right",
    route: "/configuration",
  },
  {
    target: "nav-finances",
    title: "Finanzas",
    body: "Consulta ingresos y comisiones de tu negocio por periodo.",
    placement: "right",
    route: "/configuration",
  },
  {
    target: "nav-reviews",
    title: "Reseñas",
    body: "Reúne las reseñas de Google de tus locales y te ayudamos a redactar las respuestas. ¡Mucha suerte!",
    placement: "right",
    route: "/configuration",
  },
];

const EMPLOYEE_STEPS: TourStep[] = [
  {
    target: "nav-reservation",
    title: "Las reservas",
    body: "Esta es tu pantalla principal: aquí ves la agenda y gestionas las reservas del día.",
    placement: "right",
    route: "/reservation",
  },
  {
    target: "reservations-today",
    title: "Las reservas de hoy",
    body: "Aquí tienes la jornada de un vistazo. Toca una reserva para ver los datos del cliente o marcarla como atendida.",
    placement: "top",
    route: "/reservation",
  },
  {
    target: "nav-notifications",
    title: "Solicitudes de clientes",
    body: "Cuando un cliente pide hora, aparece aquí para aceptarla o rechazarla. El número rojo son las que siguen sin responder.",
    placement: "right",
    route: "/reservation",
  },
  {
    target: "config-nav-profile",
    title: "Tus datos",
    body: "En Configuración puedes cambiar tu nombre, tu teléfono y tu contraseña.",
    placement: "right",
    route: "/configuration",
    section: "profile",
  },
];

export const TOUR_STEPS: Record<TourKey, TourStep[]> = {
  owner_v1: OWNER_STEPS,
  employee_v1: EMPLOYEE_STEPS,
};

/** El rol decide qué tour ve cada usuario. Managers y empleados comparten tour. */
export function tourKeyForRole(role: string | undefined): TourKey {
  return role === "owner" ? "owner_v1" : "employee_v1";
}
