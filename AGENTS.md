# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Build the solution
dotnet build

# Run the API (starts on http://localhost:5101)
dotnet run --project InwentarzWGospodarstwie/InwentarzWGospodarstwie.csproj

# EF Core database migrations
dotnet ef migrations add <MigrationName> --project InwentarzWGospodarstwie/InwentarzWGospodarstwie.csproj
dotnet ef database update --project InwentarzWGospodarstwie/InwentarzWGospodarstwie.csproj
```

Swagger UI is available at `http://localhost:5101/swagger` (root `/` redirects there automatically).

## Architecture

This is an **ASP.NET Core 8 REST API** for farm/livestock inventory management. No frontend — API-only with Swagger for exploration.

**Layers:**
- `Controllers/` — REST endpoints, DTOs (inline request/response records), validation, HTTP status codes
- `Models/` — EF Core entities and `Database.cs` (the `DbContext` inheriting `IdentityDbContext<User>`)
- `Migrations/` — EF Core migration history

**Database:** SQL Server LocalDB, database name `InwentarzGospodarstwo`, configured in `appsettings.json`.

## Full Naming Migration (PL → EN) — ACTIVE

The project is undergoing a **complete** Polish-to-English migration across ALL layers:
- C# identifiers (classes, properties, methods, parameters, variables, files)
- REST route paths
- JSON property names (wire format)
- Database table and column names (via new EF migration)
- Error messages and validation messages visible to API consumers

**Nothing stays in Polish except:** the project/solution name (`InwentarzWGospodarstwie`) for now, and the database name `InwentarzGospodarstwo` in `appsettings.json` (change separately if desired).

## Coding Conventions

- C# naming: `PascalCase` for classes/properties/methods, `camelCase` for parameters and locals, `_camelCase` for private fields
- DTOs: C# `record` types, defined inline in the controller that uses them
- Nullability: nullable reference types enabled (treat `?` seriously)
- Async: use `async`/`await` for DB operations (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`)
- Validation: Data Annotations on DTOs (`[Required]`, `[StringLength]`, `[Range]`) with English messages
- HTTP status codes: return typed results (`Ok`, `NotFound`, `Conflict`, `NoContent`, `BadRequest`) — do not throw for control flow
- JSON: camelCase property names in request and response bodies (default ASP.NET Core serialization)
- REST routes: lowercase plural English (`/api/animals`, not `/api/Animal`)
- Error messages: English, consumer-friendly, e.g. `"Animal with the specified ID was not found."`

## Domain Model (target state — English)

| Entity | Table | Description |
|--------|-------|-------------|
| `Animal` | animals | Livestock with ear tag ID, breed, age, weight, acquisition/departure records |
| `Farm` | farms | Farm with name, address, type, area |
| `Owner` | owners | Farm owner with contact info |
| `Veterinarian` | veterinarians | Veterinarian with contact info |
| `Procedure` | procedures | Veterinary procedure linked to animal + vet |
| `Feeding` | feedings | Feed record linked to animal |
| `User` | AspNetUsers | Identity user; links to `Owner` or `Veterinarian` via FK |

Key relationships: `Animal → Farm`, `Procedure → Animal + Veterinarian`, `Feeding → Animal`, `Farm → Owner`, `User → Owner/Veterinarian`.

## REST Routes (target state)

| Old (PL) | New (EN) |
|----------|----------|
| `/api/zwierzeta` | `/api/animals` |
| `/api/gospodarstwa` | `/api/farms` |
| `/api/wlasciciele` | `/api/owners` |
| `/api/lekarze` | `/api/veterinarians` |
| `/api/zabiegi` | `/api/procedures` |
| `/api/karmienia` | `/api/feedings` |

Controllers renamed accordingly: `ZwierzetaController` → `AnimalsController`, etc.

## Domain Glossary — authoritative

Use these translations CONSISTENTLY across all code, routes, JSON, and DB:

| Polish | English | Notes |
|--------|---------|-------|
| Zwierze / Zwierzę | `Animal` | |
| Gospodarstwo | `Farm` | |
| Wlasciciel / Właściciel | `Owner` | |
| Lekarz | `Veterinarian` | full form, not `Vet` |
| Zabieg | `Procedure` | veterinary procedure |
| Karmienie | `Feeding` | |
| Numer kolczyka / Identyfikator kolczyka | `EarTagId` | |
| Rasa | `Breed` | |
| Waga | `Weight` | |
| Wiek | `Age` | |
| Płeć | `Sex` | biological sex (livestock convention), NOT `Gender` |
| Data zakupu/urodzenia | `AcquisitionDate` | when animal joined the farm |
| Data sprzedaży/śmierci | `DepartureDate` | when animal left the farm |
| Cena zakupu | `PurchasePrice` | |
| Cena sprzedaży | `SalePrice` | |
| Adres | `Address` | |
| Telefon | `PhoneNumber` | |
| Email | `Email` | |
| Imię | `FirstName` | |
| Nazwisko | `LastName` | |
| Powierzchnia | `Area` | hectares |
| Typ gospodarstwa | `FarmType` | |
| Nazwa | `Name` | |
| Data | `Date` | use domain-specific variant where possible (e.g. `ProcedureDate`) |
| Opis | `Description` | |
| Cena | `Price` | use domain variant (`PurchasePrice`, `SalePrice`) where applicable |
| Ilość | `Quantity` | |
| Koszt | `Cost` | |

If a Polish term appears that is NOT in this glossary: STOP, propose a translation, wait for approval, then add it to the glossary before using it in code.

## Migration Strategy — entity-by-entity

Migrate ONE entity per batch, in this order:
1. `Zwierze` → `Animal` (start here — it's referenced by others)
2. `Gospodarstwo` → `Farm`
3. `Wlasciciel` → `Owner`
4. `Lekarz` → `Veterinarian`
5. `Zabieg` → `Procedure`
6. `Karmienie` → `Feeding`

For each entity, change ALL layers in one commit:
1. Rename entity class + properties (`Models/Zwierze.cs` → `Models/Animal.cs`)
2. Update `Database.cs` — `DbSet`, Fluent API, column mappings
3. Rename controller + DTOs + route + action parameters (`Controllers/ZwierzetaController.cs` → `Controllers/AnimalsController.cs`, `[Route("api/animals")]`)
4. Convert all error messages and validation messages in that controller to English
5. Drop `[JsonPropertyName]` overrides — JSON is now English camelCase by default
6. Drop `[Table("zwierzeta")]` and `[Column("...")]` attributes that referenced Polish names — English names map directly
7. Generate EF Core migration for the renames: `dotnet ef migrations add Rename<Entity>ToEnglish`
8. Apply migration: `dotnet ef database update`
9. Run `dotnet build` — must be green, zero warnings
10. Run the app, hit the new endpoint in Swagger, verify data round-trips

**After each entity:** commit to git with message `migrate <PL> -> <EN> (code + route + JSON + DB)` and push.

**Do NOT mix entities in one batch.** One entity at a time, fully migrated across all layers, commit, next.

## Database Migration Rules

- Each entity migration gets its OWN EF migration file named `Rename<Entity>ToEnglish`
- DO NOT delete or modify the existing `20260116234309_Init` migration
- After each `dotnet ef migrations add`, inspect the generated `Up`/`Down` methods to confirm they contain only `RenameTable` and `RenameColumn` operations — no data loss operations like `DropColumn` unless intended
- If EF generates a drop+create instead of a rename, STOP and report it — the rename can usually be forced by configuring `[Table]`/`[Column]` before removing them in two steps

## Identity / Auth

`User` extends `IdentityUser` and is registered via `AddIdentityCore<User>` in `Program.cs`. ASP.NET Identity tables are included in the schema but authentication is not yet enforced on controller endpoints. Do not touch Identity tables (`AspNetUsers`, `AspNetRoles`, etc.) during this migration.

## Controller Pattern (target state)

All controllers follow this structure:
- `[Route("api/<resource-plural>")]` in English, lowercase
- `GET /` (all), `GET /{id}` (by ID), `POST /` (create), `PUT /{id}` (update), `DELETE /{id}` (delete)
- DTOs as inline C# `record` types: `<Entity>UpsertRequest`, `<Entity>Response`
- FK existence validated before create/update; returns `409 Conflict` on referential integrity violations
- Returns `404 Not Found` with English message when entity missing, `204 No Content` on delete
- Error messages in English, e.g.:
  - `"Animal with ID {id} was not found."`
  - `"Farm with ID {farmId} does not exist."`
  - `"Ear tag ID is required."`