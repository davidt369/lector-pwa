"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PDFViewerProps {
  pdfDocument: any
  currentPage: number
  totalPages: number
  onNextPage: () => void
  onPrevPage: () => void
  onGoToPage: (page: number) => void
}

export function PDFViewer({
  pdfDocument,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onGoToPage,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageInput, setPageInput] = useState(currentPage.toString())
  const [scale, setScale] = useState(1.0)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    setPageInput(currentPage.toString())
  }, [currentPage])

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current || !containerRef.current) return

      try {
        setIsRendering(true)
        const page = await pdfDocument.getPage(currentPage)

        // Obtener el viewport inicial
        const initialViewport = page.getViewport({ scale: 1.0 })

        // Calcular el scale basado en el ancho del contenedor
        const containerWidth = containerRef.current.clientWidth - 32 // padding
        const maxWidth = Math.min(containerWidth, 800) // máximo 800px
        const calculatedScale = Math.min(scale, maxWidth / initialViewport.width)

        const viewport = page.getViewport({ scale: calculatedScale })

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        // Configurar el canvas con el tamaño correcto
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Limpiar el canvas
        context?.clearRect(0, 0, canvas.width, canvas.height)

        await page.render({
          canvasContext: context,
          viewport,
        }).promise

        setIsRendering(false)
      } catch (error) {
        console.error("Error rendering PDF page:", error)
        setIsRendering(false)
      }
    }

    renderPage()
  }, [pdfDocument, currentPage, scale])

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNumber = Number.parseInt(pageInput)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onGoToPage(pageNumber)
    } else {
      setPageInput(currentPage.toString())
    }
  }

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.5))
  }

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5))
  }

  return (
    <div className="space-y-4 w-full">
      {/* Zoom controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Zoom: {Math.round(scale * 100)}%</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 2.5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Renderer */}
      <div
        ref={containerRef}
        className="relative w-full border rounded-lg overflow-auto bg-muted/30 p-4"
        style={{ maxHeight: "70vh" }}
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-[400px] w-[300px] mx-auto" />
              <p className="text-sm text-muted-foreground">Cargando página...</p>
            </div>
          </div>
        )}
        <div className="flex justify-center w-full">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto shadow-lg rounded border bg-white"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className="gap-2 w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Página</span>
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            className="w-16 text-center"
            aria-label="Número de página"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">de {totalPages}</span>
        </form>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          className="gap-2 w-full sm:w-auto"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
