# VibeCorde API Tester

## Overview

This is a full-stack API testing application built with React, Express, and PostgreSQL. It provides a Postman-like interface for testing REST APIs, with features for saving requests, managing configurations, and viewing request history. The application uses a modern tech stack with TypeScript, shadcn/ui components, and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite as the build tool. It follows a component-based architecture with:

- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and local React state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API communication

The frontend is organized into:
- `/client/src/components/` - Reusable UI components
- `/client/src/pages/` - Page components
- `/client/src/lib/` - Utility functions and configurations
- `/client/src/hooks/` - Custom React hooks

### Backend Architecture

The backend is an Express.js server with TypeScript, structured as:

- **Web Framework**: Express.js with middleware for JSON parsing and logging
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for request validation
- **Development**: Vite integration for hot reloading in development
- **Storage**: Abstracted storage layer with in-memory fallback

The backend is organized into:
- `/server/` - Express server setup and middleware
- `/server/routes.ts` - API route definitions
- `/server/storage.ts` - Database abstraction layer
- `/shared/` - Shared types and schemas between frontend and backend

### Data Flow

1. **Request Flow**: Client → React components → TanStack Query → Axios → Express routes → Storage layer → Database
2. **Response Flow**: Database → Storage layer → Express routes → Axios → TanStack Query → React components
3. **Real-time Updates**: TanStack Query handles cache invalidation and refetching

## Key Components

### Database Schema

The application uses three main database tables:

1. **Users**: Basic user authentication (id, username, password)
2. **API Requests**: Request history tracking (method, URL, headers, body, response, status, duration, timestamp)
3. **API Configurations**: Saved API configurations (name, description, endpoints, created_at)

### Core Features

1. **API Testing Interface**: Send HTTP requests with custom headers, body, and parameters
2. **Request History**: View and replay previous API requests
3. **Configuration Management**: Save and load API configurations
4. **Response Viewer**: Display formatted responses with syntax highlighting
5. **Export/Import**: Save configurations to JSON files

### Storage Layer

The storage layer provides an abstraction over database operations with:

- **Interface**: `IStorage` defines all database operations
- **Implementation**: `MemStorage` provides in-memory storage for development
- **Future**: Designed to support PostgreSQL with Drizzle ORM

### UI Components

The application uses a comprehensive set of shadcn/ui components including:
- Form controls (Input, Textarea, Select, Button)
- Layout components (Card, Tabs, Dialog, Sheet)
- Data display (Table, Badge, Toast)
- Navigation (Sidebar, Breadcrumb)

## External Dependencies

### Frontend Dependencies

- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **Data Fetching**: TanStack Query, Axios
- **Styling**: Tailwind CSS, class-variance-authority
- **Validation**: Zod
- **Utilities**: date-fns, clsx

### Backend Dependencies

- **Server**: Express.js, tsx for TypeScript execution
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Validation**: Zod, drizzle-zod
- **Session**: connect-pg-simple for PostgreSQL sessions
- **Build**: esbuild for production bundling

### Development Dependencies

- **Build Tools**: Vite, TypeScript, PostCSS
- **Linting**: ESLint configuration
- **Replit Integration**: Replit-specific plugins and error handling

## Deployment Strategy

### Development Mode

- Frontend: Vite dev server with hot module replacement
- Backend: tsx with nodemon-like behavior for auto-restart
- Database: Development database with push migrations

### Production Build

1. **Frontend Build**: `vite build` creates optimized static assets
2. **Backend Build**: `esbuild` bundles server code for Node.js
3. **Database**: `drizzle-kit push` applies schema changes
4. **Deployment**: Single Node.js process serving both API and static files

### Environment Configuration

- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific configuration

### Key Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

The application is designed to be deployed on Replit with built-in support for PostgreSQL databases and development tooling.