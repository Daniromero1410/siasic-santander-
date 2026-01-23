# 🚀 Guía de Despliegue - SIASIC Santander

## 📋 Requisitos Previos

- Backend desplegado en Railway
- Frontend desplegado en Vercel
- URL del backend de Railway

---

## 🔧 Configuración del Backend (Railway)

### 1. Variables de Entorno en Railway

En tu proyecto de Railway, configura las siguientes variables de entorno:

```bash
DEBUG=false
PORT=8001
```

**Nota:** Railway asigna automáticamente la variable `PORT`. No es necesario configurarla manualmente.

### 2. Dominio del Backend

Una vez desplegado, Railway te proporcionará una URL como:
```
https://tu-proyecto-xxxxx.up.railway.app
```

**¡Copia esta URL! La necesitarás para configurar el frontend.**

---

## 🎨 Configuración del Frontend (Vercel)

### 1. Conectar el Repositorio

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en "Import Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el directorio `frontend` como Root Directory

### 2. Configurar Variables de Entorno

En la configuración del proyecto de Vercel, agrega la siguiente variable de entorno:

**Variable de Entorno:**
```
NEXT_PUBLIC_API_URL=https://tu-proyecto-xxxxx.up.railway.app
```

⚠️ **IMPORTANTE:** Reemplaza `https://tu-proyecto-xxxxx.up.railway.app` con la URL real de tu backend en Railway.

### 3. Configuración de Despliegue

Vercel detectará automáticamente que es un proyecto Next.js. Asegúrate de que:

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 🔄 Actualizar la URL del Backend

Si cambiaste la URL del backend o necesitas actualizarla:

### En Vercel (Frontend):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita `NEXT_PUBLIC_API_URL`
4. Agrega la nueva URL del backend
5. Redeploy el proyecto

### En el Código (Archivo .env.production):

Actualiza el archivo `frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://tu-nueva-url-backend.up.railway.app
```

---

## ✅ Verificar el Despliegue

### Backend (Railway)

Visita tu URL de Railway:
```
https://tu-backend.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "service": "SIASIC-Santander API",
  "version": "1.0.0"
}
```

### Frontend (Vercel)

1. Visita tu URL de Vercel
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña "Network"
4. Verifica que las llamadas al API se hacen a la URL correcta de Railway
5. No deberías ver errores de CORS

---

## 🐛 Solución de Problemas

### Error: "Network Error" o "CORS Error"

**Causa:** El frontend no puede conectarse al backend.

**Solución:**
1. Verifica que la variable `NEXT_PUBLIC_API_URL` en Vercel tiene la URL correcta
2. Asegúrate de que el backend en Railway está funcionando
3. Verifica que no hay errores en los logs de Railway

### Error: "Failed to fetch"

**Causa:** La URL del backend es incorrecta o el backend no está respondiendo.

**Solución:**
1. Prueba acceder directamente a la URL del backend en el navegador
2. Verifica que el backend esté corriendo en Railway
3. Revisa los logs de Railway para ver errores

### El frontend carga pero no muestra datos

**Causa:** Problemas de conexión con el API.

**Solución:**
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console" y busca errores
3. Ve a la pestaña "Network" y verifica las llamadas al API
4. Asegúrate de que las llamadas se hacen a la URL de Railway y no a localhost

---

## 📝 Notas Importantes

- **No compartas** las URLs de producción públicamente
- Mantén las variables de entorno seguras
- Railway puede cambiar la URL del backend si reinicias el servicio
- Vercel redespliega automáticamente cuando haces push a la rama main/master

---

## 🆘 Comandos Útiles

### Ver logs del backend en Railway:
```bash
railway logs
```

### Redeploy en Vercel:
```bash
vercel --prod
```

### Verificar variables de entorno en Vercel:
```bash
vercel env ls
```

---

**¡Listo!** Tu aplicación SIASIC Santander debería estar funcionando correctamente. 🎉
