# Déploiement du backend (Express + SQLite)

Ce document décrit deux options recommandées pour déployer le dossier `backend/` : Render ou Railway. Le backend utilise SQLite — pour la persistance, choisissez un service qui propose un disque persistant ou montez un volume Docker.

Pré-requis
- Un repo Git (déjà créé et poussé).
- Variables d'environnement à définir :
  - `FRONTEND_URL` : URL publique du frontend (ex: https://suivimondialprixcarburants.vercel.app)
  - `DB_PATH` (optionnel) : chemin vers le fichier SQLite (ex: `/data/fuel_prices.db`). Par défaut le service utilisera `/data/fuel_prices.db` dans le Dockerfile.

Option A — Render (recommandé pour persistance simple)

1. Créez un nouveau service web sur Render.
2. Sélectionnez le repo et le dossier `backend/`.
3. Build Command : laissez vide si vous utilisez le `Dockerfile`, sinon `npm install`.
4. Start Command : `node server.js` (ou utilisez Dockerfile pour build automatique).
5. Assignez un disque persistant (Mount Path `/data`) et définissez `DB_PATH=/data/fuel_prices.db` dans les environment variables du service.
6. Ajoutez `FRONTEND_URL` avec l'URL Vercel.

Option B — Railway

1. Créez un nouveau service sur Railway et connectez-le au repo.
2. Choisissez `Dockerfile` as deployment method, ou définissez `Start Command`: `node server.js`.
3. Pour la persistance, utilisez Railway Persistent Storage (si disponible) et montez-le sur `/data`. Définissez `DB_PATH=/data/fuel_prices.db`.
4. Définissez `FRONTEND_URL` dans les variables d'env.

Option C — Docker/VPS

1. Build localement :

```bash
docker build -t suivi-backend:latest -f backend/Dockerfile .
docker run -d -p 3001:3001 -v $(pwd)/data:/data -e DB_PATH=/data/fuel_prices.db -e FRONTEND_URL=https://suivimondialprixcarburants.vercel.app suivi-backend:latest
```

Vérification
- Après déploiement, vérifiez : `GET https://YOUR_BACKEND_URL/api/health` doit renvoyer `status: ok`.

Notes
- Le fichier SQLite doit résider sur un volume persistant (`/data`) sinon les données seront perdues entre déploiements.
- Le service expose le port `3001` par défaut.
