"use client"

import { useEffect, useCallback } from "react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useDocumentStore } from "@/stores/document-store"
import { useDocumentProcessor } from "@/hooks/use-document-processor"

export function useDocumentReader() {
  const { speak, stop: stopScreenReader, isPlaying, isPaused } = useScreenReaderStore()
  const {
    documentText, // Current page text (from document store)
    documentType,
    documentPages,
    currentPage,
    pdfDocument,
    isLoading,
    setDocumentText,
    setCurrentPage,
    setIsLoading,
    isReadingDocument,
    currentReadingPageIndex,
    currentReadingChunkIndex,
    pageTextChunks,
    startReading,
    stopReading,
    setPageTextChunks,
    nextChunk,
    resetReadingProgress,
    setHighlightRange, // Get from document store
  } = useDocumentStore()

  const { loadPdfPage } = useDocumentProcessor()

  // Helper to chunk text into smaller, manageable pieces for speech synthesis
  const chunkText = useCallback((text: string): Array<{ text: string; globalStartIndex: number }> => {
    const maxLength = 500
    const chunks: Array<{ text: string; globalStartIndex: number }> = []
    let currentGlobalIndex = 0

    while (currentGlobalIndex < text.length) {
      const endOfChunkCandidate = Math.min(currentGlobalIndex + maxLength, text.length)
      const chunkContent = text.substring(currentGlobalIndex, endOfChunkCandidate)

      // Find the last space or punctuation to break cleanly
      let breakIndex = -1
      // Search backwards from the end of the chunk candidate
      for (let i = chunkContent.length - 1; i >= 0; i--) {
        // Look for a space, newline, or common punctuation that signifies a word/sentence end
        if (/\s|[.,!?;:()[\]{}<>"']/.test(chunkContent[i])) {
          breakIndex = i
          break
        }
      }

      let actualEndOfChunk
      if (breakIndex !== -1 && currentGlobalIndex + breakIndex > currentGlobalIndex + maxLength * 0.7) {
        // If a good break point is found towards the end of the chunk (last 30%), use it
        actualEndOfChunk = currentGlobalIndex + breakIndex + 1
      } else {
        // Otherwise, just take up to maxLength, or the end of the text
        actualEndOfChunk = endOfChunkCandidate
      }

      const finalChunkText = text.substring(currentGlobalIndex, actualEndOfChunk).trim()
      if (finalChunkText.length > 0) {
        chunks.push({ text: finalChunkText, globalStartIndex: currentGlobalIndex })
      }

      currentGlobalIndex = actualEndOfChunk
      // Skip any leading whitespace for the next chunk
      while (currentGlobalIndex < text.length && /\s/.test(text[currentGlobalIndex])) {
        currentGlobalIndex++
      }
    }
    console.log(`[useDocumentReader] Chunked text into ${chunks.length} chunks.`)
    return chunks
  }, [])

  // Callback for when an utterance ends
  const handleUtteranceEnd = useCallback(async () => {
    console.log(
      "[useDocumentReader] handleUtteranceEnd called. isReadingDocument:",
      isReadingDocument,
      "currentReadingChunkIndex:",
      currentReadingChunkIndex,
      "pageTextChunks.length:",
      pageTextChunks.length,
    )
    if (!isReadingDocument) {
      console.log("[useDocumentReader] Not in reading mode, stopping handleUtteranceEnd.")
      setHighlightRange(null, null) // Clear highlight
      return // Only proceed if actively reading a document
    }

    // Check if there are more chunks on the current page
    if (currentReadingChunkIndex + 1 < pageTextChunks.length) {
      console.log("[useDocumentReader] Advancing to next chunk on current page.")
      nextChunk() // Advance chunk index
      // The useEffect below will pick up the new chunk index and call readCurrentChunk
    } else {
      // No more chunks on this page, end reading
      console.log("[useDocumentReader] No more chunks in document. Finished reading.")
      stopReading()
      stopScreenReader()
      setIsLoading(false)
      setHighlightRange(null, null) // Clear highlight
    }
  }, [
    isReadingDocument,
    currentReadingChunkIndex,
    pageTextChunks,
    nextChunk,
    stopReading,
    stopScreenReader,
    setIsLoading,
    setHighlightRange,
  ])

  // New callback for word boundaries
  const handleBoundary = useCallback(
    (charIndexInChunk: number) => {
      if (!isReadingDocument || pageTextChunks.length === 0) {
        setHighlightRange(null, null) // Clear highlight if not reading or no chunks
        return
      }

      const currentChunkData = pageTextChunks[currentReadingChunkIndex]
      if (!currentChunkData) {
        setHighlightRange(null, null)
        return
      }

      const globalWordStartIndex = currentChunkData.globalStartIndex + charIndexInChunk
      const fullText = documentText

      // Find the end of the current word by looking for the next whitespace or punctuation.
      // This assumes charIndex is the start of the word.
      let globalWordEndIndex = globalWordStartIndex
      while (globalWordEndIndex < fullText.length && !/\s|[.,!?;:()[\]{}<>"']/.test(fullText[globalWordEndIndex])) {
        globalWordEndIndex++
      }

      // If the word is empty (e.g., multiple spaces, or just punctuation was spoken), ensure we don't highlight nothing.
      // This check is important if the synthesizer fires onboundary for non-word characters.
      if (globalWordStartIndex === globalWordEndIndex) {
        console.log(
          `[useDocumentReader] Boundary at non-word character or empty word. Clearing highlight. Index: ${globalWordStartIndex}`,
        )
        setHighlightRange(null, null) // Clear highlight for non-word boundaries
        return
      }

      console.log(
        `[useDocumentReader] Setting highlight: globalStartIndex=${globalWordStartIndex}, globalWordEndIndex=${globalWordEndIndex}. Word: "${fullText.substring(globalWordStartIndex, globalWordEndIndex)}"`,
      )
      setHighlightRange(globalWordStartIndex, globalWordEndIndex)
    },
    [isReadingDocument, pageTextChunks, currentReadingChunkIndex, documentText, setHighlightRange],
  )

  // Function to read the current chunk
  const readCurrentChunk = useCallback(() => {
    if (isReadingDocument && pageTextChunks.length > 0 && currentReadingChunkIndex < pageTextChunks.length) {
      const textToSpeak = pageTextChunks[currentReadingChunkIndex].text // Get the text from the object
      console.log(
        `[useDocumentReader] Speaking chunk ${currentReadingChunkIndex + 1}/${pageTextChunks.length} (global start: ${pageTextChunks[currentReadingChunkIndex].globalStartIndex}) of document:`,
        textToSpeak.substring(0, Math.min(textToSpeak.length, 50)) + "...",
      )
      speak(textToSpeak, handleUtteranceEnd, handleBoundary) // Pass handleBoundary
    } else if (isReadingDocument) {
      // If no chunks left on this page, or initial state, try to advance
      console.log("[useDocumentReader] No more chunks on current page or initial state, attempting to advance.")
      handleUtteranceEnd()
    }
  }, [isReadingDocument, pageTextChunks, currentReadingChunkIndex, speak, handleUtteranceEnd, handleBoundary])

  // Effect to start reading when documentText or reading state changes
  useEffect(() => {
    console.log(
      "[useDocumentReader] useEffect triggered. isReadingDocument:",
      isReadingDocument,
      "isPaused:",
      isPaused,
      "documentText length:",
      documentText.length,
      "pageTextChunks length:",
      pageTextChunks.length,
      "currentReadingChunkIndex:",
      currentReadingChunkIndex,
    )
    if (isReadingDocument && !isPaused) {
      // Only read if not paused
      if (pageTextChunks.length > 0 && currentReadingChunkIndex < pageTextChunks.length) {
        console.log("[useDocumentReader] Reading current chunk.")
        readCurrentChunk()
      } else if (documentText.trim().length > 0) {
        // Initial chunking for the first page/document or if chunks were reset
        console.log("[useDocumentReader] Initial chunking or chunks reset. Chunking documentText.")
        // Reset highlight when starting new chunking
        setHighlightRange(null, null)
        // Recalculate chunks with global start indices
        setPageTextChunks(chunkText(documentText))
      } else {
        console.log("[useDocumentReader] isReadingDocument is true but documentText is empty. Stopping reading.")
        stopReading() // Stop if no text found after starting
        stopScreenReader()
        setHighlightRange(null, null) // Clear highlight
      }
    } else if (!isReadingDocument) {
      // If reading is stopped, clear highlight
      setHighlightRange(null, null)
    }
  }, [
    isReadingDocument,
    isPaused,
    pageTextChunks,
    currentReadingChunkIndex,
    documentText,
    readCurrentChunk,
    setPageTextChunks,
    chunkText,
    stopReading,
    stopScreenReader,
    setHighlightRange,
  ])

  // Function to initiate reading from the current document state
  const startReadingDocument = useCallback(() => {
    console.log("[useDocumentReader] startReadingDocument called.")
    if (documentText.trim()) {
      console.log("[useDocumentReader] Document text is not empty. Initializing reading.")
      stopScreenReader() // Ensure any previous speech is stopped
      resetReadingProgress() // Reset page and chunk index for a fresh start
      startReading() // Set isReadingDocument to true
      setCurrentPage(1) // Ensure we start from page 1 visually
      setHighlightRange(null, null) // Clear any previous highlight
      // The useEffect above will pick this up and start reading
    } else {
      console.warn(
        "[useDocumentReader] No document text to read when startReadingDocument was called. DocumentText is empty.",
      )
      // This might happen if the document hasn't finished loading/processing yet.
      // Or if the document is truly empty.
    }
  }, [documentText, startReading, resetReadingProgress, stopScreenReader, setCurrentPage, setHighlightRange])

  // Stop reading if the screen reader is stopped externally (e.g., by stop button)
  useEffect(() => {
    if (!isPlaying && isReadingDocument && !isPaused) {
      // If screen reader stops playing and we were reading, and not just paused
      stopReading()
      setHighlightRange(null, null) // Clear highlight
      console.log("[useDocumentReader] Continuous document reading stopped externally.")
    }
  }, [isPlaying, isReadingDocument, isPaused, stopReading, setHighlightRange])

  return {
    startReadingDocument,
    isReadingDocument,
    stopReadingDocument: stopReading, // Expose stop function
  }
}
