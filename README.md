# Online Voting System

This repository contains a full-stack Online Voting System.

## Structure

- `backend/`: Django backend with Django REST Framework, JWT authentication, PostgreSQL/SQLite support, and admin APIs.
- `frontend/`: React frontend with Tailwind CSS, Framer Motion animations, react-i18next internationalization, and toast notifications.

## Backend Setup

1. Open a terminal in `backend/`.
2. Create a Python virtual environment and activate it.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Create an admin user:
   ```bash
   python manage.py createsuperuser
   ```
6. Start the backend server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://127.0.0.1:8000/api/`.

## Frontend Setup

1. Open a terminal in `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

The frontend will run at `http://localhost:3000/`.

## Features

- JWT authentication with register and login.
- Protected voting endpoints and one-vote-per-election enforcement.
- Modern glassmorphism UI with Tailwind CSS and Framer Motion.
- Dark / light theme toggle with localStorage persistence.
- Multi-language support for English, Hindi, and Kannada.
- Search and filter support in elections and candidates.
- Django admin plus a custom React admin dashboard for creating elections and candidates.
- Suspicious vote detection and logging for duplicate or rapid vote attempts.

## Notes

- The backend uses SQLite by default for local development.
- If you want PostgreSQL, update `backend/backend/settings.py` and install `psycopg2-binary`.
- Make sure CORS is enabled for the frontend.
