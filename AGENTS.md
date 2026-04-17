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
- `Migrations/` — EF Core migration history (one migration: `20260116234309_Init`)

**Database:** SQL Server LocalDB, database name `InwentarzGospodarstwo`, configured in `appsettings.json`.

## Domain Model

All entity/field names are currently in Polish (migration to English in progress — see section below):

| Entity | Table | Description |
|--------|-------|-------------|
| `Zwierze` | zwierzeta | Animal/livestock with ear tag ID, breed, age, weight, purchase/sale records |
| `Gospodarstwo` | gospodarstwa | Farm with name, address, type, area |
| `Wlasciciel` | wlasciciele | Farm owner with contact info |
| `Lekarz` | lekarze | Veterinarian |
| `Zabieg` | zabiegi | Veterinary procedure linked to animal + vet |
| `Karmienie` | karmienia | Feed record linked to animal |
| `User` | AspNetUsers | Identity user; links to `Wlasciciel` or `Lekarz` via FK |

Key relationships: `Zwierze → Gospodarstwo`, `Zabieg → Zwierze + Lekarz`, `Karmienie → Zwierze`, `Gospodarstwo → Wlasciciel`, `User → Wlasciciel/Lekarz`.

## Controller Pattern

All six controllers follow the same structure — refer to any existing controller when adding new ones:
- Route: `/api/<resource>` (e.g. `/api/zwierzeta`, being migrated to `/api/animals` — see migration rules below)
- GET all, GET by ID, POST (create), PUT (update by ID), DELETE (by ID)
- DTOs defined inline as C# `record` types: `<Entity>UpsertRequest` and `<Entity>Response`
- FK existence validated before create/update; returns `409 Conflict` on referential integrity violations
- Returns `404 Not Found` when entity not found, `204 No Content` on delete

## Identity / Auth

`User` extends `IdentityUser` and is registered via `AddIdentityCore<User>` in `Program.cs`. ASP.NET Identity tables are included in the schema but authentication is not yet enforced on controller endpoints.

## Coding Conventions

- C# naming: `PascalCase` for classes/properties/methods, `camelCase` for parameters and locals, `_camelCase` for private fields
- DTOs: C# `record` types, defined inline in the controller that uses them
- Nullability: nullable reference types enabled (treat `?` seriously)
- Async: use `async`/`await` for DB operations (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`)
- Validation: use Data Annotations on DTOs (`[Required]`, `[StringLength]`, `[Range]`) where relevant
- HTTP status codes: return typed results (`Ok`, `NotFound`, `Conflict`, `NoContent`, `BadRequest`) — do not throw for control flow

## User-Facing Language

The application domain and any user-visible text (validation messages, error responses, log messages) is in Polish and stays in Polish. Only identifiers in code (classes, properties, methods, variables) are being migrated to English.

## Naming Migration (PL → EN) — in progress

The project is being migrated from Polish to English identifiers. Follow these rules strictly:

**What CAN be renamed freely (safe):**
- Class names, property names, method names, parameter names, local variables
- File names and namespace segments (if Polish)
- Code comments and XML doc comments
- Test names

**What REQUIRES an EF Core migration (do NOT rename without explicit approval):**
- Table names (`zwierzeta`, `gospodarstwa`, `wlasciciele`, `lekarze`, `zabiegi`, `karmienia`)
- Column names in the database
- Any `[Table]`, `[Column]` attributes or Fluent API `.ToTable()` / `.HasColumnName()` calls

Strategy when renaming an entity class: rename the C# class and property freely, but KEEP the original table/column name via `[Table("zwierzeta")]` and `[Column("stara_nazwa_kolumny")]` (or Fluent API equivalent in `Database.cs`) until we decide to do a DB migration.

**What IS a breaking change (do NOT rename without explicit approval):**
- JSON property names in responses (set `[JsonPropertyName("stare_pole")]` on English-named properties to preserve the wire format)
- Keys in `appsettings.json`, environment variables, connection string names

**REST route paths — being migrated to English as part of this work:**

| Old (PL) | New (EN) |
|----------|----------|
| `/api/zwierzeta` | `/api/animals` |
| `/api/gospodarstwa` | `/api/farms` |
| `/api/wlasciciele` | `/api/owners` |
| `/api/lekarze` | `/api/veterinarians` |
| `/api/zabiegi` | `/api/procedures` |
| `/api/karmienia` | `/api/feedings` |

Use plural lowercase English names, consistent with REST conventions.
Rename controllers accordingly (`ZwierzetaController` → `AnimalsController`, etc.).

**Domain glossary (use CONSISTENTLY across the whole repo):**

| Polish | English | Notes |
|--------|---------|-------|
| Zwierze / Zwierzę | `Animal` | |
| Zwierzeta | `Animals` | table/collection |
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
| Data zakupu/urodzenia | `AcquisitionDate` | when animal joined the farm (purchased or born) |
| Data sprzedaży/śmierci | `DepartureDate` | when animal left the farm (sold or died) |
| Cena zakupu | `PurchasePrice` | |
| Cena sprzedaży | `SalePrice` | |
| Adres | `Address` | |
| Powierzchnia | `Area` | |
| Typ gospodarstwa | `FarmType` | |

If a Polish term appears that is NOT in this glossary: STOP, propose a translation, wait for approval, then add it to the glossary before using it in code.

**Order of migration (do not skip steps):**
1. Rename C# identifiers in code (classes, properties, methods) — keep table/column mappings to Polish names via attributes
2. Rename REST route + controller class for the migrated entity (e.g. `[Route("api/zwierzeta")]` → `[Route("api/animals")]`, `ZwierzetaController` → `AnimalsController`)
3. Update all references (controllers, DbContext, migrations folder stays untouched)
4. Verify with `dotnet build` — no errors, no warnings
5. LATER, as a separate task with approval: DB schema migration (new EF migration renaming tables/columns)
6. JSON property names stay deferred — keep wire format stable via `[JsonPropertyName("stare_pole")]` on English-named properties