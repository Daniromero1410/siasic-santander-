# ═══════════════════════════════════════════════════════════════════════════════
# SIASIC-Santander Backend - Utilidades JSON
# ═══════════════════════════════════════════════════════════════════════════════

import math
from typing import Any, Dict, List


def clean_for_json(obj: Any) -> Any:
    """
    Limpia recursivamente un objeto para que sea serializable a JSON.
    Reemplaza NaN, Infinity y -Infinity con valores válidos.
    """
    if obj is None:
        return None
    
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    
    if isinstance(obj, dict):
        return {key: clean_for_json(value) for key, value in obj.items()}
    
    if isinstance(obj, list):
        return [clean_for_json(item) for item in obj]
    
    if isinstance(obj, (int, str, bool)):
        return obj
    
    # Para tipos numpy
    try:
        import numpy as np
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        if isinstance(obj, np.ndarray):
            return clean_for_json(obj.tolist())
        if isinstance(obj, np.bool_):
            return bool(obj)
    except ImportError:
        pass
    
    # Para timestamps de pandas
    try:
        import pandas as pd
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if pd.isna(obj):
            return None
    except ImportError:
        pass
    
    return str(obj)


def clean_sismo_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Limpia un registro de sismo específicamente"""
    if record is None:
        return {}
    
    cleaned = {}
    
    for key, value in record.items():
        # Verificar si es NaN
        is_nan = False
        try:
            if value is None:
                is_nan = True
            elif isinstance(value, float) and math.isnan(value):
                is_nan = True
            else:
                import pandas as pd
                if pd.isna(value):
                    is_nan = True
        except:
            pass
        
        # Campos de texto
        if key in ['municipio', 'departamento', 'region', 'tipo_magnitud', 'tipo_profundidad', 'estado', 'ubicacion']:
            if is_nan or value is None or value == '':
                cleaned[key] = "N/A"
            else:
                cleaned[key] = str(value)
        
        # Campos numéricos
        elif key in ['latitud', 'longitud', 'profundidad', 'magnitud', 'fases', 'rms', 'gap']:
            if is_nan or value is None:
                cleaned[key] = 0.0
            else:
                try:
                    cleaned[key] = float(value)
                except (ValueError, TypeError):
                    cleaned[key] = 0.0
        
        # ID
        elif key == 'id':
            if is_nan or value is None:
                cleaned[key] = 0
            else:
                try:
                    cleaned[key] = int(value)
                except (ValueError, TypeError):
                    cleaned[key] = 0
        
        # Campos booleanos
        elif key in ['es_santander', 'es_nido']:
            if is_nan or value is None:
                cleaned[key] = False
            else:
                cleaned[key] = bool(value)
        
        # Campos de fecha
        elif key in ['fecha_hora']:
            if is_nan or value is None:
                cleaned[key] = ""
            else:
                try:
                    import pandas as pd
                    if isinstance(value, pd.Timestamp):
                        cleaned[key] = value.isoformat()
                    else:
                        cleaned[key] = str(value)
                except:
                    cleaned[key] = str(value) if value else ""
        
        # Otros campos
        else:
            cleaned[key] = clean_for_json(value)
    
    return cleaned
