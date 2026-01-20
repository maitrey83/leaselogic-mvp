# LeaseLogic

Utah-compliant legal document generator for landlords and property managers.

## Quick Start

### Prerequisites
- Node.js 20 LTS
- npm

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### Environment Setup

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Update the values in `.env` as needed.

### Running the Application

```bash
# Start the backend (from backend directory)
cd backend
npm start

# Start the frontend (from root directory)
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - |
| `REACT_APP_USE_NEW_DOCUMENT_SYSTEM` | Feature flag for config-driven system | `false` |

## Feature Flags

### `REACT_APP_USE_NEW_DOCUMENT_SYSTEM`

Controls the document generation system used for the 3-Day Notice form.

| Value | Behavior |
|-------|----------|
| `false` (default) | Uses the original hardcoded MVP system. **Production-safe.** |
| `true` | Uses the new config-driven system with DocumentService, ValidationService, and TemplateService. |

**Migration Status:** Task 3.1 - In Progress

This flag enables a gradual migration from hardcoded form logic to a configuration-driven architecture. The old system remains functional and is the default until the new system is fully validated.

**Important:**
- Keep this flag `false` in production until migration is complete
- Both systems must produce identical output
- See `requirements/Phases/guides/Phase3/TASK-3.1-migrate-3day-notice.md` for details

## Project Structure

```
LeaseLogic/
├── src/                      # React frontend
│   ├── components/           # React components
│   ├── config/               # Configuration files
│   │   └── documents/        # Document definitions
│   ├── services/             # Service layer
│   └── utils/                # Utility functions
├── backend/                  # Express.js backend
│   ├── src/                  # Backend source code
│   ├── tests/                # Backend tests
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── requirements/             # Project documentation
```

## Architecture

### Document System (Phase 2+)

The application uses a config-driven architecture for document generation:

- **Document Definitions** (`src/config/documents/`): Define fields, validation, and templates
- **DocumentService**: Loads and provides document definitions
- **ValidationService**: Validates form data against document rules
- **TemplateService**: Renders document previews

## License

Proprietary - All rights reserved
