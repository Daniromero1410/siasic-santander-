# ⚡ Configuración Rápida - URL del Backend

## 🎯 Pasos para Conectar Frontend y Backend

### Paso 1: Obtén la URL de Railway

1. Ve a tu proyecto en [Railway](https://railway.app)
2. Selecciona tu servicio backend
3. Ve a la pestaña "Settings"
4. Copia la URL en "Domains" (ejemplo: `https://siasic-backend-production.up.railway.app`)

### Paso 2: Configura Vercel

#### Opción A: Desde la Web de Vercel (Recomendado)

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Ve a "Settings" → "Environment Variables"
3. Agrega una nueva variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** La URL de Railway (ej: `https://siasic-backend-production.up.railway.app`)
   - **Environments:** Marca "Production", "Preview" y "Development"
4. Haz clic en "Save"
5. Ve a "Deployments" y haz clic en "Redeploy" en el último deployment

#### Opción B: Desde el Código (Alternativa)

Edita el archivo `frontend/.env.production` y reemplaza:

```bash
NEXT_PUBLIC_API_URL=https://TU-URL-DE-RAILWAY.up.railway.app
```

Luego haz commit y push:

```bash
git add frontend/.env.production
git commit -m "Update backend URL"
git push origin main
```

### Paso 3: Verifica la Conexión

1. Abre tu aplicación en Vercel
2. Abre DevTools (F12) → Console
3. Si no ves errores de CORS o Network, ¡funciona! ✅

---

## 🔍 Ejemplo Completo

**URL de Railway:**
```
https://siasic-backend-production-abc123.up.railway.app
```

**Variable en Vercel:**
```
NEXT_PUBLIC_API_URL=https://siasic-backend-production-abc123.up.railway.app
```

---

## ❗ Importante

- **NO** incluyas una barra `/` al final de la URL
- **NO** agregues `/api` a la URL (el código ya lo maneja)
- La URL debe empezar con `https://`

---

## ✅ Checklist

- [ ] Obtuve la URL del backend de Railway
- [ ] Configuré la variable `NEXT_PUBLIC_API_URL` en Vercel
- [ ] Hice redeploy en Vercel
- [ ] Verifiqué que no hay errores en la consola del navegador
- [ ] La aplicación carga datos correctamente

---

**¿Problemas?** Revisa el archivo [DEPLOYMENT.md](./DEPLOYMENT.md) para más detalles.
