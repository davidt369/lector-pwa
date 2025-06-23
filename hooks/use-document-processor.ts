"use client"

import { useCallback } from "react"
import { useDocumentStore } from "@/stores/document-store"
import { useLoadedDocumentsStore } from "@/stores/loaded-documents-store" // Import the new store
import mammoth from "mammoth"
import { v4 as uuidv4 } from "uuid" // For unique IDs

// Usar una versión estable y conocida de PDF.js
const PDFJS_VERSION = "3.11.174"

// Variable global para PDF.js
let pdfjs: any = null
let pdfjsLoaded = false

// Función para cargar PDF.js de manera segura
const loadPDFJS = async () => {
  if (pdfjsLoaded && pdfjs) {
    return pdfjs
  }

  try {
    if (typeof window !== "undefined" && !pdfjsLoaded) {
      const script = document.createElement("script")
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
      script.async = true

      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      if ((window as any).pdfjsLib) {
        pdfjs = (window as any).pdfjsLib
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`
        pdfjsLoaded = true
        return pdfjs
      }
    }
  } catch (error) {
    console.error("Error loading PDF.js:", error)
    throw new Error("No se pudo cargar el procesador de PDF")
  }

  return null
}

export function useDocumentProcessor() {
  const {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    setDocumentText,
    setDocumentTitle,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    setIsLoading,
    setPdfDocument,
  } = useDocumentStore()

  const { addDocument } = useLoadedDocumentsStore()

  const generatePdfThumbnail = useCallback(async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await loadPDFJS()
      if (!pdfjsLib) {
        console.warn("PDF.js not loaded for thumbnail generation.")
        return "/pdf-icon.png" // Fallback icon
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(1)

      const viewport = page.getViewport({ scale: 0.5 }) // Smaller scale for thumbnail
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) return "/pdf-icon.png"

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport,
      }).promise

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error generating PDF thumbnail:", error)
      return "/pdf-icon.png" // Fallback icon
    }
  }, [])

  const loadDocument = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setDocumentTitle(file.name)
      setDocumentText("") // Clear previous text

      let extractedText = ""
      let docType: "pdf" | "docx" | null = null
      let totalPages = 0
      let previewUrl = ""
      let currentPdfDoc = null

      try {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          docType = "pdf"
          const pdfjsLib = await loadPDFJS()
          if (!pdfjsLib) {
            throw new Error("No se pudo cargar el procesador de PDF. Intenta recargar la página.")
          }

          const arrayBuffer = await file.arrayBuffer()
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
          const pdf = await loadingTask.promise

          currentPdfDoc = pdf
          totalPages = pdf.numPages

          let fullPdfText = ""
          for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()

            let pageText = ""
            let lastY = null

            for (const item of textContent.items) {
              if (item.str) {
                if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                  pageText += "\n"
                }
                pageText += item.str + " "
                lastY = item.transform[5]
              }
            }
            fullPdfText += pageText.trim() + "\n\n" // Add double newline between pages
          }
          extractedText = fullPdfText.trim() || "No se pudo extraer texto del PDF."
          previewUrl = await generatePdfThumbnail(file)
        } else if (
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.toLowerCase().endsWith(".docx") ||
          file.name.toLowerCase().endsWith(".doc")
        ) {
          docType = "docx"
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })

          extractedText = result.value.trim()
          if (!extractedText) {
            throw new Error("No se pudo extraer texto del documento Word.")
          }
          totalPages = 1
          previewUrl = "/docx-icon.png" // Generic icon for Word
        } else {
          throw new Error("Formato de archivo no soportado. Por favor, usa archivos PDF o Word (.docx, .doc)")
        }

        setDocumentText(extractedText)
        setDocumentType(docType)
        setDocumentPages(totalPages)
        setCurrentPage(1)
        setPdfDocument(currentPdfDoc)

        // Add to loaded documents store
        addDocument({
          id: uuidv4(), // Use a unique ID
          name: file.name,
          type: docType,
          previewUrl: previewUrl,
          extractedText: extractedText,
          totalPages: totalPages,
        })
        console.log(`Document loaded: ${file.name}, text length: ${extractedText.length}`)
      } catch (error) {
        console.error("Error al procesar el documento:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el documento"
        setDocumentText(
          `Error: ${errorMessage}\n\nPor favor, intenta con otro archivo o usa la opción de entrada manual de texto.`,
        )
        setDocumentTitle("Error al cargar")
        setDocumentType(null)
        setDocumentPages(0)
        setCurrentPage(1)
        setPdfDocument(null)
      } finally {
        setIsLoading(false)
      }
    },
    [
      setIsLoading,
      setDocumentTitle,
      setDocumentText,
      setDocumentType,
      setDocumentPages,
      setCurrentPage,
      setPdfDocument,
      addDocument,
      generatePdfThumbnail,
    ],
  )

  // Modified to return text instead of setting state directly
  const loadPdfPage = useCallback(
    async (pageNumber: number): Promise<string> => {
      if (!pdfDocument || pageNumber < 1 || pageNumber > documentPages) {
        console.warn(`Attempted to load invalid page: ${pageNumber}. Total pages: ${documentPages}`)
        return ""
      }

      try {
        const page = await pdfDocument.getPage(pageNumber)
        const textContent = await page.getTextContent()

        let text = ""
        let lastY = null

        for (const item of textContent.items) {
          if (item.str) {
            if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
              text += "\n"
            }
            text += item.str + " "
            lastY = item.transform[5]
          }
        }
        const cleanText = text.trim()
        console.log(`Loaded page ${pageNumber}. Text length: ${cleanText.length}`)
        return cleanText
      } catch (error) {
        console.error(`Error al cargar la página ${pageNumber}:`, error)
        return "" // Return empty string on error
      }
    },
    [pdfDocument, documentPages],
  ) // Dependencies for useCallback

  const nextPage = useCallback(() => {
    if (currentPage < documentPages && documentType === "pdf") {
      // This will now just trigger the page change in the viewer, not load text for reading
      setCurrentPage(currentPage + 1)
    }
  }, [currentPage, documentPages, documentType, setCurrentPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1 && documentType === "pdf") {
      // This will now just trigger the page change in the viewer, not load text for reading
      setCurrentPage(currentPage - 1)
    }
  }, [currentPage, documentType, setCurrentPage])

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= documentPages && documentType === "pdf") {
        // This will now just trigger the page change in the viewer, not load text for reading
        setCurrentPage(page)
      }
    },
    [documentPages, documentType, setCurrentPage],
  )

  return {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    loadDocument,
    nextPage,
    prevPage,
    goToPage,
    setDocumentTitle,
    setDocumentText,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    loadPdfPage, // Expose loadPdfPage for the new document reader hook
  }
}
