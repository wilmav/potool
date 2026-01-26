## Option 1: Cloudflare Pages (Recommended)
The easiest way to deploy this project is via Cloudflare Pages with GitHub integration.

### Steps:
1.  **Dashboard:** Log in to [Cloudflare](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2.  **Create:** Click **Create** → **Pages** → **Connect to Git**.
3.  **Repository:** Select your GitHub repository.
4.  **Build Settings:**
    *   **Framework preset:** Vite (if available) or None.
    *   **Build command:** `npm run build`
    *   **Build output directory:** `dist`
    *   **Deploy command:** (Jätä tyhjäksi / Leave empty)
5.  **Environment Variables:** Add your `.env` variables (e.g., `VITE_SUPABASE_URL`) under **Settings** → **Functions** → **Environment variables**.
6.  **Deploy:** Click **Save and Deploy**. Cloudflare will now automatically deploy every commit you push to GitHub!

## Option 2: Docker (Self-Hosting)
This project includes a multi-stage `Dockerfile` and `nginx.conf` optimized for production.

### Build and Run
```bash
docker build -t potool .
docker run -p 8080:80 potool
```
The app will be available at `http://localhost:8080`.

## Option 3: Other Static Hosting (Netlify, Vercel, S3)
Connect your Git repository or upload the `dist` folder.
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Manual Upload:** The `dist.zip` file in this directory contains a pre-built production version.

## Environment Variables
Ensure the following variables are set in your production environment (see `.env` for reference):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
