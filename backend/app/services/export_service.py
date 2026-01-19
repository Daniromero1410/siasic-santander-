# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Servicio de Exportación
# ═══════════════════════════════════════════════════════════════════════════

import json
import io
from typing import List, Dict, Any
from datetime import datetime

from app.services.sismos_service import sismos_service


class ExportService:
    """Servicio para exportación de datos en diferentes formatos"""
    
    def __init__(self):
        self.sismos = sismos_service
    
    def exportar_csv(self, filtros: Dict[str, Any] = None) -> str:
        """Exporta datos a formato CSV"""
        
        datos = self.sismos.obtener_todos(
            limit=10000,
            departamento=filtros.get('departamento') if filtros else None,
            tipo_profundidad=filtros.get('tipo_profundidad') if filtros else None,
            magnitud_min=filtros.get('magnitud_min') if filtros else None,
            magnitud_max=filtros.get('magnitud_max') if filtros else None
        )
        
        if not datos:
            return "No hay datos para exportar"
        
        # Headers
        headers = [
            'ID', 'Fecha_Hora', 'Latitud', 'Longitud', 'Profundidad_km',
            'Magnitud', 'Tipo_Magnitud', 'Municipio', 'Departamento',
            'Tipo_Profundidad', 'Region'
        ]
        
        lines = [','.join(headers)]
        
        for sismo in datos:
            fecha = sismo['fecha_hora']
            if isinstance(fecha, datetime):
                fecha = fecha.isoformat()
            
            row = [
                str(sismo['id']),
                fecha,
                str(sismo['latitud']),
                str(sismo['longitud']),
                str(sismo['profundidad']),
                str(sismo['magnitud']),
                sismo.get('tipo_magnitud', ''),
                sismo.get('municipio', '') or '',
                sismo.get('departamento', ''),
                sismo.get('tipo_profundidad', ''),
                sismo.get('region', '').replace(',', ';')  # Evitar conflicto con CSV
            ]
            lines.append(','.join(row))
        
        return '\n'.join(lines)
    
    def exportar_geojson(self, filtros: Dict[str, Any] = None) -> Dict:
        """Exporta datos a formato GeoJSON"""
        
        datos = self.sismos.obtener_todos(
            limit=10000,
            departamento=filtros.get('departamento') if filtros else None,
            tipo_profundidad=filtros.get('tipo_profundidad') if filtros else None,
            magnitud_min=filtros.get('magnitud_min') if filtros else None,
            magnitud_max=filtros.get('magnitud_max') if filtros else None
        )
        
        features = []
        for sismo in datos:
            fecha = sismo['fecha_hora']
            if isinstance(fecha, datetime):
                fecha = fecha.isoformat()
            
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [sismo['longitud'], sismo['latitud']]
                },
                'properties': {
                    'id': sismo['id'],
                    'fecha_hora': fecha,
                    'magnitud': sismo['magnitud'],
                    'profundidad_km': sismo['profundidad'],
                    'tipo_profundidad': sismo.get('tipo_profundidad', ''),
                    'municipio': sismo.get('municipio', ''),
                    'departamento': sismo.get('departamento', ''),
                    'region': sismo.get('region', ''),
                    'tipo_magnitud': sismo.get('tipo_magnitud', '')
                }
            }
            features.append(feature)
        
        return {
            'type': 'FeatureCollection',
            'name': 'SIASIC_Santander_Sismos',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
                }
            },
            'features': features
        }
    
    def exportar_kml(self, filtros: Dict[str, Any] = None) -> str:
        """Exporta datos a formato KML para Google Earth"""
        
        datos = self.sismos.obtener_todos(
            limit=10000,
            departamento=filtros.get('departamento') if filtros else None,
            tipo_profundidad=filtros.get('tipo_profundidad') if filtros else None,
            magnitud_min=filtros.get('magnitud_min') if filtros else None,
            magnitud_max=filtros.get('magnitud_max') if filtros else None
        )
        
        # Colores por tipo de profundidad (en formato KML: aabbggrr)
        colores = {
            'Superficial': 'ff0000dc',      # Rojo
            'Intermedio': 'ff0b9ef5',       # Naranja
            'Nido Sísmico': 'ffc1466b',     # Morado
            'Profundo': 'ffeb6325'          # Azul
        }
        
        kml_header = '''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
    <name>SIASIC-Santander - Sismos 2024</name>
    <description>Sistema de Información y Análisis Sísmico de Santander</description>
    
    <!-- Estilos por tipo de profundidad -->
    <Style id="superficial">
        <IconStyle>
            <color>ff0000dc</color>
            <scale>1.0</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
        </IconStyle>
    </Style>
    <Style id="intermedio">
        <IconStyle>
            <color>ff0b9ef5</color>
            <scale>1.0</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
        </IconStyle>
    </Style>
    <Style id="nido_sismico">
        <IconStyle>
            <color>ffc1466b</color>
            <scale>1.2</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
        </IconStyle>
    </Style>
    <Style id="profundo">
        <IconStyle>
            <color>ffeb6325</color>
            <scale>0.8</scale>
            <Icon><href>http://maps.google.com/mapfiles/kml/shapes/earthquake.png</href></Icon>
        </IconStyle>
    </Style>
'''
        
        placemarks = []
        for sismo in datos:
            fecha = sismo['fecha_hora']
            if isinstance(fecha, datetime):
                fecha_str = fecha.strftime('%Y-%m-%d %H:%M:%S')
            else:
                fecha_str = str(fecha)
            
            tipo_prof = sismo.get('tipo_profundidad', 'Intermedio')
            style_id = tipo_prof.lower().replace(' ', '_').replace('í', 'i')
            
            placemark = f'''
    <Placemark>
        <name>M{sismo['magnitud']} - {sismo.get('municipio', 'Desconocido')}</name>
        <description><![CDATA[
            <b>Fecha:</b> {fecha_str}<br/>
            <b>Magnitud:</b> {sismo['magnitud']}<br/>
            <b>Profundidad:</b> {sismo['profundidad']} km<br/>
            <b>Tipo:</b> {tipo_prof}<br/>
            <b>Región:</b> {sismo.get('region', '')}
        ]]></description>
        <styleUrl>#{style_id}</styleUrl>
        <Point>
            <coordinates>{sismo['longitud']},{sismo['latitud']},{-sismo['profundidad'] * 1000}</coordinates>
        </Point>
    </Placemark>'''
            placemarks.append(placemark)
        
        kml_footer = '''
</Document>
</kml>'''
        
        return kml_header + ''.join(placemarks) + kml_footer
    
    def exportar_simulacion_csv(self, simulacion: Dict) -> str:
        """Exporta resultados de simulación a CSV"""
        
        lines = [
            "# SIASIC-Santander - Resultados de Simulación",
            f"# Generado: {datetime.now().isoformat()}",
            "",
            "# Parámetros del sismo",
            f"Latitud,{simulacion['epicentro']['lat']}",
            f"Longitud,{simulacion['epicentro']['lon']}",
            f"Magnitud,{simulacion['magnitud']}",
            f"Profundidad_km,{simulacion['profundidad']}",
            f"Tipo,{simulacion['tipo_profundidad']}",
            f"Intensidad_Epicentro,{simulacion['intensidad_epicentro']}",
            f"Mercalli,{simulacion['mercalli']}",
            f"Energia_TNT_Toneladas,{simulacion['energia_tnt_toneladas']}",
            "",
            "# Ciudades afectadas",
            "Ciudad,Poblacion,Distancia_km,Intensidad,Mercalli,Zona"
        ]
        
        for ciudad in simulacion.get('ciudades_afectadas', []):
            lines.append(
                f"{ciudad['ciudad']},{ciudad['poblacion']},{ciudad['distancia_km']},"
                f"{ciudad['intensidad']},{ciudad['mercalli']},{ciudad['zona']}"
            )
        
        lines.append("")
        lines.append("# Predicción de réplicas")
        lines.append("Dia,Tasa_Replicas,Acumulado,Probabilidad_Pct")
        
        for replica in simulacion.get('replicas_prediccion', []):
            lines.append(
                f"{replica['dia']},{replica['tasa_replicas']},"
                f"{replica['acumulado']},{replica['probabilidad_pct']}"
            )
        
        return '\n'.join(lines)


# Instancia singleton
export_service = ExportService()
