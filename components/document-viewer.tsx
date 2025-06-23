"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface DocumentViewerProps {
  text: string
  currentPage: number
  totalPages: number
  onNextPage: () => void
  onPrevPage: () => void
  onGoToPage: (page: number) => void
  highlightStartIndex?: number | null // New prop
  highlightEndIndex?: number | null // New prop
}

export function DocumentViewer({
  text,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onGoToPage,
  highlightStartIndex = null, // Default to null
  highlightEndIndex = null, // Default to null
}: DocumentViewerProps) {
  const [pageInput, setPageInput] = React.useState(currentPage.toString())
  const contentRef = React.useRef<HTMLDivElement>(null) // Ref for scrolling

  React.useEffect(() => {
    setPageInput(currentPage.toString())
  }, [currentPage])

  // Scroll to highlighted word
  React.useEffect(() => {
    console.log(`[DocumentViewer] Highlight indices changed: start=${highlightStartIndex}, end=${highlightEndIndex}`)
    if (highlightStartIndex !== null && highlightEndIndex !== null && contentRef.current) {
      const highlightedSpan = contentRef.current.querySelector(".highlighted-word") as HTMLElement
      if (highlightedSpan) {
        console.log("[DocumentViewer] Found highlighted span, attempting to scroll into view.")
        // Use scrollIntoView with 'center' behavior for better UX
        highlightedSpan.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        console.log("[DocumentViewer] Highlighted span not found in DOM.")
      }
    } else if (highlightStartIndex === null && highlightEndIndex === null) {
      console.log("[DocumentViewer] Highlight cleared.")
    }
  }, [highlightStartIndex, highlightEndIndex, text]) // Re-run when highlight changes or text changes

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

  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
  const estimatedReadingTime = Math.ceil(wordCount / 200) // Asumiendo 200 palabras por minuto

  const renderTextWithHighlight = () => {
    if (
      highlightStartIndex === null ||
      highlightEndIndex === null ||
      highlightStartIndex >= text.length ||
      highlightEndIndex <= highlightStartIndex
    ) {
      console.log("[DocumentViewer] No valid highlight range. Rendering plain text.")
      return <div className="whitespace-pre-wrap break-words">{text}</div>
    }

    const before = text.substring(0, highlightStartIndex)
    const highlighted = text.substring(highlightStartIndex, highlightEndIndex)
    const after = text.substring(highlightEndIndex)

    console.log(
      `[DocumentViewer] Rendering highlight: "${highlighted}" (start: ${highlightStartIndex}, end: ${highlightEndIndex})`,
    )

    return (
      <div className="whitespace-pre-wrap break-words">
        {before}
        <span className="bg-yellow-700 dark:bg-yellow-600 rounded px-0.5 py-0.5 highlighted-word">{highlighted}</span>
        {after}
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Información del documento */}
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          {wordCount} palabras
        </Badge>
        <Badge variant="secondary">~{estimatedReadingTime} min de lectura</Badge>
      </div>

      {/* Contenido del documento */}
      <div className="w-full">
        <div
          ref={contentRef} // Attach ref here
          className="bg-muted/30 p-4 sm:p-6 rounded-lg border overflow-y-auto text-sm leading-relaxed"
          style={{ maxHeight: "70vh" }}
        >
          <div className="max-w-none prose prose-sm dark:prose-invert">{renderTextWithHighlight()}</div>
        </div>
      </div>

      {/* Controles de navegación para PDFs multipágina */}
      {totalPages > 1 && (
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
      )}
    </div>
  )
}
