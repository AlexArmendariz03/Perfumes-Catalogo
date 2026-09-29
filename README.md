# 🌟 Ararat Perfumes — Catálogo Web

Proyecto Next.js 14 con React, Ant Design, Tailwind CSS y Framer Motion.

---

## ⚡ Instalación rápida

### Requisitos
- Node.js 18 o superior
- npm o yarn

### Pasos

```bash
# 1. Descomprime el archivo
tar -xzf perfumes-ararat.tar.gz
cd perfumes-ararat

# 2. Instala dependencias
npm install

# 3. Configura tu número de WhatsApp
# Edita el archivo .env.local y pon tu número:
NEXT_PUBLIC_WHATSAPP_NUMBER=526141234567
# (52 = México, luego tu número sin espacios ni +)

# 4. Corre el proyecto
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📁 Estructura del proyecto

```
perfumes-ararat/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de inicio
│   └── globals.css         # Estilos globales (negros y dorados)
├── components/
│   ├── Navbar.tsx          # Barra de navegación con logo
│   ├── HeroSection.tsx     # Banner principal animado
│   ├── CatalogSection.tsx  # Catálogo con filtros
│   ├── PerfumeCard.tsx     # Tarjeta de cada perfume
│   ├── CartDrawer.tsx      # Carrito lateral de cotización
│   ├── FloatingWhatsApp.tsx # Botón flotante de WhatsApp
│   └── Footer.tsx          # Pie de página
├── data/
│   └── perfumes.ts         # ← AQUÍ agregas/editas tus perfumes
├── store/
│   └── cartStore.ts        # Lógica del carrito (Zustand)
└── public/
    ├── logo.png            # Tu logo de Ararat
    └── images/perfumes/    # Pon aquí tus fotos de perfumes
```

---

## 🛍️ Cómo agregar tus perfumes

Edita `data/perfumes.ts`. Cada perfume tiene esta forma:

```typescript
{
  id: '9',
  code: 'ARR-009',           // ← Código único
  name: 'Nombre del Perfume',
  brand: 'Ararat Exclusive',
  description: 'Descripción atractiva del perfume...',
  category: 'Oriental',      // Oriental | Floral | Fresco | Amaderado | Gourmand | Citrico
  gender: 'Unisex',          // Hombre | Mujer | Unisex
  notes: {
    top: ['Bergamota', 'Pimienta'],
    middle: ['Oud', 'Rosa'],
    base: ['Ámbar', 'Sándalo'],
  },
  sizes: [
    { ml: 30, price: 850 },
    { ml: 50, price: 1200 },
    { ml: 100, price: 1900 },
  ],
  image: '/images/perfumes/oud-noir.jpg',  // Pon la foto en /public/images/perfumes/
  featured: true,   // Aparece con estrella dorada
}
```

---

## 📸 Cómo agregar fotos de tus perfumes

1. Copia tus imágenes a la carpeta `public/images/perfumes/`
2. En `data/perfumes.ts`, cambia el campo `image`:
   ```
   image: '/images/perfumes/mi-perfume.jpg'
   ```
3. Formatos recomendados: JPG o PNG, mínimo 600×600px

---

## 💬 Configuración de WhatsApp

En `.env.local`:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=526141234567
```
- `52` = código de México
- Sin `+`, sin espacios, sin guiones

**¿Cómo funciona?**
- Botón en cada tarjeta → envía código + nombre del perfume
- Carrito de cotización → envía lista completa con precios
- Botón flotante → saludo general

---

## 🎨 Personalización de colores

En `tailwind.config.js` → sección `colors`:
```js
gold: {
  DEFAULT: '#C9A84C',  // ← Cambia el dorado
},
```

---

## 🚀 Deploy (publicar en internet)

La opción más sencilla es [Vercel](https://vercel.com) (gratis):

```bash
npm install -g vercel
vercel
```

O súbelo a GitHub y conéctalo con Vercel para deploy automático.

---

## 🛠️ Stack tecnológico

| Herramienta | Uso |
|---|---|
| Next.js 14 | Framework React |
| Tailwind CSS | Estilos utilitarios |
| Ant Design (antd) | Componentes UI |
| Framer Motion | Animaciones suaves |
| Zustand | Estado del carrito |

---

**¿Dudas?** El carrito guarda los perfumes seleccionados y al hacer clic en "Enviar cotización por WhatsApp" genera automáticamente el mensaje con código, nombre, talla y precio.
