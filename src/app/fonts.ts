import { Sora, DM_Sans } from "next/font/google";

export const sora = Sora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-heading",
  weight: ["600", "700"],
});

export const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "700"],
});
