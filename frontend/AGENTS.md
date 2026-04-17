# AGENTS.md

## Project context
This is a React project written in JavaScript.

The repository may contain Polish names in:
- file names
- component names
- variables
- functions
- props
- state fields
- service names
- store names
- UI labels
- comments

The main goal is to review the codebase first, then gradually standardize naming and visible UI text in English without breaking the application.

---

## Primary objectives
When working in this repository, follow this order of priorities:

1. Understand the current codebase before making any changes.
2. Preserve current behavior unless a change is explicitly requested.
3. Identify Polish names and propose good English replacements.
4. Apply changes gradually in small, reviewable batches.
5. Improve readability and consistency where it is safe.
6. Avoid risky large-scale refactors unless clearly requested.

---

## Required workflow
Always work in the following sequence:

### Step 1 — Review first
Before editing code:
- scan the project structure
- identify main pages, components, services, hooks, stores, and routing
- identify state management approach
- identify naming inconsistencies
- identify technical debt and code smells
- identify all Polish names in code and UI
- propose English replacements
- prepare a file-by-file plan

Do not start editing immediately unless explicitly requested.

### Step 2 — Plan changes
Before making changes, explain:
- what should be changed
- why it should be changed
- which files are affected
- which renames may be risky

### Step 3 — Apply changes gradually
When editing code:
- work in small batches
- prefer small and safe refactors
- keep each batch easy to review
- avoid mixing unrelated changes in one step

### Step 4 — Summarize after each batch
After each change batch, provide:
- list of edited files
- list of renamed identifiers
- list of renamed UI labels
- anything that may require manual review
- any risks or assumptions

---

## Naming and language rules
The repository should gradually move toward English naming.

### Rename to English
Rename Polish names to English in:
- component names
- file names
- variables
- functions
- hooks
- services
- store fields
- local state names
- UI labels
- route labels where safe

### Keep meaning, not literal wording
Prefer natural technical English over literal translation.

Good examples:
- `StronaLogowania` -> `LoginPage`
- `zwierzeService` -> `animalService`
- `pobierzZwierzeta` -> `fetchAnimals`
- `usunZwierze` -> `deleteAnimal`
- `listaZwierzat` -> `animalList`
- `czyZalogowany` -> `isAuthenticated`

### Consistency rules
- use one consistent naming style across the codebase
- keep React component names in PascalCase
- keep variables and functions in camelCase
- keep filenames consistent with project conventions
- use clear and simple English names
- avoid unnecessary abbreviations
- avoid mixing Polish and English in one file

---

## Safety rules
Do not break existing behavior.

### Preserve behavior
- do not change business logic unless explicitly requested
- do not change API contracts unless clearly safe
- do not rename backend field names if this could break compatibility
- do not rename payload keys sent to backend unless explicitly verified as safe
- do not rename environment variables unless requested
- do not remove code unless it is clearly unused and safe to remove

### Import safety
When renaming files or components:
- update all imports
- update all references
- verify related usage across the project

### Scope control
Do not perform large global renames in one step unless explicitly requested.
Prefer:
- first components
- then services
- then hooks/stores
- then UI labels
- then optional cleanup

---

## React and JavaScript rules
When reviewing or editing this project, follow these guidelines:

### React structure
- keep components readable and reasonably small
- split overly large components only when clearly useful
- avoid unnecessary nesting
- keep props readable
- avoid duplicate UI logic when possible

### Hooks
- use hooks correctly
- avoid incorrect dependency handling in effects
- flag suspicious `useEffect` usage
- avoid unnecessary state where derived values are enough

### State management
- identify how auth, app state, and API data are handled
- point out duplicated or confusing state
- prefer clarity over cleverness

### Services and API layer
- keep service functions clearly named
- separate UI logic from API logic when possible
- keep API helpers consistent
- do not silently change backend-facing data structures

### Cleanup
Where safe:
- remove unused imports
- remove dead code
- remove obvious duplication
- improve naming consistency
- improve readability

Do not do risky architectural rewrites unless explicitly requested.

---

## Code review expectations
During review, pay special attention to:

- unclear component responsibilities
- inconsistent naming
- Polish names mixed with English names
- duplicated logic
- dead code
- unused imports
- weak or confusing folder structure
- risky side effects
- inconsistent service naming
- inconsistent auth/store naming
- UI text still left in Polish
- places where renaming could break API compatibility

---

## Output format
Use the following response structure.

### When only reviewing
Provide:
1. project structure overview
2. main components/pages/services/hooks/stores
3. routing overview
4. state management overview
5. technical debt and code smells
6. list of Polish names found
7. proposed English replacements
8. file-by-file change plan
9. risky areas requiring caution

### Before making changes
Provide:
1. batch scope
2. files to edit
3. exact renames planned
4. possible risks

### After making changes
Provide:
1. edited files
2. renamed files
3. renamed identifiers
4. renamed UI labels
5. anything still left in Polish
6. anything requiring manual review

---

## Preferred editing strategy
Preferred order of work:

1. Review only, no edits
2. Rename obvious files and components
3. Rename services, functions, and variables
4. Rename UI labels
5. Clean up dead code and unused imports
6. Perform only small safe refactors

Do not combine all steps into one huge change unless explicitly requested.

---

## What not to do
- do not start with massive automatic renaming
- do not change backend contracts blindly
- do not refactor architecture without a clear reason
- do not rename everything at once
- do not mix feature work with naming cleanup
- do not hide risky changes
- do not assume Polish domain words should always be translated literally

---

## If something is ambiguous
If a Polish term is ambiguous:
- choose the most natural technical English name
- explain the choice briefly
- flag it for manual review if needed

If a rename may break backend compatibility:
- do not apply it automatically
- explain the risk first

---

## Main instruction
First review the codebase and prepare a plan.
Do not edit immediately unless explicitly asked to start making changes.
When making changes, do them gradually and safely.
Preserve application behavior.
Standardize naming and UI text in English wherever safe.