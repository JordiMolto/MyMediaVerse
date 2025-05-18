# MyMediaVerse 🎬📚🐉

MyMediaVerse es una aplicación web diseñada para ayudarte a organizar, rastrear y descubrir tus películas, series de televisión y animes favoritos. Nunca más olvides qué episodio viste por última vez o qué película te recomendaron.

## ✨ Características Principales

*   **Seguimiento Detallado**: Registra lo que has visto, estás viendo o planeas ver.
*   **Puntuaciones y Notas**: Guarda tus propias puntuaciones y notas personales para cada título.
*   **Organización Fácil**: Utiliza estados (Pendiente, Viendo, Completado, Droppeado) y marca tus favoritos.
*   **Filtrado y Ordenación**: Encuentra rápidamente lo que buscas con opciones de filtrado por estado, favoritos y ordenación por título o puntuación.
*   **Interfaz Intuitiva**: Diseño limpio y fácil de usar construido con Vue 3.
*   **Simulación de Autenticación**: Incluye flujos de registro e inicio de sesión (actualmente simulados en el frontend).

## 🛠️ Tecnologías Utilizadas

### Frontend
*   **Vue 3**: Framework progresivo de JavaScript para construir interfaces de usuario.
*   **TypeScript**: Superset de JavaScript que añade tipado estático.
*   **Vite**: Herramienta de desarrollo frontend moderna y rápida.
*   **Vue Router**: Para la gestión de rutas en la aplicación de una sola página (SPA).
*   **CSS Moderno**: Variables CSS, Flexbox y Grid para el diseño responsive.

### Backend (Conceptual / Planificado)
*   **Node.js**: Entorno de ejecución de JavaScript del lado del servidor.
*   **Express.js**: Framework minimalista y flexible para Node.js, para construir APIs.
*   **MySQL**: Sistema de gestión de bases de datos relacional.
*   **JWT (JSON Web Tokens)**: Para la autenticación y autorización de usuarios.

## 🚀 Empezando

Estos son los pasos para poner en marcha el frontend del proyecto en tu entorno local.

### Prerrequisitos

*   Node.js (se recomienda la versión LTS)
*   npm (generalmente viene con Node.js) o Yarn

### Instalación y Ejecución (Frontend)

1.  **Clona el repositorio (si aún no lo has hecho):**
    ```bash
    git clone https://URL_DE_TU_REPOSITORIO_GIT
    cd MyMediaVerse
    ```

2.  **Navega al directorio del frontend:**
    ```bash
    cd frontend
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
    o si usas Yarn:
    ```bash
    yarn install
    ```

4.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    o si usas Yarn:
    ```bash
    yarn dev
    ```

5.  Abre tu navegador y visita `http://localhost:5173` (o el puerto que indique Vite en tu consola).

### Backend

*La configuración y ejecución del backend se añadirán aquí una vez que el desarrollo del backend esté más avanzado.*

## 📖 Estructura del Proyecto (Frontend)

```
MyMediaVerse/
├── frontend/
│   ├── public/                   # Archivos estáticos
│   │   ├── assets/               # Recursos como imágenes, fuentes (si los hubiera)
│   │   ├── src/
│   │   │   ├── assets/               # Recursos como imágenes, fuentes (si los hubiera)
│   │   │   ├── components/           # Componentes reutilizables de Vue
│   │   │   │   ├── MediaListItem.vue
│   │   │   │   └── (otros componentes...)
│   │   │   ├── router/               # Configuración de Vue Router
│   │   │   │   └── index.ts
│   │   │   ├── types/                # Definiciones de tipos TypeScript
│   │   │   │   └── media.ts
│   │   │   ├── views/                # Componentes de página (rutas)
│   │   │   │   ├── HomeView.vue
│   │   │   │   ├── MoviesView.vue
│   │   │   │   ├── SeriesView.vue
│   │   │   │   ├── AnimesView.vue
│   │   │   │   ├── LoginView.vue
│   │   │   │   └── RegisterView.vue
│   │   │   ├── App.vue               # Componente raíz de la aplicación
│   │   │   ├── main.ts               # Punto de entrada de la aplicación
│   │   │   └── style.css             # Estilos globales
│   │   ├── index.html                # Plantilla HTML principal
│   │   ├── package.json
│   │   ├── tsconfig.json             # Configuración de TypeScript
│   │   └── vite.config.ts          # Configuración de Vite
│   ├── backend/                      # (Directorio para el código del backend)
│   ├── .gitignore
│   └── README.md
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor:

1.  Haz un Fork del proyecto.
2.  Crea tu rama de característica (`git checkout -b feature/AmazingFeature`).
3.  Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo y modificarlo como desees. Si decides distribuirlo, por favor, considera dar crédito.

---

*Recuerda reemplazar `https://URL_DE_TU_REPOSITORIO_GIT` con la URL real de tu repositorio una vez que lo hayas subido a una plataforma como GitHub.* 