# Draw Your Meme - Replit Project Documentation

## Overview

Draw Your Meme is a creative meme token launchpad application that allows users to draw custom memes and instantly deploy them as tokens on PumpFun. The platform follows a simple "Draw → Name → Launch" workflow where users create artwork using an integrated drawing canvas, provide token details (name and ticker), and deploy tokens without requiring wallet connections. The application features a gallery system for browsing created tokens with voting capabilities and social sharing functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with pages for home, gallery, success, and 404
- **UI Framework**: shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Canvas Drawing**: Fabric.js integration for the drawing interface with brush tools, colors, and drawing controls
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

### Backend Architecture
The backend follows a REST API pattern built on Express.js:

- **Framework**: Express.js with TypeScript for the server implementation
- **File Structure**: Modular architecture with separate routing, storage, and server setup
- **API Design**: RESTful endpoints for token operations, voting, and file uploads
- **File Uploads**: Multer middleware for handling image uploads with size and type validation
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot module replacement with Vite integration for development workflow

### Data Storage Solutions
The application uses a flexible storage approach with database integration:

- **ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Schema Design**: Shared schema definitions between frontend and backend using Drizzle-Zod
- **Database**: PostgreSQL configured through Neon Database integration
- **File Storage**: Local file system storage for uploaded images with public URL serving
- **Memory Storage**: In-memory storage implementation for development and testing environments

### Database Schema
Core entities include:
- **Tokens**: ID, name, ticker, image URL, PumpFun link, vote count, creation timestamp
- **Votes**: ID, token reference, voter IP tracking, timestamp for spam prevention
- **Users**: Basic user structure for potential future authentication features

### Authentication and Authorization
Currently implements IP-based voting restrictions rather than user authentication:
- **Voting Security**: IP address tracking to prevent duplicate votes per token
- **No Wallet Required**: Simplified onboarding without wallet connection requirements
- **Future-Ready**: User schema prepared for potential authentication implementation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity through Neon's serverless platform
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration support for PostgreSQL
- **@tanstack/react-query**: Server state management with caching and synchronization
- **react-hook-form & @hookform/resolvers**: Form state management with validation integration

### UI and Styling
- **@radix-ui/***: Complete set of accessible, unstyled UI primitives for components
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe variant management for component styling
- **clsx & tailwind-merge**: Conditional CSS class composition utilities

### Development and Build Tools
- **vite**: Fast build tool and development server with React plugin support
- **tsx**: TypeScript execution for Node.js development workflows
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### File Handling and Utilities
- **multer**: Express middleware for handling multipart/form-data and file uploads
- **date-fns**: Modern date utility library for timestamp formatting
- **fabric.js** (CDN): Canvas manipulation library loaded dynamically for drawing functionality
- **wouter**: Lightweight React router for client-side navigation

### Potential Integrations
- **PumpFun API**: External service for token deployment (implementation pending)
- **Social Media APIs**: Twitter/X and Telegram for automated sharing features
- **Image Optimization**: Future integration for meme image processing and optimization