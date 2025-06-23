"use client"

import { Textarea } from "@/components/ui/textarea"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Volume2, FileText, Info } from "lucide-react"

interface DocumentFallbackProps {
  onTextExtracted: (text: string) => void
}

export function DocumentFallback({ onTextExtracted }: DocumentFallbackProps) {
  const [manualText, setManualText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualText.trim()) {
      onTextExtracted(manualText)
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Si tienes problemas para cargar documentos automáticamente, puedes copiar y pegar el contenido aquí. También
          puedes intentar convertir tu PDF a texto usando herramientas online antes de pegarlo aquí.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Entrada Manual de Texto
          </CardTitle>
          <CardDescription>
            Copia y pega el contenido de tu documento para poder escucharlo con el sintetizador de voz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={`Pega aquí el contenido de tu documento...

Consejos:
• Para PDFs: Usa Ctrl+A para seleccionar todo el texto, luego Ctrl+C para copiarlo
• Para documentos Word: Abre el documento, selecciona el texto y cópialo
• Para páginas web: Selecciona el texto que quieres escuchar y cópialo`}
              className="min-h-[200px]"
            />
            <Button type="submit" className="gap-2" disabled={!manualText.trim()}>
              <Volume2 className="h-4 w-4" />
              Usar este texto
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
