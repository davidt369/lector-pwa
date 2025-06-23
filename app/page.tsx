"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accessibility, Headphones, Wifi, BookOpen, Mail, Phone, MapPin, MenuIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button-aria" // Use our custom accessible Button
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu-aria" // Use our custom accessible Menu
import { Form, TextField, Label, Input, FieldError, TextArea } from "@/components/ui/form-aria" // Use our custom accessible Form components
import { useState } from "react"

export default function LandingPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus("idle")
    setErrorMessage("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) {
      setFormStatus("error")
      setErrorMessage("Por favor, rellena todos los campos obligatorios.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormStatus("error")
      setErrorMessage("Por favor, introduce un correo electrónico válido.")
      return
    }

    // Simulate API call
    try {
      // In a real application, you would send this data to your backend
      console.log("Form submitted:", { name, email, message })
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
      setFormStatus("success")
      e.currentTarget.reset() // Clear form
    } catch (error) {
      console.error("Form submission error:", error)
      setFormStatus("error")
      setErrorMessage("Hubo un error al enviar tu mensaje. Inténtalo de nuevo más tarde.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

            <nav className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <ul className="hidden md:flex items-center gap-4">
                <li>
                  <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/reader" className="text-sm font-medium">
                      Ir a la App
                    </Link>
                  </Button>
                </li>
              </ul>

              {/* Mobile Navigation (Hamburger Menu) */}
              <div className="md:hidden">
                <MenuTrigger>
                  <Button variant="ghost" size="icon" aria-label="Abrir menú de navegación">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                  <Menu className="w-48">
                    <MenuItem href="#features">Características</MenuItem>
                    <MenuItem href="#contact">Contacto</MenuItem>
                    <MenuItem href="/reader">Ir a la App</MenuItem>
                  </Menu>
                </MenuTrigger>
              </div>

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow container mx-auto px-4 py-12 space-y-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 md:py-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Tu Voz, Tu Lectura: Accesibilidad al Alcance de Todos
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforma cualquier texto en audio con nuestra PWA de lector de pantalla. Diseñada para la inclusión,
            ofrece una experiencia de lectura fluida y personalizable, incluso sin conexión.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg" asChild>
              <Link href="/reader" className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Empezar a Leer
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Saber Más
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-8 py-8">
          <h3 className="text-3xl font-bold text-center">Características Clave</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Headphones className="h-8 w-8 text-primary" />
                <CardTitle>Lectura de Texto Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                Escucha cualquier texto con voces naturales y personalizables. Ajusta la velocidad, el tono y el volumen
                a tu gusto.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary" />
                <CardTitle>Soporte para Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                Carga y lee documentos PDF y Word (.docx) directamente en la aplicación, con soporte para múltiples
                páginas.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wifi className="h-8 w-8 text-primary" />
                <CardTitle>Funcionalidad Offline</CardTitle>
              </CardHeader>
              <CardContent>
                Accede a tus textos y configuraciones guardadas incluso sin conexión a internet, ideal para usar en
                cualquier lugar.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Accessibility className="h-8 w-8 text-primary" />
                <CardTitle>Diseño Accesible</CardTitle>
              </CardHeader>
              <CardContent>
                Desarrollada con los estándares WCAG 2.1 AA en mente, garantizando compatibilidad con lectores de
                pantalla y navegación por teclado.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="space-y-8 py-8 bg-muted rounded-lg p-8">
          <h3 className="text-3xl font-bold text-center">Lo que dicen nuestros usuarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-lg italic text-center">
                  &quot;Esta PWA ha cambiado mi forma de consumir contenido. La lectura de documentos es impecable y la
                  accesibilidad es de primera.&quot;
                </p>
                <p className="text-sm font-semibold text-right">- María G., Estudiante</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-lg italic text-center">
                  &quot;Finalmente una herramienta que realmente funciona offline y me permite leer mis PDFs en
                  cualquier momento. ¡Imprescindible!&quot;
                </p>
                <p className="text-sm font-semibold text-right">- Carlos R., Profesional</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="space-y-8 py-8">
          <h3 className="text-3xl font-bold text-center">Contáctanos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 space-y-4">
              <CardTitle className="text-2xl">Envíanos un Mensaje</CardTitle>
              <CardDescription>
                ¿Tienes preguntas o sugerencias? Rellena el formulario y nos pondremos en contacto contigo.
              </CardDescription>
              <Form onSubmit={handleSubmit} className="space-y-4">
                <TextField isRequired className="space-y-2">
                  <Label>Nombre</Label>
                  <Input name="name" placeholder="Tu nombre" />
                  <FieldError />
                </TextField>
                <TextField isRequired type="email" className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input name="email" placeholder="tu@ejemplo.com" />
                  <FieldError />
                </TextField>
                <TextField isRequired className="space-y-2">
                  <Label>Mensaje</Label>
                  <TextArea name="message" placeholder="Escribe tu mensaje aquí..." className="min-h-[100px]" />
                  <FieldError />
                </TextField>
                <Button type="submit" variant="default" className="w-full">
                  Enviar Mensaje
                </Button>
                {formStatus === "success" && (
                  <div className="text-green-600 text-sm mt-2" role="status" aria-live="polite">
                    ¡Mensaje enviado con éxito!
                  </div>
                )}
                {formStatus === "error" && (
                  <div className="text-destructive text-sm mt-2" role="alert" aria-live="assertive">
                    Error: {errorMessage}
                  </div>
                )}
              </Form>
            </Card>

            <Card className="p-6 space-y-4">
              <CardTitle className="text-2xl">Información de Contacto</CardTitle>
              <CardDescription>También puedes encontrarnos en:</CardDescription>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>soporte@lectorpwa.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+34 123 456 789</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Calle Ficticia 123, Ciudad, País</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lector de Pantalla PWA. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
