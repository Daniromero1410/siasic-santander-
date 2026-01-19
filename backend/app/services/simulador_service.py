# ═══════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Servicio del Simulador Sísmico
# ═══════════════════════════════════════════════════════════════════════════

import numpy as np
from scipy.stats import poisson
from typing import Dict, List, Tuple, Any

from app.models import (
    SimuladorInput, SimuladorOutput, TipoProfundidad,
    ZonaImpacto, CiudadAfectada, PrediccionReplica
)


# ═══════════════════════════════════════════════════════════════════════════
# MODELO DE OMORI-UTSU PARA RÉPLICAS
# ═══════════════════════════════════════════════════════════════════════════

class OmoriUtsuModel:
    """
    Modelo de Omori-Utsu para predicción de réplicas sísmicas.
    Calibrado para el Nido Sísmico de Bucaramanga.
    """
    
    def __init__(self):
        # Parámetros calibrados por tipo de profundidad
        self.params_by_depth = {
            'Superficial': {'c': 0.05, 'p': 1.0, 'k_factor': 1.2},
            'Intermedio': {'c': 0.08, 'p': 1.05, 'k_factor': 1.0},
            'Nido Sísmico': {'c': 0.15, 'p': 1.15, 'k_factor': 0.7},
            'Profundo': {'c': 0.20, 'p': 1.2, 'k_factor': 0.5}
        }
    
    def calculate_K(self, magnitude: float, depth_type: str = 'Nido Sísmico') -> float:
        """Calcula productividad K basada en magnitud"""
        a, b = 1.0, -1.67
        k_factor = self.params_by_depth.get(depth_type, {}).get('k_factor', 1.0)
        return k_factor * (10 ** (a * magnitude + b))
    
    def get_params(self, depth_type: str) -> Tuple[float, float]:
        """Obtiene parámetros c y p según profundidad"""
        params = self.params_by_depth.get(depth_type, self.params_by_depth['Intermedio'])
        return params['c'], params['p']
    
    def aftershock_rate(self, t: float, magnitude: float, depth_type: str = 'Nido Sísmico') -> float:
        """Tasa de réplicas en tiempo t (días)"""
        K = self.calculate_K(magnitude, depth_type)
        c, p = self.get_params(depth_type)
        return K / ((t + c) ** p)
    
    def cumulative_aftershocks(self, t: float, magnitude: float, depth_type: str = 'Nido Sísmico') -> float:
        """Número acumulado de réplicas hasta tiempo t"""
        K = self.calculate_K(magnitude, depth_type)
        c, p = self.get_params(depth_type)
        
        if p == 1:
            return K * np.log((t + c) / c)
        else:
            return (K / (1 - p)) * ((t + c)**(1-p) - c**(1-p))
    
    def predict_aftershocks(
        self, 
        magnitude: float, 
        depth_type: str = 'Nido Sísmico',
        days: int = 30, 
        min_magnitude: float = 2.0
    ) -> List[PrediccionReplica]:
        """Predice réplicas para un período de tiempo"""
        
        results = []
        mag_factor = 10 ** (-(min_magnitude - 2.0))
        
        for day in range(1, days + 1):
            rate = self.aftershock_rate(day, magnitude, depth_type) * mag_factor
            cumulative = self.cumulative_aftershocks(day, magnitude, depth_type) * mag_factor
            prob = 1 - poisson.pmf(0, max(rate, 0.001))
            
            results.append(PrediccionReplica(
                dia=day,
                tasa_replicas=round(rate, 2),
                acumulado=round(cumulative, 2),
                probabilidad_pct=round(prob * 100, 1)
            ))
        
        return results
    
    def max_aftershock_magnitude(self, mainshock_mag: float) -> float:
        """Magnitud máxima de réplicas (Ley de Båth)"""
        return max(mainshock_mag - 1.2, 2.0)


# ═══════════════════════════════════════════════════════════════════════════
# MODELO DE ATENUACIÓN SÍSMICA
# ═══════════════════════════════════════════════════════════════════════════

class SeismicAttenuationModel:
    """
    Modelo de atenuación sísmica para calcular intensidad y zonas de afectación.
    Calibrado para la región de Colombia/Santander.
    """
    
    def __init__(self):
        # Coeficientes de atenuación (calibrados para Colombia)
        self.c1 = 2.5   # Constante
        self.c2 = 1.5   # Coeficiente de magnitud
        self.c3 = 1.8   # Atenuación geométrica
        self.c4 = 0.003 # Atenuación anelástica
        
        # Escala de Mercalli
        self.mercalli_scale = {
            'I': {'min': 1, 'max': 1.9, 'desc': 'No sentido', 'color': '#FFFFFF'},
            'II': {'min': 2, 'max': 2.9, 'desc': 'Muy débil', 'color': '#ACD8E9'},
            'III': {'min': 3, 'max': 3.9, 'desc': 'Débil', 'color': '#83D0DA'},
            'IV': {'min': 4, 'max': 4.9, 'desc': 'Ligero', 'color': '#7BC87D'},
            'V': {'min': 5, 'max': 5.9, 'desc': 'Moderado', 'color': '#F5F500'},
            'VI': {'min': 6, 'max': 6.9, 'desc': 'Fuerte', 'color': '#F5C800'},
            'VII': {'min': 7, 'max': 7.9, 'desc': 'Muy fuerte', 'color': '#FF9100'},
            'VIII': {'min': 8, 'max': 8.9, 'desc': 'Severo', 'color': '#E93C00'},
            'IX': {'min': 9, 'max': 9.9, 'desc': 'Violento', 'color': '#B40000'},
            'X': {'min': 10, 'max': 10.9, 'desc': 'Extremo', 'color': '#800000'},
            'XI': {'min': 11, 'max': 11.9, 'desc': 'Catastrófico', 'color': '#4B0082'},
            'XII': {'min': 12, 'max': 12, 'desc': 'Apocalíptico', 'color': '#000000'}
        }
    
    def calculate_intensity(self, magnitude: float, epicentral_dist: float, depth: float) -> float:
        """Calcula intensidad Mercalli en un punto"""
        R = np.sqrt(epicentral_dist**2 + depth**2)
        R = max(R, 1)
        intensity = self.c1 + self.c2 * magnitude - self.c3 * np.log10(R) - self.c4 * R
        return float(np.clip(intensity, 1, 12))
    
    def get_mercalli_level(self, intensity: float) -> Tuple[str, Dict]:
        """Convierte intensidad numérica a nivel Mercalli"""
        for level, info in self.mercalli_scale.items():
            if info['min'] <= intensity <= info['max']:
                return level, info
        return 'XII', self.mercalli_scale['XII']
    
    def calculate_affected_radius(self, magnitude: float, depth: float, target_intensity: float) -> float:
        """Calcula radio donde se alcanza una intensidad específica"""
        r_min, r_max = 0.1, 1000
        
        while r_max - r_min > 0.1:
            r_mid = (r_min + r_max) / 2
            intensity = self.calculate_intensity(magnitude, r_mid, depth)
            
            if intensity > target_intensity:
                r_min = r_mid
            else:
                r_max = r_mid
        
        return r_mid
    
    def calculate_impact_zones(self, magnitude: float, depth: float) -> List[ZonaImpacto]:
        """Calcula zonas de impacto para diferentes intensidades"""
        
        epicenter_intensity = self.calculate_intensity(magnitude, 0, depth)
        
        zones = [
            ZonaImpacto(
                nombre='epicentro',
                radio_km=0,
                intensidad=f'{epicenter_intensity:.1f}',
                color='#800000',
                descripcion='Epicentro'
            ),
            ZonaImpacto(
                nombre='daño_severo',
                radio_km=round(self.calculate_affected_radius(magnitude, depth, 8), 1),
                intensidad='VIII+',
                color='#E93C00',
                descripcion='Daño severo a estructuras'
            ),
            ZonaImpacto(
                nombre='daño_moderado',
                radio_km=round(self.calculate_affected_radius(magnitude, depth, 6), 1),
                intensidad='VI-VII',
                color='#FF9100',
                descripcion='Daño moderado, grietas'
            ),
            ZonaImpacto(
                nombre='percepcion_fuerte',
                radio_km=round(self.calculate_affected_radius(magnitude, depth, 4), 1),
                intensidad='IV-V',
                color='#F5F500',
                descripcion='Percepción fuerte, objetos caen'
            ),
            ZonaImpacto(
                nombre='percepcion_leve',
                radio_km=round(self.calculate_affected_radius(magnitude, depth, 2), 1),
                intensidad='II-III',
                color='#83D0DA',
                descripcion='Percepción leve'
            )
        ]
        
        return zones
    
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Distancia entre dos puntos en km"""
        R = 6371
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        return R * 2 * np.arcsin(np.sqrt(a))


# ═══════════════════════════════════════════════════════════════════════════
# DATOS DE CIUDADES
# ═══════════════════════════════════════════════════════════════════════════

CIUDADES = [
    {'ciudad': 'Bucaramanga', 'latitud': 7.119, 'longitud': -73.122, 'poblacion': 581130, 'departamento': 'Santander'},
    {'ciudad': 'Floridablanca', 'latitud': 7.064, 'longitud': -73.088, 'poblacion': 271728, 'departamento': 'Santander'},
    {'ciudad': 'Girón', 'latitud': 7.074, 'longitud': -73.170, 'poblacion': 200000, 'departamento': 'Santander'},
    {'ciudad': 'Piedecuesta', 'latitud': 6.988, 'longitud': -73.052, 'poblacion': 175000, 'departamento': 'Santander'},
    {'ciudad': 'Barrancabermeja', 'latitud': 7.065, 'longitud': -73.855, 'poblacion': 191784, 'departamento': 'Santander'},
    {'ciudad': 'San Gil', 'latitud': 6.556, 'longitud': -73.136, 'poblacion': 46552, 'departamento': 'Santander'},
    {'ciudad': 'Socorro', 'latitud': 6.467, 'longitud': -73.260, 'poblacion': 32356, 'departamento': 'Santander'},
    {'ciudad': 'Cúcuta', 'latitud': 7.894, 'longitud': -72.508, 'poblacion': 711715, 'departamento': 'Norte de Santander'},
    {'ciudad': 'Pamplona', 'latitud': 7.376, 'longitud': -72.648, 'poblacion': 58299, 'departamento': 'Norte de Santander'},
    {'ciudad': 'Tunja', 'latitud': 5.535, 'longitud': -73.362, 'poblacion': 202939, 'departamento': 'Boyacá'},
    {'ciudad': 'Duitama', 'latitud': 5.827, 'longitud': -73.033, 'poblacion': 113954, 'departamento': 'Boyacá'},
    {'ciudad': 'Sogamoso', 'latitud': 5.714, 'longitud': -72.934, 'poblacion': 114509, 'departamento': 'Boyacá'},
    {'ciudad': 'Los Santos', 'latitud': 6.750, 'longitud': -73.100, 'poblacion': 12000, 'departamento': 'Santander'},
    {'ciudad': 'Zapatoca', 'latitud': 6.817, 'longitud': -73.267, 'poblacion': 9500, 'departamento': 'Santander'},
    {'ciudad': 'Villanueva', 'latitud': 6.683, 'longitud': -73.183, 'poblacion': 8000, 'departamento': 'Santander'},
]


# ═══════════════════════════════════════════════════════════════════════════
# SERVICIO DEL SIMULADOR
# ═══════════════════════════════════════════════════════════════════════════

class SimuladorService:
    """Servicio principal del simulador sísmico"""
    
    def __init__(self):
        self.omori_model = OmoriUtsuModel()
        self.attenuation_model = SeismicAttenuationModel()
        self.ciudades = CIUDADES
    
    def clasificar_profundidad(self, depth: float) -> str:
        """Clasifica el tipo de sismo por profundidad"""
        if depth < 70:
            return TipoProfundidad.SUPERFICIAL.value
        elif depth < 140:
            return TipoProfundidad.INTERMEDIO.value
        elif depth <= 180:
            return TipoProfundidad.NIDO_SISMICO.value
        else:
            return TipoProfundidad.PROFUNDO.value
    
    def simular(self, params: SimuladorInput) -> SimuladorOutput:
        """Ejecuta la simulación completa"""
        
        lat = params.latitud
        lon = params.longitud
        magnitude = params.magnitud
        depth = params.profundidad
        
        # Tipo de profundidad
        depth_type = self.clasificar_profundidad(depth)
        
        # Zonas de impacto
        zones = self.attenuation_model.calculate_impact_zones(magnitude, depth)
        
        # Intensidad en epicentro
        epicenter_intensity = self.attenuation_model.calculate_intensity(magnitude, 0, depth)
        mercalli_level, mercalli_info = self.attenuation_model.get_mercalli_level(epicenter_intensity)
        
        # Ciudades afectadas
        affected_cities = self._calcular_ciudades_afectadas(lat, lon, magnitude, depth, zones)
        
        # Predicción de réplicas
        replicas = self.omori_model.predict_aftershocks(magnitude, depth_type, 14, 3.0)
        max_aftershock = self.omori_model.max_aftershock_magnitude(magnitude)
        
        # Energía liberada
        energy_joules = 10**(1.5 * magnitude + 4.8)
        energy_tnt = energy_joules / 4.184e9
        
        return SimuladorOutput(
            epicentro={'lat': lat, 'lon': lon},
            magnitud=magnitude,
            profundidad=depth,
            tipo_profundidad=TipoProfundidad(depth_type),
            intensidad_epicentro=round(epicenter_intensity, 1),
            mercalli=mercalli_level,
            mercalli_descripcion=mercalli_info['desc'],
            energia_joules=energy_joules,
            energia_tnt_toneladas=round(energy_tnt, 1),
            zonas=zones,
            ciudades_afectadas=affected_cities,
            replicas_prediccion=replicas,
            max_replica_magnitud=round(max_aftershock, 1),
            total_replicas_14_dias=replicas[-1].acumulado if replicas else 0
        )
    
    def _calcular_ciudades_afectadas(
        self, 
        lat: float, 
        lon: float, 
        magnitude: float, 
        depth: float,
        zones: List[ZonaImpacto]
    ) -> List[CiudadAfectada]:
        """Calcula el impacto en cada ciudad"""
        
        # Crear diccionario de zonas para búsqueda rápida
        zones_dict = {z.nombre: z for z in zones}
        
        affected = []
        for city in self.ciudades:
            dist = self.attenuation_model.haversine_distance(
                lat, lon, city['latitud'], city['longitud']
            )
            intensity = self.attenuation_model.calculate_intensity(magnitude, dist, depth)
            mercalli, _ = self.attenuation_model.get_mercalli_level(intensity)
            
            # Determinar zona
            zone = 'fuera_de_zona'
            for zone_name in ['daño_severo', 'daño_moderado', 'percepcion_fuerte', 'percepcion_leve']:
                if zone_name in zones_dict and dist <= zones_dict[zone_name].radio_km:
                    zone = zone_name
                    break
            
            affected.append(CiudadAfectada(
                ciudad=city['ciudad'],
                poblacion=city['poblacion'],
                distancia_km=round(dist, 1),
                intensidad=round(intensity, 1),
                mercalli=mercalli,
                zona=zone
            ))
        
        # Ordenar por distancia
        affected.sort(key=lambda x: x.distancia_km)
        
        return affected
    
    def obtener_ciudades(self) -> List[Dict]:
        """Retorna lista de ciudades disponibles"""
        return self.ciudades
    
    def comparar_escenarios(self, escenarios: List[SimuladorInput]) -> List[Dict]:
        """Compara múltiples escenarios sísmicos"""
        
        resultados = []
        for i, escenario in enumerate(escenarios):
            sim = self.simular(escenario)
            
            # Población en riesgo (daño severo + moderado)
            pop_riesgo = sum(
                c.poblacion for c in sim.ciudades_afectadas 
                if c.zona in ['daño_severo', 'daño_moderado']
            )
            
            resultados.append({
                'escenario': i + 1,
                'magnitud': sim.magnitud,
                'profundidad': sim.profundidad,
                'tipo': sim.tipo_profundidad.value,
                'mercalli': sim.mercalli,
                'radio_daño_km': next(
                    (z.radio_km for z in sim.zonas if z.nombre == 'daño_severo'), 0
                ),
                'poblacion_riesgo': pop_riesgo,
                'replicas_14d': sim.total_replicas_14_dias
            })
        
        return resultados


# Instancia singleton
simulador_service = SimuladorService()
