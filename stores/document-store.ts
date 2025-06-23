"use client"

import { create } from "zustand"

interface DocumentState {
  documentText: string
  documentTitle: string
  documentType: "pdf" | "docx" | null
  documentPages: number
  currentPage: number
  isLoading: boolean
  pdfDocument: any

  // New states for continuous reading
  isReadingDocument: boolean
  currentReadingPageIndex: number
  currentReadingChunkIndex: number
  pageTextChunks: Array<{ text: string; globalStartIndex: number }> // Changed to store objects with globalStartIndex

  // New states for highlighting
  highlightStartIndex: number | null
  highlightEndIndex: number | null

  // Acciones
  setDocumentText: (text: string) => void
  setDocumentTitle: (title: string) => void
  setDocumentType: (type: "pdf" | "docx" | null) => void
  setDocumentPages: (pages: number) => void
  setCurrentPage: (page: number) => void
  setIsLoading: (loading: boolean) => void
  setPdfDocument: (doc: any) => void
  resetDocument: () => void

  // New actions for continuous reading
  startReading: () => void
  stopReading: () => void
  setPageTextChunks: (chunks: Array<{ text: string; globalStartIndex: number }>) => void
  nextChunk: () => void
  resetReadingProgress: () => void

  // New action for highlighting
  setHighlightRange: (start: number | null, end: number | null) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentText: "",
  documentTitle: "",
  documentType: null,
  documentPages: 0,
  currentPage: 1,
  isLoading: false,
  pdfDocument: null,

  // Initial states for continuous reading
  isReadingDocument: false,
  currentReadingPageIndex: 1,
  currentReadingChunkIndex: 0,
  pageTextChunks: [],

  // Initial states for highlighting
  highlightStartIndex: null,
  highlightEndIndex: null,

  setDocumentText: (text) => set({ documentText: text }),
  setDocumentTitle: (title) => set({ documentTitle: title }),
  setDocumentType: (type) => set({ documentType: type }),
  setDocumentPages: (pages) => set({ documentPages: pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPdfDocument: (doc) => set({ pdfDocument: doc }),
  resetDocument: () =>
    set({
      documentText: "",
      documentTitle: "",
      documentType: null,
      documentPages: 0,
      currentPage: 1,
      pdfDocument: null,
      isReadingDocument: false, // Reset reading state
      currentReadingPageIndex: 1,
      currentReadingChunkIndex: 0,
      pageTextChunks: [],
      highlightStartIndex: null, // Reset highlight
      highlightEndIndex: null, // Reset highlight
    }),

  // New actions for continuous reading
  startReading: () => set({ isReadingDocument: true }),
  stopReading: () => set({ isReadingDocument: false }),
  setPageTextChunks: (chunks) => set({ pageTextChunks: chunks, currentReadingChunkIndex: 0 }),
  nextChunk: () => set((state) => ({ currentReadingChunkIndex: state.currentReadingChunkIndex + 1 })),
  resetReadingProgress: () => set({ currentReadingPageIndex: 1, currentReadingChunkIndex: 0, pageTextChunks: [] }),

  // New action for highlighting
  setHighlightRange: (start, end) => set({ highlightStartIndex: start, highlightEndIndex: end }),
}))
