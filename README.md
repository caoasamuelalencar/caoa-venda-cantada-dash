# VisActor Next.js Dashboard Template

A modern dashboard template built with [VisActor](https://visactor.io/) and Next.js, featuring a beautiful UI and rich data visualization components.

[Live Demo](https://visactor-next-template.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=A%20modern%20dashboard%20with%20VisActor%20charts%2C%20dark%20mode%2C%20and%20data%20visualization%20for%20seamless%20analytics.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F646TLqKGSTOnp1CD1IUqoM%2Fa119adac1f5a844f9d42f807ddc075f5%2Fthumbnail.png&demo-title=VisActor%20Next.js%20Template&demo-url=https%3A%2F%2Fvisactor-next-template.vercel.app%2F&from=templates&project-name=VisActor%20Next.js%20Template&repository-name=visactor-nextjs-template&repository-url=https%3A%2F%2Fgithub.com%2Fmengxi-ream%2Fvisactor-next-template&skippable-integrations=1)

## Features

- 📊 **Rich Visualizations** - Powered by VisActor, including bar charts, gauge charts, circle packing charts, and more
- 🌗 **Dark Mode** - Seamless dark/light mode switching with system preference support
- 📱 **Responsive Design** - Fully responsive layout that works on all devices
- 🎨 **Beautiful UI** - Modern and clean interface built with Tailwind CSS
- ⚡️ **Next.js 15** - Built on the latest Next.js features and best practices
- 🔄 **State Management** - Efficient state management with Jotai
- 📦 **Component Library** - Includes Shadcn components styled with Tailwind

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [VisActor](https://visactor.io/) - Visualization library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn](https://ui.shadcn.com/) - UI components
- [Jotai](https://jotai.org/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Quick Start

You can deploy this template to Vercel by clicking the button above, or clone this repository and run it locally.

[Github Repo](https://github.com/mengxi-ream/visactor-next-template)

1. Clone this repository

```bash
git clone https://github.com/mengxi-ream/visactor-next-template
```

2. Install dependencies

```bash
pnpm install
```

3. Run the frontend development server

```bash
pnpm dev:web
```

4. Open [http://localhost:3003](http://localhost:3003) with your browser to see the result.

If you also want the API running locally, start the backend in another terminal:

```bash
pnpm dev:backend
```

## Backend and Docker Setup

This repository now includes a backend API service and database infrastructure in a mono-repo layout:

- `/backend` - Node.js + Express REST API with Prisma and PostgreSQL
- `docker-compose.yml` - Compose setup for frontend, backend and Postgres
- `Dockerfile.web` - Production Docker build for the Next.js frontend
- `backend/Dockerfile` - Production Docker build for the backend API
- `backend/src/swagger.ts` - OpenAPI spec and Swagger UI page for the API

### API endpoints

- `GET /health`
- `GET /sales-intentions`
- `GET /sales-intentions/:id`
- `POST /sales-intentions`
- `PUT /sales-intentions/:id`
- `DELETE /sales-intentions/:id`

### Swagger

After starting the backend, open:

- `http://localhost:4000/docs` for the Swagger UI
- `http://localhost:4000/openapi.json` for the raw OpenAPI spec

### Backend env

The backend expects a PostgreSQL connection string in `DATABASE_URL`. When running locally, you can create `backend/.env` based on `backend/.env.example`.

Example:

```bash
DATABASE_URL="postgresql://app:change_me@localhost:5432/salesdb?schema=public"
PORT=4000
```

### Visualizar o banco

Use o Prisma Studio para abrir o banco no navegador:

```bash
pnpm --dir backend db:studio
```

Isso abre uma interface web para consultar e editar os registros da tabela `SalesIntention`.

Se preferir, você também pode subir o Docker e conectar em um cliente externo usando:

- host: `localhost`
- porta: `5432`
- usuário: `app`
- senha: `change_me`
- banco: `salesdb`

### Run locally with Docker

```bash
docker compose up --build
```

This starts:

- frontend on [http://localhost:3001](http://localhost:3001)
- backend on [http://localhost:4001](http://localhost:4001)
- Postgres on `localhost:5432`

### Run backend locally

```bash
pnpm dev:backend
```

Depois abra:

- `http://localhost:4000/docs` para a interface do Swagger
- `http://localhost:4000/openapi.json` para o JSON OpenAPI bruto
- `http://localhost:4000/health` para checagem rápida

## Project Structure

```bash
src/
├── app/ # App router pages
├── components/ # React components
│ ├── chart-blocks/ # Chart components
│ ├── nav/ # Navigation components
│ └── ui/ # UI components
├── config/ # Configuration files
├── data/ # Sample data
├── hooks/ # Custom hooks
├── lib/ # Utility functions
├── style/ # Global style
└── types/ # TypeScript types
```

## Charts

This template includes several chart examples:

- Average Tickets Created (Bar Chart)
- Ticket by Channels (Gauge Chart)
- Conversions (Circle Packing Chart)
- Customer Satisfaction (Linear Progress)
- Metrics Overview

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [VisActor](https://visactor.io/) - For the amazing visualization library
- [Vercel](https://vercel.com) - For the incredible deployment platform
- [Next.js](https://nextjs.org/) - For the awesome React framework
