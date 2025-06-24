"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true)
      
      // Show toast notification on mobile
      if (isMobile) {
        toast("📱 ¡Instala la App!", {
          description: "Descarga nuestra app para una mejor experiencia",
          action: {
            label: "Instalar",
            onClick: handleInstallClick,
          },
          duration: 10000, // 10 seconds
        })
      }
    }

    const handleAppInstalled = () => {
      // Hide the install promotion
      setShowInstallButton(false)
      setDeferredPrompt(null)
      console.log('PWA was installed')
      
      // Show success toast
      toast.success("¡App instalada exitosamente!", {
        description: "Ya puedes acceder desde tu pantalla de inicio",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isMobile])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      toast.success("Instalando la app...", {
        description: "La aplicación se está instalando en tu dispositivo",
      })
    } else {
      console.log('User dismissed the install prompt')
      toast.info("Instalación cancelada", {
        description: "Puedes instalar la app en cualquier momento",
      })
    }

    // Clear the deferred prompt variable
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // On mobile, don't show the floating button since we show a toast
  if (isMobile || !showInstallButton) {
    return null
  }

  // Show floating button on desktop
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleInstallClick}
        className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        📱 Instalar App
      </Button>
    </div>
  )
}
