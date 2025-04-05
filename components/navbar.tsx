import { ReactElement } from "react";
import { AuthButton } from "./auth-button";
import { LanguageSelector } from "./language-selector";

export const Navbar = (): ReactElement => {
  return (
    <div className="fixed top-0 left-0 right-0 shadow-md z-50 backdrop-blur-3xl">
      <nav className="flex items-center justify-end p-4 gap-2">
        <LanguageSelector />
        <AuthButton Navbar />
      </nav>
    </div>
  )
}