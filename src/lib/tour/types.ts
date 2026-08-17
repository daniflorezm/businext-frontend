export type TourKey = "owner_v1" | "employee_v1";

export type TourEntry = {
  step: number;
  done: boolean;
  at?: string;
};

export type TourState = Partial<Record<TourKey, TourEntry>>;

/** Dónde se coloca el globo respecto al elemento resaltado (solo escritorio). */
export type TourPlacement = "top" | "bottom" | "left" | "right";

export type TourStep = {
  /** Valor del atributo `data-tour` del elemento a resaltar.
   *  Los pasos `hero` no resaltan nada y no lo llevan. */
  target?: string;
  title: string;
  body: string;
  placement?: TourPlacement;
  /** Ruta que debe estar activa para que el elemento exista. El tour navega solo. */
  route?: string;
  /** Sección de /configuration que debe abrirse en este paso. */
  section?: string;
  /** Pantalla completa de bienvenida. No lleva globo ni entra en el
   *  contador: el usuario cuenta los pasos que señalan algo. */
  hero?: boolean;
};
