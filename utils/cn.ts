import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cnIf(inputs: ClassValue, condition: boolean, conditionalTrue: ClassValue, conditionalFalse?: ClassValue) {
  return twMerge(clsx(inputs, condition ? conditionalTrue : conditionalFalse));
}
