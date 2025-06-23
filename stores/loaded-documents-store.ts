"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface LoadedDocument {
  id: string
  name: string
  type: "pdf" | "docx"
  previewUrl: string // Data URL for image, or path to generic icon
  extractedText: string
  totalPages: number
  // Note: Storing the actual PDF document object (pdfjsLib.PDFDocumentProxy)
  // or the original File object directly in localStorage is not feasible.
  // For full PDF re-rendering without re-upload, you'd need IndexedDB for binary data.
  // For now, we store extractedText for reading and rely on re-upload for full PDF view.
}

interface LoadedDocumentsState {
  documents: LoadedDocument[]
  addDocument: (doc: LoadedDocument) => void
  removeDocument: (id: string) => void
  clearDocuments: () => void
}

export const useLoadedDocumentsStore = create<LoadedDocumentsState>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (doc) =>
        set((state) => {
          // Check for duplicate by ID to ensure uniqueness
          if (state.documents.some((d) => d.id === doc.id)) {
            return state // Document with this ID already exists, do not add
          }
          return { documents: [...state.documents, doc] }
        }),
      removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
      clearDocuments: () => set({ documents: [] }),
    }),
    {
      name: "loaded-documents-storage", // unique name for localStorage
      // Only persist serializable data
      partialize: (state) => ({
        documents: state.documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          previewUrl: doc.previewUrl,
          extractedText: doc.extractedText,
          totalPages: doc.totalPages,
        })),
      }),
    },
  ),
)
