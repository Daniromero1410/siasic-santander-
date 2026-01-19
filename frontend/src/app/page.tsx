// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Página Principal (Mapa Real de Santander)
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Cpu, 
  Database, 
  Map,
  ArrowRight,
  MapPin,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-siasic-bg-primary" />
        
        {/* Grid sutil de fondo */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-siasic-accent-cyan) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-siasic-accent-cyan) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Columna izquierda - Texto */}
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-siasic-nido/10 border border-siasic-nido/20 mb-8">
                <div className="w-2 h-2 bg-siasic-nido rounded-full" />
                <span className="text-siasic-nido text-sm font-medium">Proyecto de Tesis - UDES</span>
              </div>

              {/* Título */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-siasic-text-secondary">Sistema de</span>
                <br />
                <span className="text-siasic-accent-cyan">Análisis</span>
                <br />
                <span className="text-siasic-text-primary">Sísmico</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-xl text-siasic-accent-cyan font-semibold mb-4">
                SIASIC-Santander
              </p>

              <p className="text-siasic-text-muted mb-10 max-w-lg text-lg leading-relaxed">
                Monitoreo, análisis y simulación de la actividad sísmica en Santander, 
                con énfasis en el <span className="text-siasic-nido">Nido Sísmico de Bucaramanga</span>.
              </p>

              {/* Botones */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-3 bg-siasic-accent-cyan text-siasic-bg-primary font-semibold px-8 py-4 rounded-full hover:bg-siasic-accent-cyan/90 transition-all duration-300"
                >
                  <LayoutDashboard size={20} />
                  Ver Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/simulador"
                  className="inline-flex items-center gap-3 bg-transparent text-siasic-text-primary font-semibold px-8 py-4 rounded-full border border-siasic-text-muted/30 hover:border-siasic-accent-cyan hover:text-siasic-accent-cyan transition-all duration-300"
                >
                  <Cpu size={20} />
                  Simulador
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-10">
                <div>
                  <span className="text-3xl font-bold text-siasic-accent-cyan">51+</span>
                  <span className="text-siasic-text-muted text-sm block mt-1">Sismos 2024</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-siasic-nido">147km</span>
                  <span className="text-siasic-text-muted text-sm block mt-1">Prof. Típica</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-siasic-intermedio">M5.1</span>
                  <span className="text-siasic-text-muted text-sm block mt-1">Máx. 2024</span>
                </div>
              </div>
            </div>

            {/* Columna derecha - Mapa Real de Santander */}
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-lg">
                {/* Contenedor del mapa */}
                <div className="relative">
                  {/* SVG del mapa REAL de Santander */}
                  <svg
                    viewBox="0 0 400 500"
                    className="w-full h-auto"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Definiciones */}
                    <defs>
                      <linearGradient id="mapFill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-siasic-bg-secondary)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--color-siasic-bg-card)" stopOpacity="0.6" />
                      </linearGradient>
                      
                      {/* Filtro de resplandor para el pulso */}
                      <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur"/>
                        <feMerge>
                          <feMergeNode in="blur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* FORMA REAL DE SANTANDER */}
                    <path
                      d="M185 20
                         L200 15 L220 25 L235 20 L245 30 L250 25 L260 35
                         L255 50 L265 60 L275 55 L290 70 L300 65 L315 80
                         L325 95 L320 110 L330 125 L340 140 L335 160
                         L345 175 L350 195 L345 215 L355 235 L350 255
                         L340 275 L345 295 L335 315 L320 330 L310 350
                         L295 365 L280 380 L265 395 L250 405 L240 420
                         L225 435 L210 445 L195 455 L180 460 L165 455
                         L150 445 L140 430 L125 420 L110 405 L95 390
                         L80 375 L70 355 L60 340 L55 320 L50 300
                         L45 280 L50 260 L55 240 L50 220 L55 200
                         L65 180 L60 160 L70 140 L80 120 L90 100
                         L100 85 L115 70 L130 55 L145 45 L160 35 L175 25
                         Z"
                      fill="url(#mapFill)"
                      stroke="var(--color-siasic-accent-cyan)"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                    
                    {/* Línea divisoria interna (provincias) */}
                    <path
                      d="M120 200 Q200 180 280 220"
                      stroke="var(--color-siasic-accent-cyan)"
                      strokeWidth="0.5"
                      strokeOpacity="0.15"
                      fill="none"
                    />
                    <path
                      d="M100 300 Q180 280 260 320"
                      stroke="var(--color-siasic-accent-cyan)"
                      strokeWidth="0.5"
                      strokeOpacity="0.15"
                      fill="none"
                    />
                    
                    {/* CIUDADES */}
                    {/* Bucaramanga - Capital */}
                    <circle cx="220" cy="160" r="5" fill="var(--color-siasic-accent-cyan)" />
                    <text x="235" y="155" fill="var(--color-siasic-text-secondary)" fontSize="11" fontWeight="500">
                      Bucaramanga
                    </text>
                    
                    {/* Barrancabermeja */}
                    <circle cx="95" cy="240" r="3.5" fill="var(--color-siasic-text-muted)" />
                    <text x="60" y="260" fill="var(--color-siasic-text-muted)" fontSize="9">
                      Barranca
                    </text>
                    
                    {/* San Gil */}
                    <circle cx="230" cy="300" r="3" fill="var(--color-siasic-text-muted)" />
                    <text x="245" y="305" fill="var(--color-siasic-text-muted)" fontSize="9">
                      San Gil
                    </text>
                    
                    {/* Socorro */}
                    <circle cx="200" cy="340" r="2.5" fill="var(--color-siasic-text-muted)" />
                    <text x="210" y="345" fill="var(--color-siasic-text-muted)" fontSize="8">
                      Socorro
                    </text>
                    
                    {/* Piedecuesta */}
                    <circle cx="235" cy="190" r="2.5" fill="var(--color-siasic-text-muted)" />
                    
                    {/* ════════════════════════════════════════════════════════════
                        EPICENTRO DEL NIDO SÍSMICO - SOLO PULSO
                        ════════════════════════════════════════════════════════════ */}
                    <g filter="url(#pulseGlow)">
                      {/* Círculos de pulso que se expanden */}
                      <circle 
                        cx="210" 
                        cy="180" 
                        r="12" 
                        fill="none" 
                        stroke="var(--color-siasic-nido)" 
                        strokeWidth="2"
                        className="pulse-ring"
                      />
                      <circle 
                        cx="210" 
                        cy="180" 
                        r="20" 
                        fill="none" 
                        stroke="var(--color-siasic-nido)" 
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                        className="pulse-ring-delay"
                      />
                      <circle 
                        cx="210" 
                        cy="180" 
                        r="28" 
                        fill="none" 
                        stroke="var(--color-siasic-nido)" 
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        className="pulse-ring-delay-2"
                      />
                      
                      {/* Punto central del epicentro */}
                      <circle 
                        cx="210" 
                        cy="180" 
                        r="6" 
                        fill="var(--color-siasic-nido)"
                        className="epicenter-dot"
                      />
                      <circle cx="210" cy="180" r="2.5" fill="white" />
                    </g>
                    
                    {/* Etiqueta NIDO SÍSMICO */}
                    <g transform="translate(245, 173)">
                      <rect 
                        x="0" 
                        y="-9" 
                        width="82" 
                        height="18" 
                        rx="3" 
                        fill="var(--color-siasic-bg-card)" 
                        fillOpacity="0.95"
                        stroke="var(--color-siasic-nido)" 
                        strokeWidth="1" 
                        strokeOpacity="0.5" 
                      />
                      <text x="8" y="4" fill="var(--color-siasic-nido)" fontSize="10" fontWeight="600">
                        NIDO SÍSMICO
                      </text>
                    </g>
                    
                    {/* Ícono de alerta */}
                    <g transform="translate(195, 145)">
                      <polygon 
                        points="8,0 16,14 0,14" 
                        fill="var(--color-siasic-intermedio)"
                      />
                      <text x="5.5" y="12" fill="var(--color-siasic-bg-primary)" fontSize="10" fontWeight="bold">!</text>
                    </g>
                  </svg>
                  
                  {/* Tarjetas de información */}
                  <div className="absolute top-2 right-2 bg-siasic-bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-siasic-bg-secondary shadow-lg">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-siasic-accent-cyan" />
                      <span className="text-xs text-siasic-text-primary font-medium">6.78°N, -73.18°W</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-16 left-2 bg-siasic-bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-siasic-nido/30 shadow-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-siasic-nido" />
                      <span className="text-xs text-siasic-nido font-medium">Prof: 140-180 km</span>
                    </div>
                  </div>
                </div>
                
                {/* Texto debajo del mapa */}
                <p className="text-center text-siasic-text-muted text-sm mt-2">
                  Departamento de Santander, Colombia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea de sismógrafo estática con pulso */}
        <div className="absolute bottom-0 left-0 w-full h-16 flex items-center overflow-hidden opacity-20">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 60">
            <path
              d="M0,30 L100,30 L110,30 L115,15 L120,45 L125,10 L130,50 L135,20 L140,40 L145,25 L150,35 L155,30 L200,30 L1200,30"
              fill="none"
              stroke="var(--color-siasic-accent-cyan)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN FUNCIONALIDADES
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-siasic-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-siasic-accent-cyan text-sm font-medium tracking-widest uppercase">Funcionalidades</span>
            <h2 className="text-3xl md:text-4xl font-bold text-siasic-text-primary mt-4">
              ¿Qué ofrece SIASIC?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <Link href="/dashboard" className="group">
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 h-full hover:border-siasic-accent-cyan/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-siasic-accent-cyan/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-accent-cyan/20 group-hover:bg-siasic-accent-cyan/20 transition-colors">
                  <LayoutDashboard className="text-siasic-accent-cyan" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-2">Dashboard</h3>
                <p className="text-siasic-text-muted text-sm">
                  Visualización de estadísticas, KPIs y distribuciones sísmicas.
                </p>
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="/simulador" className="group">
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 h-full hover:border-siasic-nido/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-siasic-nido/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-nido/20 group-hover:bg-siasic-nido/20 transition-colors">
                  <Cpu className="text-siasic-nido" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-2">Simulador</h3>
                <p className="text-siasic-text-muted text-sm">
                  Modelado de escenarios con predicción Omori-Utsu.
                </p>
              </div>
            </Link>

            {/* Card 3 */}
            <Link href="/datos" className="group">
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 h-full hover:border-siasic-profundo/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-siasic-profundo/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-profundo/20 group-hover:bg-siasic-profundo/20 transition-colors">
                  <Database className="text-siasic-profundo" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-2">Base de Datos</h3>
                <p className="text-siasic-text-muted text-sm">
                  Exportación en CSV, GeoJSON y KML.
                </p>
              </div>
            </Link>

            {/* Card 4 - ArcGIS */}
            <a 
              href="https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 h-full hover:border-siasic-intermedio/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-siasic-intermedio/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-intermedio/20 group-hover:bg-siasic-intermedio/20 transition-colors">
                  <Map className="text-siasic-intermedio" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-2 flex items-center gap-2">
                  ArcGIS Dashboard
                  <ExternalLink size={14} className="text-siasic-text-muted" />
                </h3>
                <p className="text-siasic-text-muted text-sm">
                  Dashboard interactivo en ArcGIS Online.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN NIDO SÍSMICO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-siasic-bg-card border border-siasic-nido/20 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-siasic-nido/10 text-siasic-nido rounded-full text-sm font-medium mb-6 border border-siasic-nido/20">
                  Fenómeno Geológico Único
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-siasic-text-primary mb-6">
                  El Nido Sísmico de Bucaramanga
                </h2>
                <p className="text-siasic-text-secondary mb-8 leading-relaxed">
                  Uno de los fenómenos sismológicos más activos del mundo. Esta zona de alta 
                  concentración sísmica, ubicada entre 140-180 km de profundidad, genera más 
                  del <span className="text-siasic-nido font-semibold">68% de los sismos</span> registrados 
                  en la región de Santander.
                </p>

                {/* Stats del Nido */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-siasic-bg-primary/50 rounded-xl">
                    <p className="text-2xl font-bold text-siasic-nido">147</p>
                    <p className="text-siasic-text-muted text-xs mt-1">km profundidad</p>
                  </div>
                  <div className="text-center p-4 bg-siasic-bg-primary/50 rounded-xl">
                    <p className="text-2xl font-bold text-siasic-accent-cyan">6.78°N</p>
                    <p className="text-siasic-text-muted text-xs mt-1">Latitud</p>
                  </div>
                  <div className="text-center p-4 bg-siasic-bg-primary/50 rounded-xl">
                    <p className="text-2xl font-bold text-siasic-accent-cyan">73.18°W</p>
                    <p className="text-siasic-text-muted text-xs mt-1">Longitud</p>
                  </div>
                </div>
              </div>

              {/* Diagrama de profundidad */}
              <div className="relative">
                <div className="aspect-[4/5] max-w-xs mx-auto bg-siasic-bg-primary/50 rounded-2xl overflow-hidden border border-siasic-bg-secondary">
                  {/* Capas */}
                  <div className="absolute inset-x-0 top-0 h-[15%] bg-gradient-to-b from-siasic-success/20 to-transparent flex items-start justify-between px-4 pt-2">
                    <span className="text-[10px] text-siasic-text-muted">Superficie</span>
                    <span className="text-[10px] text-siasic-text-muted">0 km</span>
                  </div>
                  
                  <div className="absolute inset-x-0 top-[15%] h-[25%] bg-gradient-to-b from-siasic-intermedio/10 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 border-t border-dashed border-siasic-text-muted/20 flex justify-between px-4">
                      <span className="text-[10px] text-siasic-text-muted -translate-y-3">Corteza</span>
                      <span className="text-[10px] text-siasic-text-muted -translate-y-3">70 km</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-0 top-[40%] h-[25%]">
                    <div className="absolute top-0 left-0 right-0 border-t border-dashed border-siasic-nido/30 flex justify-between px-4">
                      <span className="text-[10px] text-siasic-nido -translate-y-3">Zona Nido</span>
                      <span className="text-[10px] text-siasic-nido -translate-y-3">140 km</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 border-t border-dashed border-siasic-nido/30 flex justify-between px-4">
                      <span className="text-[10px] text-siasic-nido translate-y-1"></span>
                      <span className="text-[10px] text-siasic-nido translate-y-1">180 km</span>
                    </div>
                    
                    {/* Zona resaltada del Nido con pulso */}
                    <div className="absolute inset-0 bg-siasic-nido/10 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 w-10 h-10 bg-siasic-nido/30 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pulse-ring"></div>
                        <div className="w-6 h-6 bg-siasic-nido rounded-full shadow-lg shadow-siasic-nido/50 flex items-center justify-center relative">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-b from-siasic-danger/5 to-siasic-danger/10">
                    <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                      <span className="text-[10px] text-siasic-text-muted">Manto</span>
                      <span className="text-[10px] text-siasic-text-muted">300 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN METODOLOGÍA / TECNOLOGÍAS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-siasic-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-siasic-accent-cyan text-sm font-medium tracking-widest uppercase">Tecnologías</span>
            <h2 className="text-3xl md:text-4xl font-bold text-siasic-text-primary mt-4">
              ¿Cómo funciona SIASIC?
            </h2>
            <p className="text-siasic-text-muted mt-4 max-w-2xl mx-auto">
              Sistema desarrollado con tecnologías modernas para análisis y visualización de datos sísmicos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Backend */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <div className="w-12 h-12 bg-siasic-accent-cyan/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-accent-cyan/20">
                <Database className="text-siasic-accent-cyan" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-siasic-text-primary mb-3">Backend API</h3>
              <p className="text-siasic-text-muted text-sm mb-4">
                API REST desarrollada con FastAPI y Python para procesamiento de datos sísmicos.
              </p>
              <ul className="space-y-2 text-sm text-siasic-text-secondary">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-accent-cyan rounded-full" />
                  FastAPI + Uvicorn
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-accent-cyan rounded-full" />
                  Pandas + NumPy + SciPy
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-accent-cyan rounded-full" />
                  Modelo Omori-Utsu
                </li>
              </ul>
            </div>

            {/* Frontend */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <div className="w-12 h-12 bg-siasic-nido/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-nido/20">
                <LayoutDashboard className="text-siasic-nido" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-siasic-text-primary mb-3">Frontend Web</h3>
              <p className="text-siasic-text-muted text-sm mb-4">
                Interfaz moderna y responsiva con visualizaciones interactivas.
              </p>
              <ul className="space-y-2 text-sm text-siasic-text-secondary">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-nido rounded-full" />
                  Next.js 14 + React
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-nido rounded-full" />
                  TypeScript + Tailwind
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-nido rounded-full" />
                  Recharts + Leaflet
                </li>
              </ul>
            </div>

            {/* ArcGIS */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <div className="w-12 h-12 bg-siasic-intermedio/10 rounded-lg flex items-center justify-center mb-4 border border-siasic-intermedio/20">
                <Map className="text-siasic-intermedio" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-siasic-text-primary mb-3">ArcGIS Online</h3>
              <p className="text-siasic-text-muted text-sm mb-4">
                Mapas interactivos y análisis geoespacial profesional.
              </p>
              <ul className="space-y-2 text-sm text-siasic-text-secondary">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-intermedio rounded-full" />
                  Dashboard interactivo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-intermedio rounded-full" />
                  Exportación GeoJSON/KML
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-siasic-intermedio rounded-full" />
                  Story Maps
                </li>
              </ul>
              <a 
                href="https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-siasic-intermedio text-sm mt-4 hover:underline"
              >
                Ver Dashboard ArcGIS
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Fuente de datos */}
          <div className="mt-12 bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-siasic-text-primary mb-1">Fuente de Datos</h4>
                <p className="text-siasic-text-muted text-sm">
                  Los datos sísmicos provienen del Servicio Geológico Colombiano (SGC), 
                  la entidad oficial encargada del monitoreo sísmico en Colombia.
                </p>
              </div>
              <a 
                href="https://www.sgc.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-siasic-bg-secondary px-4 py-2 rounded-lg text-siasic-text-primary hover:bg-siasic-bg-secondary/80 transition-colors whitespace-nowrap"
              >
                Visitar SGC
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN SOBRE EL PROYECTO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-siasic-accent-cyan text-sm font-medium tracking-widest uppercase">Sobre el Proyecto</span>
            <h2 className="text-3xl md:text-4xl font-bold text-siasic-text-primary mt-4">
              Trabajo de Grado
            </h2>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-siasic-text-muted text-sm uppercase tracking-wide mb-2">Institución</h3>
                <p className="text-siasic-text-primary text-lg font-medium">Universidad de Santander (UDES)</p>
              </div>
              <div>
                <h3 className="text-siasic-text-muted text-sm uppercase tracking-wide mb-2">Programa</h3>
                <p className="text-siasic-text-primary text-lg font-medium">Ingeniería de Software</p>
              </div>
              <div>
                <h3 className="text-siasic-text-muted text-sm uppercase tracking-wide mb-2">Autor</h3>
                <p className="text-siasic-text-primary text-lg font-medium">Daniel Romero</p>
              </div>
              <div>
                <h3 className="text-siasic-text-muted text-sm uppercase tracking-wide mb-2">Año</h3>
                <p className="text-siasic-text-primary text-lg font-medium">2024 - 2025</p>
              </div>
            </div>

            <div className="border-t border-siasic-bg-secondary mt-8 pt-8">
              <p className="text-siasic-text-secondary text-center leading-relaxed">
                Este sistema fue desarrollado como proyecto de grado, integrando tecnologías modernas 
                como Next.js, FastAPI, y ArcGIS para crear una herramienta completa de análisis sísmico 
                enfocada en el fenómeno del Nido Sísmico de Bucaramanga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 border-t border-siasic-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-siasic-text-primary mb-6">
            ¿Listo para explorar los datos sísmicos?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-siasic-accent-cyan text-siasic-bg-primary font-semibold px-8 py-4 rounded-full hover:bg-siasic-accent-cyan/90 transition-all duration-300"
            >
              <LayoutDashboard size={20} />
              Ir al Dashboard
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/datos"
              className="inline-flex items-center gap-2 bg-siasic-bg-secondary text-siasic-text-primary font-semibold px-8 py-4 rounded-full border border-siasic-bg-secondary hover:border-siasic-accent-cyan/50 transition-all duration-300"
            >
              <Database size={20} />
              Ver Datos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}