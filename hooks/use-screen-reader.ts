"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseScreenReaderReturn {
  isPlaying: boolean
  isPaused: boolean
  isListening: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
  transcript: string
  isSupported: boolean
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  startListening: () => void
  stopListening: () => void
  setVoice: (voice: SpeechSynthesisVoice) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setVolume: (volume: number) => void
  readPageContent: () => void
  highlightText: (text: string) => void
}

export function useScreenReader(): UseScreenReaderReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const recognitionRef = useRef<any>(null)

  // Check browser support
  useEffect(() => {
    const speechSupported = "speechSynthesis" in window
    const recognitionSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    setIsSupported(speechSupported)
  }, [])

  // Load voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)

      // Set default Spanish voice if available
      const spanishVoice = availableVoices.find(
        (voice) => voice.lang.startsWith("es") || voice.name.toLowerCase().includes("spanish"),
      )
      if (spanishVoice && !selectedVoice) {
        setSelectedVoice(spanishVoice)
      } else if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0])
      }
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [isSupported, selectedVoice])

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "es-ES"

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

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      // Stop any current speech and clear the queue
      speechSynthesis.cancel()

      // Wait a bit for the cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)

        // Set voice and properties
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        utterance.onstart = () => {
          setIsPlaying(true)
          setIsPaused(false)
        }

        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          utteranceRef.current = null
        }

        utterance.onerror = (event) => {
          console.warn("Speech synthesis error:", event.error)
          setIsPlaying(false)
          setIsPaused(false)
          utteranceRef.current = null

          // Retry once if the error was 'interrupted'
          if (event.error === "interrupted" && text.length < 200) {
            setTimeout(() => {
              speechSynthesis.speak(utterance)
            }, 100)
          }
        }

        utterance.onpause = () => {
          setIsPaused(true)
        }

        utterance.onresume = () => {
          setIsPaused(false)
        }

        utteranceRef.current = utterance

        // Ensure speechSynthesis is ready
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel()
          setTimeout(() => speechSynthesis.speak(utterance), 100)
        } else {
          speechSynthesis.speak(utterance)
        }
      }, 50)
    },
    [isSupported, selectedVoice, rate, pitch, volume],
  )

  const pause = useCallback(() => {
    if (isSupported && isPlaying && !isPaused) {
      try {
        speechSynthesis.pause()
        setIsPaused(true)
      } catch (error) {
        console.warn("Error pausing speech:", error)
      }
    }
  }, [isSupported, isPlaying, isPaused])

  const resume = useCallback(() => {
    if (isSupported && isPlaying && isPaused) {
      try {
        speechSynthesis.resume()
        setIsPaused(false)
      } catch (error) {
        console.warn("Error resuming speech:", error)
      }
    }
  }, [isSupported, isPlaying, isPaused])

  const stop = useCallback(() => {
    if (isSupported) {
      try {
        speechSynthesis.cancel()
        setIsPlaying(false)
        setIsPaused(false)
        utteranceRef.current = null
      } catch (error) {
        console.warn("Error stopping speech:", error)
      }
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const readPageContent = useCallback(() => {
    // Get main content, avoiding navigation and other non-content elements
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
      // Split into smaller chunks to avoid interruption
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

      // Speak the first chunk
      if (chunks.length > 0) {
        speak(chunks[0])
      }
    }
  }, [speak])

  const highlightText = useCallback((text: string) => {
    // This would implement text highlighting functionality
    // For now, we'll just log it
    console.log("Highlighting text:", text)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    isPlaying,
    isPaused,
    isListening,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    transcript,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    startListening,
    stopListening,
    setVoice: setSelectedVoice,
    setRate,
    setPitch,
    setVolume,
    readPageContent,
    highlightText,
  }
}
