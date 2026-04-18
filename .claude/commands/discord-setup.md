# Discord Server Setup

Reorganise le serveur Discord AnDy au propre via le bot Dev.

## Ce que fait cette commande

1. Lit la structure définie dans `bot/setup-server.js`
2. Supprime tous les channels/catégories existants
3. Recrée tout proprement (catégories + channels + topics)
4. Poste et épingle le guide dans `#guide`
5. Redémarre les bots sur le VPS

## Structure créée

```
🏠 Accueil       → #bienvenue, #guide, #annonces
🤖 AnDy          → #chat, #tâches, #mémoire
📊 Marchés       → #crypto, #trading, #signaux, #actus
🏗️ Trackr        → #déploiements, #bugs, #idées
📡 Statut        → #live, #logs
🔐 Admin         → #admin
```

## Instructions

Pour modifier la structure : édite `bot/setup-server.js`, section `STRUCTURE`.
Pour modifier le guide : édite la fonction `buildGuide()` dans `bot/setup-server.js`.

Puis relance `/discord-setup` ou sur le VPS :

```bash
cd /root/trackr && git pull origin main && node bot/setup-server.js && pm2 restart andy-dev-bot discord-bot
```

## Quand utiliser

- Nouveau serveur Discord à configurer
- Réorganisation complète des channels
- Après ajout de nouveaux bots (Finance, Actions…)
- Si les channels sont dans le désordre
