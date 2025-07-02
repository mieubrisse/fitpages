FitPages
========

A web app interface for viewing data exports from [Fitnotes](http://www.fitnotesapp.com/), the best app ever.

## Development Setup

This project uses a devcontainer for consistent development environments.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. Clone this repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" or use the command palette (`Cmd/Ctrl + Shift + P`) and select "Dev Containers: Reopen in Container"
4. The container will build and install all dependencies automatically
5. Once the container is ready, you can start development

### Available Scripts

Once the devcontainer is running, you'll have access to:

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm test` - Run tests with Vitest

### Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI framework
- **Vitest** - Testing framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework (configured in devcontainer)

## Running Tests

To run the test suite with Vitest:

```
npm test
```

Or, for watch mode:

```
npm test -- --watch
```

## Project Structure

```
fitpages/
├── .devcontainer/     # Devcontainer configuration
├── src/              # Source code
├── public/           # Static assets
├── tests/            # Test files
└── README.md         # This file
```

Known Quirks
-----------------
- Records don't show beyond 15RM for now
- The record-calculating algorithm is actually _more_ accurate than Fitnotes' in the case of a weight tie 
    - For example, if you achieved 6RM 80kg on January 1st and 7RM 80kg on January 8th, Fitnotes would show January 8th for both. This app keeps them separate, since you achieved the 6RM before you achieved the 7RM.
