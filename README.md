# University Team-Project: Scooter App

This project was developed as part of the *Softwareprojekt* course at the University of Konstanz in a team of five students.  
It is a scooter web app with an interactive map of Konstanz that shows available scooters with specific details and allows users to rent them.


---

## Demo-Video of App 

You can watch the scooter app demo on YouTube: click [here](https://youtu.be/JZ8LH8Orbwo)


## Screenshots of App

<p align="center">
  <img src="app_screenshots/01_login.png"  alt="Anmeldung"                     width="18%">
  <img src="app_screenshots/02_map.png"    alt="Karte-1"                       width="18%">
  <img src="app_screenshots/03_map.png"    alt="Karte-2"                       width="18%">
  <img src="app_screenshots/04_list.png"   alt="Scooter-Liste"                 width="18%">
  <img src="app_screenshots/05_item.png"   alt="Scooter-Detail"                width="18%">
</p>

<p align="center">
  <img src="app_screenshots/06_payment.png"  alt="Zahlung"                     width="18%">
  <img src="app_screenshots/07_booking.png"  alt="Buchung"                     width="18%">
  <img src="app_screenshots/08_overview.png" alt="Scooter-Historie-Übersicht"  width="18%">
  <img src="app_screenshots/09_reviews.png"  alt="Bewertungen"                 width="18%">
  <img src="app_screenshots/10_settings.png" alt="Einstellungen"               width="18%">
</p>


---

## Table of Contents

This README provides an overview of the project, tech stack & dependencies, setup instructions, how to run the app, and my individual contributions.

1. [Project overview](#project-overview)  
2. [Tech stack](#tech-stack)  
3. [Setup to run the app](#setup-to-run-the-app)  
4. [How to run the app](#how-to-run-the-app)  
5. [My contributions](#my-contributions)


---

## Tech stack

**Language**

- **TypeScript** 

**Frontend**

- **Angular** (main frontend framework)
- **PrimeNG** (UI components)
- **Leaflet** (interactive map with OpenStreetMap)

**Backend**

- **Node.js** (TypeScript/JavaScript runtime enviroment for the server)
- **Express** (Node.js REST API framework for routing and middleware)
- **Sequelize** (TypeScript ORM for PostgreSQL database)

**Database**

- **PostgreSQL** (running in a **Docker** container for local development)


---

## Requirements to run the app

To run the app locally you need to install the following tools:

- **Node.js** ≥ 18 ([Download](https://nodejs.org/en/download))<br>
  Includes **npm** (Node package manager)  
- **Docker Desktop** including Docker Compose ([Download](https://docs.docker.com/desktop/))

All project dependencies (TypeScript, Angular, PrimeNG, Leaflet, Express, Sequelize)  
are installed via `npm install` in the `frontend` and `backend` folders.<Br>
The PostgreSQL database runs in a Docker container (via Docker Compose).

These dependencies are defined in:

- `frontend/package.json` – frontend packages (TypeScript, Angular, PrimeNG, Leaflet)  
- `backend/package.json` – backend packages (TypeScript, Express, Sequelize) 

The database setup is defined in:

- `database/docker-compose.yml` – database setup (PostgreSQL via Docker Compose)