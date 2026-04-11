import { UseFormRegister } from "react-hook-form";
export type Product = {
  id?: number;
  name: string;
  price: number;
  type?: string;
  imageUrl?: string;
};

export type ProductInputProps = {
  register: UseFormRegister<Product>;
  index?: number;
};
