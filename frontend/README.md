# Inwentarz w Gospodarstwie — Frontend

System zarzadzania inwentarzem zywym w gospodarstwie rolnym.
Aplikacja frontendowa zbudowana w React, komunikujaca sie z backendem .NET MVC.

## Opis projektu

Aplikacja umozliwia zarzadzanie ewidencja zwierzat, karmien i zabiegow weterynaryjnych
w gospodarstwie rolnym. System obsluguje trzy role uzytkownikow:

- **Wlasciciel** — zarzadzanie zwierzetami, karmieniami i zabiegami
- **Lekarz weterynarii** — przegladanie bazy zwierzat i zarzadzanie zabiegami
- **Administrator** — zarzadzanie uzytkownikami i profilami

## Uzyte technologie

- **React 19** — biblioteka UI
- **Vite** — bundler i serwer deweloperski
- **React Router v6** — routing SPA
- **Zustand** — zarzadzanie stanem globalnym
- **Axios** — komunikacja HTTP z API
- **React Hook Form + Zod** — formularze z walidacja
- **CSS Modules** — izolowane style per komponent
- **ESLint + Prettier** — linting i formatowanie kodu
- **Google Analytics 4** — analityka (react-ga4)
- **Sentry** — monitorowanie bledow (@sentry/react)

## Wymagania

- Node.js 18+
- npm 9+

## Instalacja i uruchomienie

```bash
# Klonowanie repozytorium
git clone <adres-repozytorium>
cd inwentarz-gospodarstwo

# Instalacja zaleznosci
npm install

# Konfiguracja zmiennych srodowiskowych
cp .env.example .env
# Uzupelnij wartosci w pliku .env

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja bedzie dostepna pod adresem: http://localhost:5173

## Dostepne skrypty

| Skrypt | Opis |
|--------|------|
| `npm run dev` | Uruchomienie serwera deweloperskiego |
| `npm run build` | Budowanie wersji produkcyjnej |
| `npm run preview` | Podglad wersji produkcyjnej |
| `npm run lint` | Sprawdzenie kodu przez ESLint |
| `npm run format` | Formatowanie kodu przez Prettier |

## Struktura projektu

```
src/
  components/        # Komponenty wielokrotnego uzyku
    common/          # Przyciski, loader, alerty, modal
    layout/          # Sidebar, Header, MainLayout
  hooks/             # Hooki React (np. sledzenie analityki)
  pages/             # Widoki poszczegolnych stron
    auth/            # Logowanie i rejestracja
    zwierzeta/       # CRUD zwierzat
    karmienia/       # Ewidencja karmien
    zabiegi/         # Zabiegi weterynaryjne
    profil/          # Edycja profilu uzytkownika
  services/          # Warstwa komunikacji z API (Axios)
  stores/            # Store'y Zustand (stan globalny)
  styles/            # Globalne style CSS
  utils/             # Funkcje pomocnicze
```

## Konfiguracja backendu

Aplikacja frontendowa komunikuje sie z backendem .NET MVC.
Adres API konfiguruje sie w pliku `.env` przez zmienna `VITE_API_URL`.

## Deployment

Aplikacja jest wdrozona na platformie Vercel.
Link do wersji produkcyjnej: [uzupelnic po wdrozeniu]

## Autorzy

Projekt semestralny — PANS Krosno, Technologie Frontendowe
