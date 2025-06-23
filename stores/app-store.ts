"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppState {
  isOnline: boolean
  selectedText: string
  customText: string
  activeTab: string

  // Acciones
  setIsOnline: (online: boolean) => void
  setSelectedText: (text: string) => void
  setCustomText: (text: string) => void
  setActiveTab: (tab: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnline: true,
      selectedText: "",
      customText:
        "Bienvenido al Lector de Pantalla PWA. Esta aplicación te permite escuchar cualquier texto usando síntesis de voz avanzada.",
      activeTab: "text",

      setIsOnline: (online) => set({ isOnline: online }),
      setSelectedText: (text) => set({ selectedText: text }),
      setCustomText: (text) => set({ customText: text }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "app-settings",
      partialize: (state) => ({
        customText: state.customText,
        activeTab: state.activeTab,
      }),
    },
  ),
)
