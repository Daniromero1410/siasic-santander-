// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Explorador de Datos con Exportación Avanzada
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Database, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileJson,
  FileCode,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { sismosApi } from "@/lib/api";
import { Sismo, TipoProfundidad } from "@/types";
import { formatDateTime } from "@/lib/utils";

type SortField = "fecha_hora" | "magnitud" | "profundidad" | "municipio";
type SortOrder = "asc" | "desc";
type ExportFormat = "csv" | "geojson" | "kml";

export default function DatosPage() {
  // Estados principales
  const [sismos, setSismos] = useState<Sismo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState<ExportFormat | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMagnitudMin, setFiltroMagnitudMin] = useState<number | "">("");
  const [filtroMagnitudMax, setFiltroMagnitudMax] = useState<number | "">("");
  const [filtroProfundidadMin, setFiltroProfundidadMin] = useState<number | "">("");
  const [filtroProfundidadMax, setFiltroProfundidadMax] = useState<number | "">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoProfundidad | "">("");
  const [filtroSantander, setFiltroSantander] = useState<boolean | "">("");

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>("fecha_hora");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await sismosApi.getTodos();
        setSismos(data);
      } catch (err) {
        setError("Error al cargar los datos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar y ordenar datos
  const datosFiltrados = useMemo(() => {
    let resultado = [...sismos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (s) =>
          s.municipio?.toLowerCase().includes(term) ||
          s.departamento?.toLowerCase().includes(term)
      );
    }

    if (filtroMagnitudMin !== "") resultado = resultado.filter((s) => s.magnitud >= filtroMagnitudMin);
    if (filtroMagnitudMax !== "") resultado = resultado.filter((s) => s.magnitud <= filtroMagnitudMax);
    if (filtroProfundidadMin !== "") resultado = resultado.filter((s) => s.profundidad >= filtroProfundidadMin);
    if (filtroProfundidadMax !== "") resultado = resultado.filter((s) => s.profundidad <= filtroProfundidadMax);
    if (filtroTipo !== "") resultado = resultado.filter((s) => s.tipo_profundidad === filtroTipo);
    if (filtroSantander !== "") resultado = resultado.filter((s) => s.es_santander === filtroSantander);

    resultado.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "fecha_hora":
          comparison = new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime();
          break;
        case "magnitud":
          comparison = a.magnitud - b.magnitud;
          break;
        case "profundidad":
          comparison = a.profundidad - b.profundidad;
          break;
        case "municipio":
          comparison = (a.municipio || "").localeCompare(b.municipio || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return resultado;
  }, [sismos, searchTerm, filtroMagnitudMin, filtroMagnitudMax, filtroProfundidadMin, filtroProfundidadMax, filtroTipo, filtroSantander, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(datosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const datosPaginados = datosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroMagnitudMin("");
    setFiltroMagnitudMax("");
    setFiltroProfundidadMin("");
    setFiltroProfundidadMax("");
    setFiltroTipo("");
    setFiltroSantander("");
    setCurrentPage(1);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FUNCIONES DE EXPORTACIÓN
  // ═══════════════════════════════════════════════════════════════════════

  const exportarCSV = () => {
    setExportando("csv");
    const headers = ["ID", "FechaHora", "Latitud", "Longitud", "Profundidad_km", "Magnitud", "TipoMagnitud", "Municipio", "Departamento", "TipoProfundidad"];
    
    const rows = datosFiltrados.map((s) => [
      s.id,
      s.fecha_hora,
      s.latitud,
      s.longitud,
      s.profundidad,
      s.magnitud,
      s.tipo_magnitud || "",
      s.municipio || "",
      s.departamento || "",
      s.tipo_profundidad
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    descargarArchivo(csvContent, `sismos_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    setTimeout(() => setExportando(null), 1000);
  };

  const exportarGeoJSON = () => {
    setExportando("geojson");
    
    const geojson = {
      type: "FeatureCollection",
      features: datosFiltrados.map((s) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [s.longitud, s.latitud]
        },
        properties: {
          id: s.id,
          fecha_hora: s.fecha_hora,
          magnitud: s.magnitud,
          profundidad: s.profundidad,
          tipo_profundidad: s.tipo_profundidad,
          municipio: s.municipio,
          departamento: s.departamento,
          tipo_magnitud: s.tipo_magnitud
        }
      }))
    };

    const content = JSON.stringify(geojson, null, 2);
    descargarArchivo(content, `sismos_${new Date().toISOString().split("T")[0]}.geojson`, "application/geo+json");
    setTimeout(() => setExportando(null), 1000);
  };

  const exportarKML = () => {
    setExportando("kml");
    
    const placemarks = datosFiltrados.map((s) => `
    <Placemark>
      <name>M${s.magnitud.toFixed(1)} - ${s.municipio || "N/A"}</name>
      <description><![CDATA[
        <b>Magnitud:</b> ${s.magnitud.toFixed(1)}<br/>
        <b>Profundidad:</b> ${s.profundidad.toFixed(1)} km<br/>
        <b>Tipo:</b> ${s.tipo_profundidad}<br/>
        <b>Fecha:</b> ${new Date(s.fecha_hora).toLocaleString("es-CO")}<br/>
        <b>Municipio:</b> ${s.municipio || "N/A"}<br/>
        <b>Departamento:</b> ${s.departamento || "N/A"}
      ]]></description>
      <styleUrl>#${s.tipo_profundidad === "Nido Sísmico" ? "nido" : s.tipo_profundidad === "Superficial" ? "superficial" : s.tipo_profundidad === "Intermedio" ? "intermedio" : "profundo"}</styleUrl>
      <Point>
        <coordinates>${s.longitud},${s.latitud},0</coordinates>
      </Point>
    </Placemark>`).join("\n");

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Sismos SIASIC-Santander</name>
    <description>Exportado el ${new Date().toLocaleDateString("es-CO")}</description>
    
    <Style id="nido">
      <IconStyle>
        <color>ffC146B6</color>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
      </IconStyle>
    </Style>
    <Style id="superficial">
      <IconStyle>
        <color>ff2626DC</color>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
      </IconStyle>
    </Style>
    <Style id="intermedio">
      <IconStyle>
        <color>ff0B9EF5</color>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
      </IconStyle>
    </Style>
    <Style id="profundo">
      <IconStyle>
        <color>ffEB6325</color>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
      </IconStyle>
    </Style>
    
    ${placemarks}
  </Document>
</kml>`;

    descargarArchivo(kml, `sismos_${new Date().toISOString().split("T")[0]}.kml`, "application/vnd.google-earth.kml+xml");
    setTimeout(() => setExportando(null), 1000);
  };

  const descargarArchivo = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Badge color
  const getBadgeColor = (tipo: TipoProfundidad) => {
    switch (tipo) {
      case "Superficial": return "bg-siasic-superficial/20 text-siasic-superficial border-siasic-superficial/30";
      case "Intermedio": return "bg-siasic-intermedio/20 text-siasic-intermedio border-siasic-intermedio/30";
      case "Nido Sísmico": return "bg-siasic-nido/20 text-siasic-nido border-siasic-nido/30";
      case "Profundo": return "bg-siasic-profundo/20 text-siasic-profundo border-siasic-profundo/30";
      default: return "bg-siasic-text-muted/20 text-siasic-text-muted";
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-siasic-text-muted" />;
    return sortOrder === "asc" 
      ? <ArrowUp size={14} className="text-siasic-accent-cyan" />
      : <ArrowDown size={14} className="text-siasic-accent-cyan" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-siasic-text-secondary">Cargando datos sísmicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Database className="text-siasic-danger mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-siasic-text-primary mb-2">Error</h2>
          <p className="text-siasic-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  const hayFiltrosActivos = searchTerm || filtroMagnitudMin !== "" || filtroMagnitudMax !== "" || filtroProfundidadMin !== "" || filtroProfundidadMax !== "" || filtroTipo !== "" || filtroSantander !== "";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-siasic-profundo/10 rounded-lg border border-siasic-profundo/20">
              <Database className="text-siasic-profundo" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-siasic-text-primary">
              Explorador de Datos
            </h1>
          </div>
          <p className="text-siasic-text-secondary">
            Consulta, filtra y exporta los registros sísmicos en múltiples formatos
          </p>
        </div>

        {/* Barra de acciones */}
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-siasic-text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar por municipio o departamento..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg pl-10 pr-4 py-2.5 text-siasic-text-primary placeholder-siasic-text-muted focus:outline-none focus:border-siasic-accent-cyan transition-colors"
              />
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  showFilters || hayFiltrosActivos
                    ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                    : "bg-siasic-bg-secondary text-siasic-text-secondary hover:text-siasic-text-primary"
                }`}
              >
                <Filter size={18} />
                Filtros
              </button>

              {/* Botones de exportación */}
              <div className="flex gap-1 bg-siasic-bg-secondary rounded-lg p-1">
                <button
                  onClick={exportarCSV}
                  disabled={exportando !== null}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    exportando === "csv" 
                      ? "bg-siasic-success text-white" 
                      : "text-siasic-text-secondary hover:text-siasic-accent-cyan hover:bg-siasic-bg-card"
                  }`}
                  title="Exportar CSV"
                >
                  {exportando === "csv" ? <Check size={16} /> : <FileSpreadsheet size={16} />}
                  CSV
                </button>
                <button
                  onClick={exportarGeoJSON}
                  disabled={exportando !== null}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    exportando === "geojson" 
                      ? "bg-siasic-success text-white" 
                      : "text-siasic-text-secondary hover:text-siasic-accent-cyan hover:bg-siasic-bg-card"
                  }`}
                  title="Exportar GeoJSON"
                >
                  {exportando === "geojson" ? <Check size={16} /> : <FileJson size={16} />}
                  GeoJSON
                </button>
                <button
                  onClick={exportarKML}
                  disabled={exportando !== null}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    exportando === "kml" 
                      ? "bg-siasic-success text-white" 
                      : "text-siasic-text-secondary hover:text-siasic-accent-cyan hover:bg-siasic-bg-card"
                  }`}
                  title="Exportar KML (Google Earth)"
                >
                  {exportando === "kml" ? <Check size={16} /> : <FileCode size={16} />}
                  KML
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-siasic-bg-secondary">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Magnitud Mín</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={filtroMagnitudMin}
                    onChange={(e) => { setFiltroMagnitudMin(e.target.value ? parseFloat(e.target.value) : ""); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Magnitud Máx</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={filtroMagnitudMax}
                    onChange={(e) => { setFiltroMagnitudMax(e.target.value ? parseFloat(e.target.value) : ""); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Prof. Mín (km)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filtroProfundidadMin}
                    onChange={(e) => { setFiltroProfundidadMin(e.target.value ? parseInt(e.target.value) : ""); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Prof. Máx (km)</label>
                  <input
                    type="number"
                    placeholder="300"
                    value={filtroProfundidadMax}
                    onChange={(e) => { setFiltroProfundidadMax(e.target.value ? parseInt(e.target.value) : ""); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  />
                </div>
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Tipo</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => { setFiltroTipo(e.target.value as TipoProfundidad | ""); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  >
                    <option value="">Todos</option>
                    <option value="Superficial">Superficial</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Nido Sísmico">Nido Sísmico</option>
                    <option value="Profundo">Profundo</option>
                  </select>
                </div>
                <div>
                  <label className="text-siasic-text-muted text-xs mb-1 block">Región</label>
                  <select
                    value={filtroSantander === "" ? "" : filtroSantander ? "true" : "false"}
                    onChange={(e) => { setFiltroSantander(e.target.value === "" ? "" : e.target.value === "true"); setCurrentPage(1); }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-3 py-2 text-sm text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan"
                  >
                    <option value="">Todos</option>
                    <option value="true">Solo Santander</option>
                    <option value="false">Otras regiones</option>
                  </select>
                </div>
              </div>
              {hayFiltrosActivos && (
                <button onClick={limpiarFiltros} className="mt-4 flex items-center gap-2 text-siasic-text-muted hover:text-siasic-danger text-sm">
                  <X size={16} /> Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-4">
            <p className="text-siasic-text-muted text-sm">Total Registros</p>
            <p className="text-2xl font-bold text-siasic-accent-cyan">{sismos.length.toLocaleString()}</p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-4">
            <p className="text-siasic-text-muted text-sm">Filtrados</p>
            <p className="text-2xl font-bold text-siasic-text-primary">{datosFiltrados.length.toLocaleString()}</p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-4">
            <p className="text-siasic-text-muted text-sm">Nido Sísmico</p>
            <p className="text-2xl font-bold text-siasic-nido">
              {datosFiltrados.filter(s => s.tipo_profundidad === "Nido Sísmico").length.toLocaleString()}
            </p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-4">
            <p className="text-siasic-text-muted text-sm">Mag. Promedio</p>
            <p className="text-2xl font-bold text-siasic-intermedio">
              {datosFiltrados.length > 0 
                ? (datosFiltrados.reduce((sum, s) => sum + s.magnitud, 0) / datosFiltrados.length).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-siasic-bg-secondary/50 text-left">
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">
                    <button onClick={() => handleSort("fecha_hora")} className="flex items-center gap-1 hover:text-siasic-accent-cyan">
                      Fecha/Hora <SortIcon field="fecha_hora" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">
                    <button onClick={() => handleSort("magnitud")} className="flex items-center gap-1 hover:text-siasic-accent-cyan">
                      Magnitud <SortIcon field="magnitud" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">
                    <button onClick={() => handleSort("profundidad")} className="flex items-center gap-1 hover:text-siasic-accent-cyan">
                      Profundidad <SortIcon field="profundidad" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">
                    <button onClick={() => handleSort("municipio")} className="flex items-center gap-1 hover:text-siasic-accent-cyan">
                      Ubicación <SortIcon field="municipio" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">Tipo</th>
                  <th className="px-4 py-3 text-siasic-text-secondary text-sm font-medium">Coordenadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-siasic-bg-secondary">
                {datosPaginados.map((sismo) => (
                  <tr key={sismo.id} className="hover:bg-siasic-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-siasic-text-primary text-sm">{formatDateTime(sismo.fecha_hora)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        sismo.magnitud >= 5 ? "text-siasic-superficial" :
                        sismo.magnitud >= 4 ? "text-siasic-intermedio" :
                        sismo.magnitud >= 3 ? "text-siasic-warning" : "text-siasic-success"
                      }`}>
                        M{sismo.magnitud.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-siasic-text-secondary text-sm">{sismo.profundidad.toFixed(1)} km</td>
                    <td className="px-4 py-3">
                      <p className="text-siasic-text-primary text-sm font-medium">{sismo.municipio || "N/A"}</p>
                      <p className="text-siasic-text-muted text-xs">{sismo.departamento}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(sismo.tipo_profundidad)}`}>
                        {sismo.tipo_profundidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-siasic-text-muted text-xs font-mono">
                      {sismo.latitud.toFixed(3)}°, {sismo.longitud.toFixed(3)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-4 py-4 border-t border-siasic-bg-secondary flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-siasic-text-muted text-sm">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, datosFiltrados.length)} de {datosFiltrados.length.toLocaleString()}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-siasic-bg-secondary border border-siasic-bg-secondary rounded px-2 py-1 text-sm text-siasic-text-primary"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-siasic-bg-secondary text-siasic-text-secondary hover:text-siasic-accent-cyan disabled:opacity-50">
                <ChevronsLeft size={18} />
              </button>
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-siasic-bg-secondary text-siasic-text-secondary hover:text-siasic-accent-cyan disabled:opacity-50">
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 text-siasic-text-primary text-sm">
                {currentPage} / {totalPages || 1}
              </span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="p-2 rounded-lg bg-siasic-bg-secondary text-siasic-text-secondary hover:text-siasic-accent-cyan disabled:opacity-50">
                <ChevronRight size={18} />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="p-2 rounded-lg bg-siasic-bg-secondary text-siasic-text-secondary hover:text-siasic-accent-cyan disabled:opacity-50">
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}