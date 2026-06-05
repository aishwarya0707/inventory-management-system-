# 📦 Inventory Management System

A full-stack, containerized Inventory Management System designed to track, add, and manage inventory items via a responsive dashboard. 

## 🚀 Live Deployments

* **Frontend (Vercel):** [Live Dashboard](https://inventory-management-system-7za644inj-aishwarya0707s-projects.vercel.app/dashboard)
* **Backend API (Render):** [Live API](https://inventory-management-system-azag.onrender.com)
* **Docker Hub Repository:** [aishwarya3431/inventory-backend](https://hub.docker.com/r/aishwarya3431/inventory-backend)

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Axios
* **Backend:** Python, Flask, Flask-CORS, SQLAlchemy
* **Database:** PostgreSQL
* **Containerization:** Docker, Gunicorn
* **Hosting:** Vercel (Frontend), Render (Backend & Database)

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your respective `.env` files or hosting provider settings:

**Frontend (`.env.production` or Vercel Settings):**
`VITE_API_URL` - Points to the live Render backend URL.

**Backend (`.env` or Render Settings / Docker Run):**
`DATABASE_URL` - Your PostgreSQL connection string.

## 💻 How to Run Locally

### 1. Running the Backend via Docker
The backend is fully containerized. To run the API locally, you must provide a valid PostgreSQL database connection string.

Ensure Docker is running, then execute:
```bash
docker run -p 5000:5000 -e DATABASE_URL="<YOUR_POSTGRES_CONNECTION_STRING>" aishwarya3431/inventory-backend
