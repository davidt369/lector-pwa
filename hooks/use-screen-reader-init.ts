"use client"

import { useEffect } from "react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"

// Configuración de voces en español por región
const SPANISH_VOICE_PRIORITIES = [
  // Español de España
  { lang: "es-ES", region: "España", priority: 1 },

  // Español de México
  { lang: "es-MX", region: "México", priority: 2 },

  // Español de Argentina
  { lang: "es-AR", region: "Argentina", priority: 3 },

  // Español de Colombia
  { lang: "es-CO", region: "Colombia", priority: 4 },

  // Español de Chile
  { lang: "es-CL", region: "Chile", priority: 5 },

  // Español de Perú
  { lang: "es-PE", region: "Perú", priority: 6 },

  // Español de Venezuela
  { lang: "es-VE", region: "Venezuela", priority: 7 },

  // Español de Ecuador
  { lang: "es-EC", region: "Ecuador", priority: 8 },

  // Español de Guatemala
  { lang: "es-GT", region: "Guatemala", priority: 9 },

  // Español de Uruguay
  { lang: "es-UY", region: "Uruguay", priority: 10 },

  // Español de Paraguay
  { lang: "es-PY", region: "Paraguay", priority: 11 },

  // Español de Bolivia
  { lang: "es-BO", region: "Bolivia", priority: 12 },

  // Español de Costa Rica
  { lang: "es-CR", region: "Costa Rica", priority: 13 },

  // Español de República Dominicana
  { lang: "es-DO", region: "República Dominicana", priority: 14 },

  // Español de El Salvador
  { lang: "es-SV", region: "El Salvador", priority: 15 },

  // Español de Honduras
  { lang: "es-HN", region: "Honduras", priority: 16 },

  // Español de Nicaragua
  { lang: "es-NI", region: "Nicaragua", priority: 17 },

  // Español de Panamá
  { lang: "es-PA", region: "Panamá", priority: 18 },

  // Español de Puerto Rico
  { lang: "es-PR", region: "Puerto Rico", priority: 19 },

  // Español de Cuba
  { lang: "es-CU", region: "Cuba", priority: 20 },

  // Español genérico
  { lang: "es", region: "Español", priority: 21 },
]

// Palabras clave para identificar voces en español
const SPANISH_VOICE_KEYWORDS = [
  "spanish",
  "español",
  "espanol",
  "castilian",
  "castellano",
  "mexico",
  "mexican",
  "argentina",
  "argentino",
  "colombia",
  "colombiano",
  "chile",
  "chileno",
  "peru",
  "peruano",
  "venezuela",
  "venezolano",
  "ecuador",
  "ecuatoriano",
  "guatemala",
  "guatemalteco",
  "uruguay",
  "uruguayo",
  "paraguay",
  "paraguayo",
  "bolivia",
  "boliviano",
  "costa rica",
  "costarricense",
  "dominican",
  "dominicano",
  "salvador",
  "salvadoreño",
  "honduras",
  "hondureño",
  "nicaragua",
  "nicaraguense",
  "panama",
  "panameño",
  "puerto rico",
  "puertorriqueño",
  "cuba",
  "cubano",
]

function getVoiceRegion(voice: SpeechSynthesisVoice): string {
  // Buscar por código de idioma exacto
  const exactMatch = SPANISH_VOICE_PRIORITIES.find((config) => voice.lang.toLowerCase() === config.lang.toLowerCase())
  if (exactMatch) return exactMatch.region

  // Buscar por código de idioma base (ej: es-MX -> es)
  const baseMatch = SPANISH_VOICE_PRIORITIES.find((config) =>
    voice.lang.toLowerCase().startsWith(config.lang.toLowerCase()),
  )
  if (baseMatch) return baseMatch.region

  // Buscar por palabras clave en el nombre
  const voiceName = voice.name.toLowerCase()
  for (const keyword of SPANISH_VOICE_KEYWORDS) {
    if (voiceName.includes(keyword)) {
      // Intentar mapear la palabra clave a una región específica
      if (keyword.includes("mexico") || keyword.includes("mexican")) return "México"
      if (keyword.includes("argentina") || keyword.includes("argentino")) return "Argentina"
      if (keyword.includes("colombia") || keyword.includes("colombiano")) return "Colombia"
      if (keyword.includes("chile") || keyword.includes("chileno")) return "Chile"
      if (keyword.includes("peru") || keyword.includes("peruano")) return "Perú"
      if (keyword.includes("venezuela") || keyword.includes("venezolano")) return "Venezuela"
      if (keyword.includes("ecuador") || keyword.includes("ecuatoriano")) return "Ecuador"
      if (keyword.includes("guatemala") || keyword.includes("guatemalteco")) return "Guatemala"
      if (keyword.includes("uruguay") || keyword.includes("uruguayo")) return "Uruguay"
      if (keyword.includes("paraguay") || keyword.includes("paraguayo")) return "Paraguay"
      if (keyword.includes("bolivia") || keyword.includes("boliviano")) return "Bolivia"
      if (keyword.includes("costa rica") || keyword.includes("costarricense")) return "Costa Rica"
      if (keyword.includes("dominican") || keyword.includes("dominicano")) return "República Dominicana"
      if (keyword.includes("salvador") || keyword.includes("salvadoreño")) return "El Salvador"
      if (keyword.includes("honduras") || keyword.includes("hondureño")) return "Honduras"
      if (keyword.includes("nicaragua") || keyword.includes("nicaraguense")) return "Nicaragua"
      if (keyword.includes("panama") || keyword.includes("panameño")) return "Panamá"
      if (keyword.includes("puerto rico") || keyword.includes("puertorriqueño")) return "Puerto Rico"
      if (keyword.includes("cuba") || keyword.includes("cubano")) return "Cuba"
      return "España" // Por defecto para español genérico
    }
  }

  return "Desconocido"
}

function isSpanishVoice(voice: SpeechSynthesisVoice): boolean {
  // Verificar por código de idioma
  if (voice.lang.toLowerCase().startsWith("es")) return true

  // Verificar por palabras clave en el nombre
  const voiceName = voice.name.toLowerCase()
  return SPANISH_VOICE_KEYWORDS.some((keyword) => voiceName.includes(keyword))
}

function sortVoicesByPriority(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.sort((a, b) => {
    const aIsSpanish = isSpanishVoice(a)
    const bIsSpanish = isSpanishVoice(b)

    // Priorizar voces en español
    if (aIsSpanish && !bIsSpanish) return -1
    if (!aIsSpanish && bIsSpanish) return 1

    // Si ambas son en español, ordenar por prioridad regional
    if (aIsSpanish && bIsSpanish) {
      const aPriority =
        SPANISH_VOICE_PRIORITIES.find((config) => a.lang.toLowerCase().startsWith(config.lang.toLowerCase()))
          ?.priority || 999

      const bPriority =
        SPANISH_VOICE_PRIORITIES.find((config) => b.lang.toLowerCase().startsWith(config.lang.toLowerCase()))
          ?.priority || 999

      return aPriority - bPriority
    }

    // Para voces no españolas, ordenar alfabéticamente
    return a.name.localeCompare(b.name)
  })
}

export function useScreenReaderInit() {
  const {
    setIsSupported,
    setVoices,
    setSelectedVoice,
    selectedVoice,
    voices,
    setRecognitionRef,
    setTranscript,
    setIsListening,
  } = useScreenReaderStore()

  useEffect(() => {
    // Verificar soporte del navegador
    const speechSupported = "speechSynthesis" in window
    setIsSupported(speechSupported)

    if (!speechSupported) return

    // Cargar voces
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()

      // Ordenar voces por prioridad (español primero, luego por región)
      const sortedVoices = sortVoicesByPriority(availableVoices)
      setVoices(sortedVoices)

      // Restaurar voz seleccionada o establecer una por defecto
      if (selectedVoice && availableVoices.length > 0) {
        const savedVoice = availableVoices.find(
          (voice) => voice.name === selectedVoice.name && voice.lang === selectedVoice.lang,
        )
        if (savedVoice) {
          setSelectedVoice(savedVoice)
          return
        }
      }

      // Si no hay voz guardada o no se encontró, buscar la mejor voz en español
      if (sortedVoices.length > 0 && !selectedVoice) {
        // Buscar la primera voz en español disponible
        const spanishVoice = sortedVoices.find((voice) => isSpanishVoice(voice))

        if (spanishVoice) {
          setSelectedVoice(spanishVoice)
          console.log(`Voz seleccionada: ${spanishVoice.name} (${spanishVoice.lang}) - ${getVoiceRegion(spanishVoice)}`)
        } else {
          // Si no hay voces en español, usar la primera disponible
          setSelectedVoice(sortedVoices[0])
        }
      }
    }

    // Cargar voces inmediatamente y cuando cambien
    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    // Inicializar reconocimiento de voz
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "es-ES" // Usar español de España como base

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      setRecognitionRef(recognition)
    }

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  // Log de voces disponibles para debugging
  useEffect(() => {
    if (voices.length > 0) {
      console.log("Voces disponibles:")
      voices.forEach((voice, index) => {
        const region = getVoiceRegion(voice)
        const isSpanish = isSpanishVoice(voice)
        console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${region} ${isSpanish ? "🇪🇸" : ""}`)
      })
    }
  }, [voices])
}
