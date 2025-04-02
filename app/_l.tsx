import Aurora from "@/components/ui/aurora";
import { Component } from "@/lib/types";
import { PropsWithChildren as DefaultPropsWithChildren } from "react";

type PropsWithChildren = DefaultPropsWithChildren & {
  aurora?: string[];
};

export const PageLayout: Component<PropsWithChildren> = ({ children, aurora = ["#1a254f", "#1b274d", "#233161", "#16264d", "#2f9dd8"] }) => {
  return (
    <main className="relative overflow-hidden">
      <div className="h-[150px]">
        <Aurora colorStops={aurora} blend={0.5} amplitude={1.5} speed={0.5} />
      </div>

      {children}

      <div className="mt-12 h-[60px]" />
    </main>
  );
}