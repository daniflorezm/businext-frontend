import {
  Rocket,
  Building2,
  PackageSearch,
  MapPin,
  Clock,
  Users,
  CalendarDays,
  Link2,
  ChartBarBig,
  Star,
  Brain,
  type LucideIcon,
} from "lucide-react";
import type { Capabilities } from "@/hooks/useAccessContext";

export interface FaqItem {
  question: string;
  answer: string;
  /** Si se indica, la pregunta solo se muestra si el usuario tiene esta capacidad. */
  cap?: keyof Capabilities;
  /** Si es true, la pregunta solo se muestra al owner del negocio. */
  ownerOnly?: boolean;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Si se indica, la categoría solo se muestra si el usuario tiene esta capacidad (igual que en la navegación de Configuración). */
  cap?: keyof Capabilities;
  /** Si es true, la categoría solo se muestra al owner del negocio. */
  ownerOnly?: boolean;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "primeros-pasos",
    label: "Primeros pasos",
    icon: Rocket,
    items: [
      {
        question: "¿Qué necesito configurar antes de empezar a recibir reservas?",
        answer:
          "Sigue este orden: 1) Datos del negocio en Configuración → Negocio, 2) al menos un producto o servicio en Configuración → Productos, 3) el horario de apertura en Configuración → Horario y, si tienes varias sedes, tus Locales. Con eso ya puedes crear reservas o compartir tu link de reserva online.",
        ownerOnly: true,
      },
      {
        question: "Soy empleado, ¿qué puedo hacer en la aplicación?",
        answer:
          "Dependiendo de los permisos que te haya dado el owner, normalmente podrás gestionar Reservas (crear citas, ver la agenda, registrar ventas directas) y consultar tu horario. Si te falta acceso a alguna sección, pídele al owner que revise tu rol en Configuración → Equipo.",
      },
      {
        question: "¿Por qué no puedo acceder a algunas secciones?",
        answer:
          "El acceso depende de tu rol (Owner, Manager o Empleado). Algunas secciones como Configuración o Finanzas están restringidas a ciertos roles. Si crees que deberías tener acceso, pídele al owner de tu negocio que revise tu rol en Configuración → Equipo.",
      },
    ],
  },
  {
    id: "negocio",
    label: "Negocio",
    icon: Building2,
    cap: "canManageConfiguration",
    items: [
      {
        question: "¿Dónde configuro el nombre, teléfono y email de mi negocio?",
        answer:
          "En Configuración → Negocio. Estos datos se muestran a tus clientes, por ejemplo en la página pública de reserva online. Solo el owner puede modificarlos.",
      },
    ],
  },
  {
    id: "productos",
    label: "Productos y servicios",
    icon: PackageSearch,
    cap: "canManageProducts",
    items: [
      {
        question: "¿Cómo creo un producto o servicio?",
        answer:
          'Ve a Configuración → Productos y pulsa "Nuevo". Indica el nombre, el precio y si es un "producto" o un "servicio", y opcionalmente añade una imagen. Este producto/servicio quedará disponible para seleccionarlo al crear una reserva o registrar una venta.',
      },
      {
        question: "¿Para qué sirven las comisiones de producto y de servicio?",
        answer:
          "Definen el porcentaje que gana cada empleado por cada venta de un producto o de un servicio. Se configuran en Configuración → Productos (solo visible para el owner).",
      },
    ],
  },
  {
    id: "locales",
    label: "Locales",
    icon: MapPin,
    ownerOnly: true,
    items: [
      {
        question: "¿Necesito crear un local si solo tengo una tienda?",
        answer:
          "No es obligatorio. La sección de Locales solo es necesaria si tu negocio tiene varias sedes y quieres asignar empleados a cada una.",
      },
      {
        question: "¿Cómo asigno un empleado a un local?",
        answer:
          "En Configuración → Equipo, una vez el empleado está invitado, selecciona el local correspondiente en el desplegable de local en su fila de la lista.",
      },
    ],
  },
  {
    id: "horarios",
    label: "Horarios",
    icon: Clock,
    ownerOnly: true,
    items: [
      {
        question: "¿Cómo configuro el horario de apertura de mi negocio?",
        answer:
          "En Configuración → Horario, activa los días que abres y define uno o varios bloques horarios por día (por ejemplo, mañana y tarde). Este horario determina los huecos disponibles al crear una reserva.",
      },
    ],
  },
  {
    id: "equipo",
    label: "Equipo",
    icon: Users,
    cap: "canManageTeam",
    items: [
      {
        question: "¿Cómo invito a un empleado?",
        answer:
          "En Configuración → Equipo, completa el formulario con nombre, email, teléfono y rol (Empleado o Manager), y pulsa \"Enviar invitación\".",
      },
      {
        question: "¿Qué configuro después de invitar a un empleado?",
        answer:
          "Una vez invitado, en su fila de la lista puedes asignarle un local (si tienes varios) y configurarle un horario personalizado con el icono de calendario. Si no le pones horario propio, usará el horario general del negocio.",
      },
      {
        question: "¿Qué diferencia hay entre Empleado y Manager?",
        answer:
          "Ambos roles pueden gestionar operaciones del día a día, pero un Manager suele tener acceso a más secciones (como el equipo o la configuración), según los permisos definidos por el owner.",
      },
      {
        question: "¿Puedo poner un horario distinto para un empleado?",
        answer:
          'Sí. Una vez invitado, pulsa el icono de calendario en su fila para abrir su "Horario personalizado". Si no configuras nada ahí, se usará el horario general del negocio.',
      },
    ],
  },
  {
    id: "reservas",
    label: "Reservas",
    icon: CalendarDays,
    cap: "canManageReservations",
    items: [
      {
        question: "¿Cómo creo una reserva?",
        answer:
          "En Reservas, elige el producto/servicio, la fecha y un hueco disponible según el horario configurado, y los datos del cliente. Si no ves ningún producto para seleccionar, primero debes crearlo en Configuración → Productos.",
      },
      {
        question: "¿Qué pasa cuando marco una reserva como completada?",
        answer:
          'Se crea automáticamente un registro financiero de tipo "ingreso", para que puedas llevar el control de tus ingresos sin duplicar el registro manualmente.',
      },
      {
        question: "¿Qué es una venta directa (walk-in)?",
        answer:
          "Es una venta o servicio que registras directamente, sin pasar por el flujo de reserva con horario, útil para clientes que llegan sin cita previa.",
      },
    ],
  },
  {
    id: "reserva-online",
    label: "Reserva online",
    icon: Link2,
    ownerOnly: true,
    items: [
      {
        question: "¿Cómo comparto el link de reserva online con mis clientes?",
        answer:
          "En Configuración → Reserva online encontrarás un link público y un código QR. Puedes copiar el link o descargar el QR e imprimirlo en tu negocio.",
      },
      {
        question: "¿Dónde veo las solicitudes que llegan por el link público?",
        answer:
          "Aparecen en la sección de Reservas, para que las confirmes o rechaces antes de que queden agendadas.",
      },
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: ChartBarBig,
    cap: "canManageFinances",
    items: [
      {
        question: "¿De dónde salen los registros financieros?",
        answer:
          'Muchos se crean automáticamente: al completar una reserva o registrar una venta directa se genera un ingreso. Además, el owner puede añadir ingresos o gastos manuales con el botón "Agregar Registro".',
      },
      {
        question: "¿Qué significan las tarjetas de Ingresos, Gastos y Balance?",
        answer:
          "Resumen el mes y año seleccionados: los ingresos totales, los gastos totales y el balance (ingresos menos gastos). Cambia el mes o el año en los filtros para ver otros periodos.",
      },
      {
        question: "Soy empleado, ¿por qué mis ingresos aparecen más bajos?",
        answer:
          'La tarjeta "Mis Ingresos" muestra tu importe neto, es decir, ya con tu comisión descontada. Justo debajo puedes ver el importe bruto de referencia.',
      },
      {
        question: "¿Cómo filtro o busco un registro concreto?",
        answer:
          "Usa los botones Todos / Ingresos / Gastos para filtrar por tipo, los selectores de mes y año para el periodo y, si eres owner, el campo Emisor para buscar por la persona que registró el movimiento.",
      },
    ],
  },
  {
    id: "resenas",
    label: "Reseñas",
    icon: Star,
    cap: "canManageReviews",
    items: [
      {
        question: "¿Cómo conecto mi negocio de Google Maps?",
        answer:
          "En Reseñas, pega el enlace de tu ficha de Google Maps en el formulario. Businext importará tu perfil y tus reseñas para analizarlas.",
      },
      {
        question: "¿Cómo actualizo las reseñas más recientes?",
        answer:
          'Pulsa el botón "Sincronizar" en la cabecera del perfil. Se traerán las reseñas nuevas desde Google Maps.',
      },
      {
        question: "¿Para qué sirve el resumen con IA?",
        answer:
          "Analiza el conjunto de tus reseñas y destaca los puntos fuertes y las quejas más habituales de tus clientes, para que sepas qué mejorar de un vistazo.",
      },
      {
        question: "¿Puedo responder a las reseñas desde Businext?",
        answer:
          "Puedes generar un borrador de respuesta con IA para cada reseña y usarlo como punto de partida para contestar en Google.",
      },
    ],
  },
  {
    id: "inteligencia",
    label: "Inteligencia de negocio",
    icon: Brain,
    cap: "canManageTeam",
    items: [
      {
        question: "¿Qué es la Inteligencia de negocio?",
        answer:
          "Es un análisis generado por IA a partir de los datos de tu negocio (reservas, ingresos, equipo y clientes). Incluye KPIs clave, un resumen narrativo, oportunidades de mejora y el rendimiento de tu equipo y clientela.",
      },
      {
        question: "¿Cómo genero o actualizo el análisis semanal?",
        answer:
          'Pulsa el botón "Generar" (o "Regenerar" si ya existe uno). La IA procesará tus datos y creará el resumen de la semana.',
      },
      {
        question: "¿Por qué mi análisis tiene poca información?",
        answer:
          "Las conclusiones dependen de los datos que tengas registrados. Cuantas más reservas, ventas y movimientos financieros haya, más útiles y precisas serán las recomendaciones.",
      },
    ],
  },
];
