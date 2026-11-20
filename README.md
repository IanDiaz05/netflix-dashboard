# Analítica de Catálogo de Netflix

Dashboard interactivo para explorar el catálogo de películas y series de Netflix y apoyar decisiones de promoción y campañas de contenido.

La aplicación está publicada y accesible en cualquiera de estas dos direcciones:

- https://ntflx-dashboard.iandigitals.com
- https://ntflx-dashboard.vercel.app

## De qué trata

Consultar un archivo plano con miles de registros hace difícil detectar patrones para planificar campañas. Este proyecto convierte el dataset [Netflix Movies and TV Shows (Kaggle)](https://www.kaggle.com/datasets/shivamb/netflix-shows) —con 8,807 títulos— en un tablero visual dividido en cuatro vistas:

- **Resumen:** KPIs generales, proporción entre películas y series, y distribución por clasificación de edad (`rating`).
- **Tendencias:** evolución de lanzamientos por año (`release_year`), ritmo de incorporación a la plataforma (`date_added`) y distribución de duraciones en minutos o temporadas.
- **Geografía:** concentración de producciones por país y ranking de los principales mercados productores.
- **Catálogo:** buscador operativo con filtros combinables (formato, año, clasificación) y vista de detalle con sinopsis, dirección y reparto.

## Usuario objetivo

El tablero está pensado para un **Estratega de Marketing de Contenidos y Promoción del Catálogo**, quien necesita decidir qué títulos destacar, cómo agrupar colecciones temáticas por género o talento y hacia qué segmentos de audiencia dirigir la comunicación.

## Arquitectura y tecnologías

El sistema sigue una arquitectura de tres capas desacoplada para despliegue en la nube:

- **Frontend (Vercel):** React, TypeScript, Vite, Tailwind CSS y shadcn/ui. Incluye manejo de estados de carga mediante Skeleton UI independiente por componente.
- **Backend (VPS con Dokploy):** Python 3.12, FastAPI, Pydantic y SQLAlchemy. Expone endpoints de consulta analítica y cuenta con un script CLI de limpieza e importación inicial de datos.
- **Base de datos y contenedores:** PostgreSQL 18 (`postgres:18-alpine`) y Docker Compose separados para desarrollo (`docker-compose.dev.yml`) y producción (`docker-compose.prod.yml`).

## Ejecución en local

### Requisitos previos

- Node.js y `pnpm`
- Python 3.12+
- Docker y Docker Compose

### 1. Variables de entorno

Copia la plantilla de configuración en la raíz del proyecto y ajusta los valores si es necesario:

```bash
cp .env.example .env
```

Asegúrate de que `DATABASE_URL` apunte a `localhost:5432` si vas a ejecutar scripts desde tu máquina anfitriona, o a `netflix_db:5432` si los correrás dentro del contenedor.

### 2. Base de datos y Backend

Levanta PostgreSQL y la API en modo desarrollo desde la raíz del repositorio:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Si quieres tener el entorno virtual local disponible para ejecutar pruebas o el script de carga desde fuera de Docker:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Para poblar la base de datos por primera vez con el archivo CSV limpio, ejecuta el seeder dentro del contenedor de la API (o desde tu `.venv` local):

```bash
docker compose -f docker-compose.dev.yml exec netflix_api python -m scripts.seed_db
```

La API quedará disponible en `http://localhost:8000` (documentación interactiva en `/docs`).

### 3. Frontend

En otra terminal, entra a la carpeta del frontend, instala las dependencias y levanta el servidor de desarrollo:

```bash
cd frontend
pnpm install
pnpm dev
```

Abre `http://localhost:5173` en tu navegador.

## Team

- Ian Diaz | 230301007
- Emiliano Burgos | 230300973
