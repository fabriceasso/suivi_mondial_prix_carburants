Guide de déploiement via Git → Vercel

1) Créer un dépôt Git (si ce n'est pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit"
# créer le repo sur GitHub puis ajouter le remote
git remote add origin git@github.com:VOTRE_COMPTE/VOTRE_REPO.git
git push -u origin main
```

2) Frontend (Next.js)

- Connectez le repo sur le dashboard Vercel: "New Project" → importer depuis GitHub.
- Vercel détecte automatiquement Next.js. Vérifiez que la commande de build est `npm run build` et le répertoire de sortie est `.`.
- Dans les Settings du projet (Environment Variables), ajoutez :
  - `NEXT_PUBLIC_API_URL` = l'URL publique de votre backend (ex: `https://my-backend.example.com`)

3) Backend (options)

- IMPORTANT: le backend utilise SQLite (`backend/fuel_prices.db`) et un cron interne. Les plateformes serverless (Vercel) ne conservent pas le système de fichiers entre déploiements et ne supportent pas de tâches longues/cron.

Options recommandées pour le backend :

- Déployer sur une plateforme de type "server" avec persistance (Railway, Render, Fly.io, VPS). Ces services acceptent `npm start` et gardent les fichiers persistants.

- Exemple rapide (Render/Railway) :
  1. Créez un nouveau service, connectez le repo GitHub, sélectionnez le dossier `backend/`.
  2. Commande de build: laissez vide si pas besoin; Commande de démarrage: `npm start`.
  3. Variables d'environnement: `FRONTEND_URL` = URL Vercel (ex: `https://votre-frontend.vercel.app`).

4) CORS et variables d'environnement

- Le backend lit `FRONTEND_URL` pour autoriser les requêtes CORS.
- Le frontend lit `NEXT_PUBLIC_API_URL` pour contacter l'API.

5) Dépannage rapide

- Si le frontend renvoie des erreurs 404 sur `/api/*`, vérifiez que `NEXT_PUBLIC_API_URL` pointe bien vers l'API et que l'API est accessible publiquement.
- Si vous voulez un déploiement tout-en-un (backend + frontend), préférez une VM/VPS ou une plateforme qui supporte les services persistants.
