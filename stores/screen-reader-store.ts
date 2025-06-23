"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ScreenReaderState {
  // Estado de reproducción
  isPlaying: boolean
  isPaused: boolean
  isListening: boolean

  // Configuración de voz
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number

  // Reconocimiento de voz
  transcript: string

  // Soporte del navegador
  isSupported: boolean

  // Referencias internas
  utteranceRef: SpeechSynthesisUtterance | null
  recognitionRef: any

  // Acciones
  setIsPlaying: (playing: boolean) => void
  setIsPaused: (paused: boolean) => void
  setIsListening: (listening: boolean) => void
  setVoices: (voices: SpeechSynthesisVoice[]) => void
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setVolume: (volume: number) => void
  setTranscript: (transcript: string) => void
  setIsSupported: (supported: boolean) => void
  setUtteranceRef: (ref: SpeechSynthesisUtterance | null) => void
  setRecognitionRef: (ref: any) => void

  // Funciones de control
  speak: (text: string, onUtteranceEnd?: () => void, onBoundaryCallback?: (charIndex: number) => void) => void // Added onBoundaryCallback
  pause: () => void
  resume: () => void
  stop: () => void
  startListening: () => void
  stopListening: () => void
  readPageContent: () => void
  highlightText: (text: string) => void
}

export const useScreenReaderStore = create<ScreenReaderState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isPlaying: false,
      isPaused: false,
      isListening: false,
      voices: [],
      selectedVoice: null,
      rate: 1,
      pitch: 1,
      volume: 1,
      transcript: "",
      isSupported: false,
      utteranceRef: null,
      recognitionRef: null,

      // Setters
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsPaused: (paused) => set({ isPaused: paused }),
      setIsListening: (listening) => set({ isListening: listening }),
      setVoices: (voices) => set({ voices }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      setRate: (rate) => set({ rate }),
      setPitch: (pitch) => set({ pitch }),
      setVolume: (volume) => set({ volume }),
      setTranscript: (transcript) => set({ transcript }),
      setIsSupported: (supported) => set({ isSupported: supported }),
      setUtteranceRef: (ref) => set({ utteranceRef: ref }),
      setRecognitionRef: (ref) => set({ recognitionRef: ref }),

      // Funciones de control
      speak: (text: string, onUtteranceEnd?: () => void, onBoundaryCallback?: (charIndex: number) => void) => {
        const state = get()
        if (!state.isSupported || !text.trim()) {
          onUtteranceEnd?.() // Call end callback even if nothing is spoken
          return
        }

        // Detener cualquier reproducción actual
        speechSynthesis.cancel()

        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text)

          if (state.selectedVoice) {
            utterance.voice = state.selectedVoice
          }
          utterance.rate = state.rate
          utterance.pitch = state.pitch
          utterance.volume = state.volume

          utterance.onstart = () => {
            set({ isPlaying: true, isPaused: false })
          }

          utterance.onend = () => {
            set({ isPlaying: false, isPaused: false, utteranceRef: null })
            onUtteranceEnd?.() // Call the provided callback
          }

          utterance.onerror = (event) => {
            console.warn("Speech synthesis error:", event.error)
            set({ isPlaying: false, isPaused: false, utteranceRef: null })
            onUtteranceEnd?.() // Call the provided callback even on error

            if (event.error === "interrupted" && text.length < 200) {
              setTimeout(() => {
                speechSynthesis.speak(utterance)
              }, 100)
            }
          }

          utterance.onpause = () => {
            set({ isPaused: true })
          }

          utterance.onresume = () => {
            set({ isPaused: false })
          }

          utterance.onboundary = (event) => {
            if (event.name === "word" && onBoundaryCallback) {
              console.log(
                `[ScreenReaderStore] onboundary event: charIndex=${event.charIndex}, word=${text.substring(event.charIndex, event.charIndex + 10)}...`,
              )
              onBoundaryCallback(event.charIndex)
            }
          }

          set({ utteranceRef: utterance })

          if (speechSynthesis.speaking) {
            speechSynthesis.cancel()
            setTimeout(() => speechSynthesis.speak(utterance), 100)
          } else {
            speechSynthesis.speak(utterance)
          }
        }, 50)
      },

      pause: () => {
        const state = get()
        if (state.isSupported && state.isPlaying && !state.isPaused) {
          try {
            speechSynthesis.pause()
            set({ isPaused: true })
          } catch (error) {
            console.warn("Error pausing speech:", error)
          }
        }
      },

      resume: () => {
        const state = get()
        if (state.isSupported && state.isPlaying && state.isPaused) {
          try {
            speechSynthesis.resume()
            set({ isPaused: false })
          } catch (error) {
            console.warn("Error resuming speech:", error)
          }
        }
      },

      stop: () => {
        const state = get()
        if (state.isSupported) {
          try {
            speechSynthesis.cancel()
            set({ isPlaying: false, isPaused: false, utteranceRef: null })
          } catch (error) {
            console.warn("Error stopping speech:", error)
          }
        }
      },

      startListening: () => {
        const state = get()
        if (state.recognitionRef && !state.isListening) {
          set({ transcript: "" })
          state.recognitionRef.start()
          set({ isListening: true })
        }
      },

      stopListening: () => {
        const state = get()
        if (state.recognitionRef && state.isListening) {
          state.recognitionRef.stop()
        }
      },

      readPageContent: () => {
        const contentSelectors = ["main", "article", '[role="main"]', ".content", "#content"]
        let contentElement = null

        for (const selector of contentSelectors) {
          contentElement = document.querySelector(selector)
          if (contentElement) break
        }

        const content = contentElement ? contentElement.innerText : document.body.innerText
        const cleanContent = content
          .replace(/\s+/g, " ")
          .replace(/[^\w\s.,!?;:áéíóúñü]/gi, "")
          .trim()

        if (cleanContent) {
          const maxLength = 500
          const chunks = []
          let currentChunk = ""

          const sentences = cleanContent.split(/[.!?]+/)

          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxLength) {
              if (currentChunk) {
                chunks.push(currentChunk.trim())
                currentChunk = ""
              }
            }
            currentChunk += sentence + ". "
          }

          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim())
          }

          if (chunks.length > 0) {
            get().speak(chunks[0])
          }
        }
      },

      highlightText: (text: string) => {
        console.log("Highlighting text:", text)
      },
    }),
    {
      name: "screen-reader-settings",
      partialize: (state) => ({
        rate: state.rate,
        pitch: state.pitch,
        volume: state.volume,
        selectedVoice: state.selectedVoice
          ? {
              name: state.selectedVoice.name,
              lang: state.selectedVoice.lang,
            }
          : null,
      }),
    },
  ),
)
