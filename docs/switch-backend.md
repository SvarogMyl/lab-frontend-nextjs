# Guía: Alternar entre Backend Local y Remoto

Esta guía explica cómo cambiar la conexión del frontend para apuntar al servidor local o al servidor público en Render.

## 1. Configuración de Variables de Entorno
El frontend utiliza el archivo `.env.local` para saber a qué URL conectarse.

### Modo Local (Desarrollo)
Usa esta configuración si tienes el proyecto `lab-spring-postgres` corriendo en tu máquina (puerto 8081).
Edita `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### Modo Remoto (Producción/Pruebas Cloud)
Usa esta configuración para conectarte al backend desplegado en Render.
Edita `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://lab-spring-postgres.onrender.com
```

## 2. Aplicar los Cambios
Después de cambiar el valor en `.env.local`, debes reiniciar el servidor de desarrollo de Next.js para que tome los cambios:
1. Detén el servidor actual (`Ctrl + C`).
2. Ejecuta: `npm run dev`.

## 3. Consideración de CORS (Muy Importante)
Para que el **Modo Remoto** funcione desde tu `localhost:3000`, el backend en Render debe tener permitido ese origen.
- Actualmente, el backend en Render tiene `CORS_ALLOWED_ORIGINS` configurado como `http://localhost:3000`, por lo que **debería funcionar directamente**.
- Si cambias de puerto en local (ej. 3001), deberás actualizar esa variable en el Dashboard de Render.

## 4. Prueba de Conexión
Una vez configurado en Modo Remoto:
1. Inicia sesión en el frontend.
2. Si el login es exitoso, significa que el frontend se comunicó correctamente con Render.
3. Puedes verificar en la pestaña "Network" del navegador que las peticiones van a `lab-spring-postgres.onrender.com`.
