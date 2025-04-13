import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const capitalizeFirstLetter = (str: string, restToLowerCase: boolean = false) => {
  if (str.length === 0) return str;
  
  const firstChar = str.charAt(0).toUpperCase();
  const restOfString = restToLowerCase ? str.slice(1).toLowerCase() : str.slice(1);
  
  return firstChar + restOfString;
}