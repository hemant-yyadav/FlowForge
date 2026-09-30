# FlowForge

FlowForge is a real-time collaborative workspace application that combines the power of Notion-style rich text editing with interactive, collaborative whiteboarding. Built for modern teams, FlowForge allows you to take notes, create dynamic whiteboards, and seamlessly embed live, interactive whiteboard sessions directly into your documentation.

## Features

- **Rich Text WYSIWYG Editor**: A Notion-like note-taking experience powered by BlockNote. Format text on the fly, use slash commands (`/`), and structure your thoughts beautifully.
- **Real-Time Collaborative Whiteboards**: Infinite canvas whiteboards for brainstorming, diagramming, and visual collaboration. Multiple users can draw and interact in real-time, complete with a live chat sidebar and multiplayer cursors.
- **Embedded Whiteboard Blocks**: Bring your documentation to life. Embed live whiteboards directly inside your notes as visual, interactive blocks instead of static images or text links.
- **Workspaces & Organization**: Organize your team's notes and rooms into dedicated workspaces.
- **Real-Time Sync**: Powered by WebSockets to ensure that every stroke, chat message, and cursor movement is instantly synchronized across all clients.

## Tech Stack

This project is built using a modern, scalable monorepo architecture powered by **Turborepo**.

### Frontend (`apps/flowforge-frontend`)
- **Next.js**: React framework for the user interface and server-side rendering.
- **BlockNote**: ProseMirror-based WYSIWYG editor for the rich text note-taking experience.
- **Tailwind / Vanilla CSS**: For sleek, modern, and responsive UI components.

### Backend 
- **HTTP Backend (`apps/http-backend`)**: Node.js & Express REST API for handling authentication, workspace management, and database operations.
- **WebSocket Backend (`apps/ws-backend`)**: Node.js & `ws` server for handling low-latency, real-time multiplayer drawing and chat.
- **Prisma**: Next-generation Node.js and TypeScript ORM for interacting with the database.
- **PostgreSQL**: Primary relational database.

## Project Structure

```text
my-turborepo/
├── apps/
│   ├── flowforge-frontend/   # Next.js web application
│   ├── http-backend/         # Express REST API
│   └── ws-backend/           # WebSocket server for real-time collaboration
├── packages/
│   ├── db/                   # Shared Prisma database schema and client
│   ├── backend-common/       # Shared backend utilities, types, and JWT logic
│   ├── common/               # Shared constants and configurations
│   ├── eslint-config/        # Shared ESLint configurations
│   ├── typescript-config/    # Shared tsconfig configurations
│   └── ui/                   # Shared React UI components
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- `pnpm` package manager
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/16215harsh/FlowForge.git
   cd FlowForge/my-turborepo
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up the Database:**
   Ensure you have a running PostgreSQL database. Create a `.env` file in `packages/db` and define your `DATABASE_URL`.
   ```bash
   cd packages/db
   npx prisma migrate dev
   ```

4. **Environment Variables:**
   You will need to set up `.env` files for the frontend and backends containing necessary secrets like `JWT_SECRET`, database URLs, and API endpoints (e.g., pointing the frontend to `http://localhost:3001` for HTTP and `ws://localhost:8080` for WebSockets).

### Running the App

To start all applications (frontend, http-backend, and ws-backend) simultaneously in development mode, run:

```bash
pnpm run dev
```

- The **Frontend** will be available at `http://localhost:3000`
- The **HTTP API** will be running on `http://localhost:3001`
- The **WebSocket Server** will be running on `ws://localhost:8080`

## Building for Production

To build all apps and packages for production, use Turborepo's build command:

```bash
npx turbo build
```

## License

This project is licensed under the MIT License.
