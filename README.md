# Serviceauftragsverwaltung - Glauser AG

Eine webbasierte Anwendung zur Verwaltung von Serviceaufträgen mit vollständigem Workflow von der Erfassung bis zur Verrechnung.

## 🚀 Features

- Rollenbasierte Zugriffskontrolle (Admin, Bereichsleiter, Mitarbeiter)
- Kompletter Auftragsprozess: Erfassen → Disponieren → Ausführen → Freigeben → Verrechnen
- PDF-Auftragsblätter generieren
- Dashboard mit Statistiken
- Filter- und Suchfunktionen
- Responsive Design (Bootstrap 5)

## 🛠️ Technologien

### Frontend
- React 19
- Bootstrap 5
- Axios
- React Router

### Backend
- PHP 8.2
- Supabase (PostgreSQL)
- TCPDF (PDF-Generierung)
- REST API

## Installation

### Voraussetzungen
- XAMPP (Apache + PHP)
- Node.js & npm
- Supabase Account

### Backend Setup

1. Projekt nach XAMPP kopieren:
im bash
cp -r Projekt /Applications/XAMPP/xamppfiles/htdocs/


2. Supabase Datenbank einrichten:
   - SQL-Dateien in `/database/` in Supabase importieren
   - API Keys in `/api/config/supabase.php` eintragen

3. Composer Dependencies installieren:
im bash
cd Projekt
composer install


### Frontend Setup
im bash
cd frontend
npm install
npm start


App läuft auf: http://localhost:3000

## Test-Zugänge

| Benutzer | Passwort | Rolle |
|----------|----------|-------|
| admin | Test1234! | Administrator |
| mueller.m | Test1234! | Bereichsleiter |
| schmidt.p | Test1234! | Mitarbeiter |

## Workflow

1. **ADMIN:** Neuen Auftrag erfassen
2. **ADMIN/BL:** Auftrag disponieren (Mitarbeiter zuweisen)
3. **MA:** Arbeitsrapport erstellen
4. **BL:** Auftrag zur Verrechnung freigeben
5. **ADMIN:** Auftrag verrechnen
6. **Alle:** PDF-Auftragsblatt herunterladen