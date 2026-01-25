# Deployment Guide for PO Tool

## Option 1: Docker (Recommended for Self-Hosting)
This project includes a multi-stage `Dockerfile` and `nginx.conf` optimized for production.

### Build and Run
```bash
docker build -t potool .
docker run -p 8080:80 potool
```
The app will be available at `http://localhost:8080`.

## Option 2: Pre-built Distribution
If you need just the static files:
1. The `dist.zip` file in this directory contains the production build.
2. Unzip it and upload the contents of `dist/` to any static file host (e.g., Apache, Nginx, S3 bucket).
3. **Important:** Ensure your server is configured to rewrite all 404 errors to `index.html` (for React Router support).

## Option 3: Netlify / Vercel
Connect your Git repository to Netlify or Vercel.
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- No extra configuration is usually needed as they auto-detect Vite.

## Environment Variables
Ensure the following variables are set in your production environment (see `.env` for reference):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
