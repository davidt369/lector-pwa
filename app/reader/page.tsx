"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Mic,
  MicOff,
  Accessibility,
  Headphones,
  FileText,
  Wifi,
  WifiOff,
  Upload,
  File,
  FileSpreadsheet,
  FilePlus,
  Volume2,
  BookOpen,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { DocumentFallback } from "@/app/document-fallback"
import { VoiceControlsLayout } from "@/components/voice-controls-layout"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useDocumentStore } from "@/stores/document-store"
import { useAppStore } from "@/stores/app-store"
import { useScreenReaderInit } from "@/hooks/use-screen-reader-init"
import { useDocumentProcessor } from "@/hooks/use-document-processor"
import { PDFViewer } from "@/components/pdf-viewer"
import { DocumentGallery } from "@/components/document-gallery"
import { useDocumentReader } from "@/hooks/use-document-reader"
import { ThemeToggle } from "@/components/theme-toggle" // Import ThemeToggle

export default function ScreenReaderPWA() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inicializar screen reader
  useScreenReaderInit()

  // Estados de las stores
  const {
    isPlaying,
    isListening,
    transcript,
    isSupported,
    speak,
    startListening,
    stopListening,
    readPageContent,
    highlightText,
    stop: stopScreenReader, // Get stop from screen reader store
  } = useScreenReaderStore()

  const {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    setDocumentTitle,
    setDocumentText,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    setPdfDocument, // Ensure setPdfDocument is available
    isReadingDocument, // Get from document store
    stopReading, // Get from document store
    highlightStartIndex, // Get from document store
    highlightEndIndex, // Get from document store
  } = useDocumentStore()

  const { isOnline, selectedText, customText, activeTab, setIsOnline, setSelectedText, setCustomText, setActiveTab } =
    useAppStore()

  const { loadDocument, nextPage, prevPage, goToPage } = useDocumentProcessor()
  const { startReadingDocument } = useDocumentReader() // Use the new document reader hook

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log("App is online!")
    }
    const handleOffline = () => {
      setIsOnline(false)
      console.log("App is offline!")
    }

    // Set initial online status after a short delay to ensure browser has settled
    const initialCheckTimeout = setTimeout(() => {
      setIsOnline(navigator.onLine)
      console.log("Initial online status:", navigator.onLine ? "Online" : "Offline")
    }, 100) // Small delay

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearTimeout(initialCheckTimeout)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setIsOnline])

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString())
      }
    }

    document.addEventListener("mouseup", handleSelection)
    document.addEventListener("keyup", handleSelection)

    return () => {
      document.removeEventListener("mouseup", handleSelection)
      document.removeEventListener("keyup", handleSelection)
    }
  }, [setSelectedText])

  const handleSpeakText = (text: string) => {
    if (text.trim()) {
      speak(text)
      highlightText(text)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      loadDocument(file)
      setActiveTab("documents") // Switch to documents tab after upload
      console.log("File uploaded, documentText should be updated soon:", file.name)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Function to load a document from the gallery into the main viewer
  const loadDocumentFromGallery = (text: string, title: string, type: "pdf" | "docx", pages: number) => {
    setDocumentText(text)
    setDocumentTitle(title)
    setDocumentType(type)
    setDocumentPages(pages)
    setCurrentPage(1)
    setPdfDocument(null) // Clear PDF document as binary data is not persisted in gallery
    stopScreenReader() // Stop any ongoing reading
    stopReading() // Stop continuous document reading
    setActiveTab("documents") // Ensure we are on the documents tab
    console.log(`Document loaded from gallery: ${title}, text length: ${text.length}`)
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">No Compatible</CardTitle>
            <CardDescription>
              Tu navegador no soporta Web Speech API. Por favor, usa un navegador moderno como Chrome, Firefox o Safari.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-2 focus:rounded-md"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Accessibility className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Lector de Pantalla PWA</h1>
                <p className="text-sm text-muted-foreground">Accesibilidad avanzada con IA</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <ThemeToggle /> {/* Use the ThemeToggle component */}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button onClick={readPageContent} className="justify-start gap-2" variant="outline">
                    <FileText className="h-4 w-4" />
                    Leer Página Completa
                  </Button>

                  <Button
                    onClick={() => selectedText && handleSpeakText(selectedText)}
                    disabled={!selectedText}
                    className="justify-start gap-2"
                    variant="outline"
                  >
                    <Headphones className="h-4 w-4" />
                    Leer Selección
                  </Button>

                  <Button onClick={() => handleSpeakText(customText)} className="justify-start gap-2" variant="outline">
                    <Volume2 className="h-4 w-4" />
                    Leer Texto Personalizado
                  </Button>
                </div>

                {selectedText && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Texto Seleccionado:</Label>
                    <p className="text-sm mt-1 line-clamp-2">{selectedText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Controls */}
              <VoiceControlsLayout currentText={customText} onPlayText={handleSpeakText} />

              {/* Text Input & Speech Recognition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Texto y Reconocimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Text */}
                  <div className="space-y-2">
                    <Label>Texto Personalizado</Label>
                    <Textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Escribe el texto que quieres escuchar..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Speech Recognition */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Reconocimiento de Voz</Label>
                      <Button
                        onClick={isListening ? stopListening : startListening}
                        variant={isListening ? "destructive" : "default"}
                        size="sm"
                        className="gap-2"
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isListening ? "Detener" : "Escuchar"}
                      </Button>
                    </div>

                    {transcript && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{transcript}</p>
                        <Button onClick={() => setCustomText(transcript)} variant="ghost" size="sm" className="mt-2">
                          Usar como texto
                        </Button>
                      </div>
                    )}
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Escuchando...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePlus className="h-5 w-5" />
                  Cargar Documento
                </CardTitle>
                <CardDescription>
                  Carga archivos PDF o documentos Word (.docx) para leerlos con el sintetizador de voz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    aria-label="Cargar documento"
                  />
                  <Button onClick={triggerFileUpload} className="gap-2 w-full max-w-xs">
                    <Upload className="h-4 w-4" />
                    Seleccionar Archivo
                  </Button>
                  <p className="text-sm text-muted-foreground">Formatos soportados: PDF, Word (.docx, .doc)</p>
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Procesando documento...</p>
                </div>
              </div>
            )}

            {documentText && (
              <div className="space-y-6">
                {/* Documento */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {documentType === "pdf" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <FileSpreadsheet className="h-5 w-5" />
                        )}
                        {documentTitle || "Documento"}
                      </CardTitle>
                      {documentPages > 1 && (
                        <CardDescription>
                          Página {currentPage} de {documentPages}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          console.log("Leer Documento button clicked. isReadingDocument:", isReadingDocument)
                          if (isReadingDocument) {
                            stopReading()
                          } else {
                            startReadingDocument()
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                        aria-label="Leer documento"
                      >
                        <Volume2 className="h-4 w-4" />
                        {isReadingDocument ? "Detener Lectura" : "Leer Documento"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documentType === "pdf" && pdfDocument ? (
                      <PDFViewer
                        pdfDocument={pdfDocument}
                        currentPage={currentPage}
                        totalPages={documentPages}
                        onNextPage={nextPage}
                        onPrevPage={prevPage}
                        onGoToPage={goToPage}
                      />
                    ) : (
                      <DocumentViewer
                        text={documentText}
                        currentPage={currentPage}
                        totalPages={documentPages}
                        onNextPage={nextPage}
                        onPrevPage={prevPage}
                        onGoToPage={goToPage}
                        highlightStartIndex={highlightStartIndex} // Pass highlight props
                        highlightEndIndex={highlightEndIndex} // Pass highlight props
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Controles de Voz */}
                <VoiceControlsLayout currentText={documentText} onPlayText={handleSpeakText} />
              </div>
            )}

            {!documentText && !isLoading && (
              <DocumentFallback
                onTextExtracted={(text) => {
                  setDocumentTitle("Texto Manual")
                  setDocumentText(text)
                  setDocumentType("docx")
                  setDocumentPages(1)
                  setCurrentPage(1)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <DocumentGallery onLoadDocument={loadDocumentFromGallery} />
          </TabsContent>
        </Tabs>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle>Características de Accesibilidad</CardTitle>
            <CardDescription>
              Esta PWA está optimizada para trabajar con lectores de pantalla nativos como NVDA y VoiceOver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Compatibilidad</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• NVDA (Windows)</li>
                  <li>• VoiceOver (macOS/iOS)</li>
                  <li>• JAWS (Windows)</li>
                  <li>• TalkBack (Android)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Funciones Offline</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Síntesis de voz local</li>
                  <li>• Configuraciones guardadas</li>
                  <li>• Textos en caché</li>
                  <li>• Interfaz completamente funcional</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
