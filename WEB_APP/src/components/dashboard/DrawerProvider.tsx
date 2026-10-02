"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type DrawerType = "proof" | "simulator" | "source" | "preview" | null;

interface DrawerContextType {
  isOpen: boolean;
  drawerType: DrawerType;
  drawerProps: any;
  openDrawer: (type: DrawerType, props?: any) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [drawerProps, setDrawerProps] = useState<any>(null);

  const openDrawer = (type: DrawerType, props?: any) => {
    setDrawerType(type);
    setDrawerProps(props || null);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setDrawerType(null);
      setDrawerProps(null);
    }, 300); // clear after animation
  };

  return (
    <DrawerContext.Provider value={{ isOpen, drawerType, drawerProps, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}
