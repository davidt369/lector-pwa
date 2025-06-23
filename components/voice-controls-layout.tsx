"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Settings } from "lucide-react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"

interface VoiceControlsLayoutProps {
  currentText?: string
  onPlayText?: (text: string) => void
}

// Función para obtener la región de una voz
function getVoiceRegion(voice: SpeechSynthesisVoice): string {
  const langRegionMap: { [key: string]: string } = {
    "es-ES": "España",
    "es-MX": "México",
    "es-AR": "Argentina",
    "es-CO": "Colombia",
    "es-CL": "Chile",
    "es-PE": "Perú",
    "es-VE": "Venezuela",
    "es-EC": "Ecuador",
    "es-GT": "Guatemala",
    "es-UY": "Uruguay",
    "es-PY": "Paraguay",
    "es-BO": "Bolivia",
    "es-CR": "Costa Rica",
    "es-DO": "República Dominicana",
    "es-SV": "El Salvador",
    "es-HN": "Honduras",
    "es-NI": "Nicaragua",
    "es-PA": "Panamá",
    "es-PR": "Puerto Rico",
    "es-CU": "Cuba",
    es: "Español",
  }

  // Buscar por código exacto
  if (langRegionMap[voice.lang]) {
    return langRegionMap[voice.lang]
  }

  // Buscar por código base
  const baseLang = voice.lang.split("-")[0]
  if (langRegionMap[baseLang]) {
    return langRegionMap[baseLang]
  }

  // Buscar por palabras clave en el nombre
  const voiceName = voice.name.toLowerCase()
  if (voiceName.includes("mexico") || voiceName.includes("mexican")) return "México"
  if (voiceName.includes("argentina") || voiceName.includes("argentino")) return "Argentina"
  if (voiceName.includes("colombia") || voiceName.includes("colombiano")) return "Colombia"
  if (voiceName.includes("chile") || voiceName.includes("chileno")) return "Chile"
  if (voiceName.includes("peru") || voiceName.includes("peruano")) return "Perú"
  if (voiceName.includes("venezuela") || voiceName.includes("venezolano")) return "Venezuela"
  if (voiceName.includes("ecuador") || voiceName.includes("ecuatoriano")) return "Ecuador"
  if (voiceName.includes("guatemala") || voiceName.includes("guatemalteco")) return "Guatemala"
  if (voiceName.includes("uruguay") || voiceName.includes("uruguayo")) return "Uruguay"
  if (voiceName.includes("paraguay") || voiceName.includes("paraguayo")) return "Paraguay"
  if (voiceName.includes("bolivia") || voiceName.includes("boliviano")) return "Bolivia"
  if (voiceName.includes("costa rica") || voiceName.includes("costarricense")) return "Costa Rica"
  if (voiceName.includes("dominican") || voiceName.includes("dominicano")) return "República Dominicana"
  if (voiceName.includes("salvador") || voiceName.includes("salvadoreño")) return "El Salvador"
  if (voiceName.includes("honduras") || voiceName.includes("hondureño")) return "Honduras"
  if (voiceName.includes("nicaragua") || voiceName.includes("nicaraguense")) return "Nicaragua"
  if (voiceName.includes("panama") || voiceName.includes("panameño")) return "Panamá"
  if (voiceName.includes("puerto rico") || voiceName.includes("puertorriqueño")) return "Puerto Rico"
  if (voiceName.includes("cuba") || voiceName.includes("cubano")) return "Cuba"
  if (voiceName.includes("spanish") || voiceName.includes("español")) return "España"

  return voice.lang || "Desconocido"
}

// Función para verificar si una voz es en español
function isSpanishVoice(voice: SpeechSynthesisVoice): boolean {
  return (
    voice.lang.toLowerCase().startsWith("es") ||
    voice.name.toLowerCase().includes("spanish") ||
    voice.name.toLowerCase().includes("español")
  )
}

// Función para obtener el emoji de la bandera
function getRegionFlag(region: string): string {
  const flagMap: { [key: string]: string } = {
    España: "🇪🇸",
    México: "🇲🇽",
    Argentina: "🇦🇷",
    Colombia: "🇨🇴",
    Chile: "🇨🇱",
    Perú: "🇵🇪",
    Venezuela: "🇻🇪",
    Ecuador: "🇪🇨",
    Guatemala: "🇬🇹",
    Uruguay: "🇺🇾",
    Paraguay: "🇵🇾",
    Bolivia: "🇧🇴",
    "Costa Rica": "🇨🇷",
    "República Dominicana": "🇩🇴",
    "El Salvador": "🇸🇻",
    Honduras: "🇭🇳",
    Nicaragua: "🇳🇮",
    Panamá: "🇵🇦",
    "Puerto Rico": "🇵🇷",
    Cuba: "🇨🇺",
  }
  return flagMap[region] || "🌍"
}

export function VoiceControlsLayout({ currentText, onPlayText }: VoiceControlsLayoutProps) {
  const {
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    speak,
    pause,
    resume,
    stop,
    setSelectedVoice,
    setRate,
    setPitch,
    setVolume,
  } = useScreenReaderStore()

  const handlePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      if (onPlayText && currentText) {
        onPlayText(currentText)
      } else if (currentText) {
        speak(currentText)
      }
    }
  }

  // Agrupar voces por tipo (español vs otros idiomas)
  const spanishVoices = voices.filter((voice) => isSpanishVoice(voice))
  const otherVoices = voices.filter((voice) => !isSpanishVoice(voice))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Controles de Voz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={handlePlay} size="lg" className="gap-2" disabled={!currentText}>
            {isPlaying ? (
              isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? (isPaused ? "Reanudar" : "Pausar") : "Reproducir"}
          </Button>

          <Button onClick={stop} disabled={!isPlaying} variant="outline" size="lg">
            <Square className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>Voz</Label>
          {selectedVoice && (
            <div className="mb-2">
              <Badge variant="secondary" className="gap-1">
                {getRegionFlag(getVoiceRegion(selectedVoice))} {getVoiceRegion(selectedVoice)}
              </Badge>
            </div>
          )}
          <Select
            value={selectedVoice?.name || ""}
            onValueChange={(value) => {
              const voice = voices.find((v) => v.name === value)
              if (voice) setSelectedVoice(voice)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar voz" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {spanishVoices.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">🇪🇸 Voces en Español</div>
                  {spanishVoices.map((voice) => {
                    const region = getVoiceRegion(voice)
                    const flag = getRegionFlag(region)
                    return (
                      <SelectItem key={voice.name} value={voice.name}>
                        <div className="flex items-center gap-2">
                          <span>{flag}</span>
                          <span>{voice.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        </div>
                      </SelectItem>
                    )
                  })}
                </>
              )}

              {otherVoices.length > 0 && (
                <>
                  {spanishVoices.length > 0 && <Separator className="my-2" />}
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">🌍 Otros Idiomas</div>
                  {otherVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <span>{voice.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {voice.lang}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Rate Control */}
        <div className="space-y-2">
          <Label>Velocidad: {rate.toFixed(1)}x</Label>
          <Slider
            value={[rate]}
            onValueChange={(value) => setRate(value[0])}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <Label>Tono: {pitch.toFixed(1)}</Label>
          <Slider
            value={[pitch]}
            onValueChange={(value) => setPitch(value[0])}
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <Label>Volumen: {Math.round(volume * 100)}%</Label>
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
