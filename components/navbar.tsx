import { ReactElement } from "react";
import { AuthButton } from "./auth-button";
import { LanguageSelector } from "./language-selector";

export const Navbar = (): ReactElement => {
  return (
    <nav className="absolute top-3 right-3 z-50 flex flex-row justify-between items-center p-2 flex items-center space-x-2">
      <LanguageSelector />
      <AuthButton Navbar />
    </nav>
  )
}