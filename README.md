FitPages
========

A web app interface for viewing data exports from [Fitnotes](http://www.fitnotesapp.com/), the best app ever.

Works on both desktop & mobile.

Development Setup
-----------------

This project uses a devcontainer for consistent development environments.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. Clone this repository
2. Copy the `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
1. Fill out the `.env` file, using the comments in the file for guidance
1. Open the project in VS Code
1. When prompted, click "Reopen in Container" or use the command palette (`Cmd/Ctrl + Shift + P`) and select "Dev Containers: Reopen in Container"
1. The container will build and install all dependencies automatically
1. Once the container is ready, you can start development

### Available Scripts

Once the devcontainer is running, you'll have access to:

- `npm run dev` - Start the Vite development server (frontend only)
- `npm run dev:vercel` - Start the development server with Vercel (handles both frontend and API routes)
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm test` - Run tests with Vitest

### Environment Variables

This project requires the following environment variables in your `.env` file:

- `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob Store read/write token for storing and retrieving the FitNotes database

### Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI framework
- **Vitest** - Testing framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework (configured in devcontainer)

Running Tests
-------------

To run the test suite with Vitest:

```
npm test
```

Or, for watch mode:

```
npm test -- --watch
```

Known Quirks
------------

- Records don't show beyond 15RM for now
- The record-calculating algorithm is actually _more_ accurate than Fitnotes' in the case of a weight tie
  - For example, if you achieved 6RM 80kg on January 1st and 7RM 80kg on January 8th, Fitnotes would show January 8th for both. This app keeps them separate, since you achieved the 6RM before you achieved the 7RM.
