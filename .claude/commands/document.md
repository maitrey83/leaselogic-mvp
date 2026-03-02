Add JSDoc comments and a top-of-file summary to: $ARGUMENTS

## Steps

1. Read the file specified in $ARGUMENTS
2. Identify all exported functions, classes, and key constants
3. For each function/method, add a JSDoc comment with:
   - One-line description of what it does
   - `@param` for each parameter with type and purpose
   - `@returns` with type and description
   - `@throws` if it can throw
4. Add a top-of-file block comment summarizing:
   - What this file is responsible for
   - Which layer it belongs to (controller in `controllers/` — MVP, DO NOT MODIFY; API in `api/`; route in `routes/`; service in `services/`; middleware in `middleware/`; frontend component in `src/components/`; page in `src/pages/`)
   - Key dependencies
5. Output the documented version for review — do NOT write it back until I approve

## Rules
- Never modify files in `backend/src/controllers/` — those are MVP code (Strangler Fig pattern)
- Keep comments concise — audience is a dev unfamiliar with this file
- Match existing code style (no TypeScript annotations in .js files)
