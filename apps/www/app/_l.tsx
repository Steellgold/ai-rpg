import Aurora from "@/components/ui/aurora";
import { Component } from "@/lib/types/component";
import type { PropsWithChildren as DefaultPropsWithChildren } from "react";

type PropsWithChildren = DefaultPropsWithChildren & {
  aurora?: string[];
};

export const PageLayout: Component<PropsWithChildren> = ({ children, aurora = ["#1447e6", "#193cb8"] }) => {
  return (
    <main className="relative overflow-hidden">
      <div className="h-[200px]">
        <Aurora colorStops={aurora} blend={0.5} amplitude={1.5} speed={0.5} />
      </div>

      {children}

      <div className="mt-12 h-[60px]" />
    </main>
  );
}