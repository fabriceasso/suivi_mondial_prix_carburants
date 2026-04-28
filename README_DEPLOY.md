# Suivi mondial - dépôt

Ce dépôt contient deux dossiers principaux : `frontend/` (Next.js) et `backend/` (Express + SQLite).

Pour préparer le déploiement Git→Vercel :

- Assurez-vous que `frontend/.vercelignore` ou `frontend/vercel.json` existe (déjà ajouté).
- Déployez le `backend/` sur une plateforme persistante (Render, Railway, Fly.io) et définissez `FRONTEND_URL` vers l'URL Vercel.
- Définissez `NEXT_PUBLIC_API_URL` dans les variables d'environnement Vercel.

Voir `DEPLOYMENT_GIT_VERCEL.md` pour le guide complet.
