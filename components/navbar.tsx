import { ReactElement } from "react";
import { ThemeLanguageSwitcher } from "./theme-and-language";
import { AuthButton } from "./auth-button";

export const Navbar = (): ReactElement => {
  return (
    <nav className="absolute top-3 right-3 z-50 flex flex-row justify-between items-center p-2 flex items-center space-x-2">
      <ThemeLanguageSwitcher />
      <AuthButton Navbar />
    </nav>
  )
}