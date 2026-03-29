# Crop Insight Hub

A full-stack agricultural intelligence platform that uses satellite imagery, NDVI analysis, and machine learning to predict crop yields. Built with a React + Vite frontend and a Python Flask backend.

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn-ui, Supabase Auth
- Backend: Python, Flask, Scikit-learn, TensorFlow, NumPy, Pandas, Google Earth Engine API
- Database: Supabase (PostgreSQL)

## Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev` (runs on port 5173 by default)

## Backend Setup
1. Navigate to the `crop vision backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the Python backend: `python app.py`

## Environment Variables
The application requires the following environment variables to be set in your backend `.env` file (refer to `.env.example`):
- `OPENWEATHER_API_KEY`: API key for OpenWeather data.
- `GOOGLE_API_KEY`: Gemini / Google API Key.
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key.
- `SUPABASE_JWT_SECRET`: You Supabase JWT secret for decoding user sessions.

## Team
- G. Dinesh (Y22CSE279036)
- A. Siva Krishna (Y22CSE279003)
- J. Kiran Sai (L23CSE279006)
- **Guide**: Mr. M. Sai Somayajulu
