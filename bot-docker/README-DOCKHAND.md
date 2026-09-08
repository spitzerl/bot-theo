# 🇫🇷 Guide Déploiement Dockhand - Bot Discord Théo Schneider

Ce guide vous explique pas à pas comment déployer le bot satirique Théo Schneider sur votre VPS via l'interface **Dockhand**.

---

## 📋 Prérequis rapides

1. **Votre Token Discord Bot** :
   - Depuis le [Discord Developer Portal](https://discord.com/developers/applications).
   - Onglet **Bot** : Récupérez le token (**Reset Token**).
   - **TRÈS IMPORTANT** : Cochez **MESSAGE CONTENT INTENT** dans l'onglet Bot (sinon le bot ne recevra pas les messages quand on le mentionne ou lui répond).
2. **Votre Clé API Gemini** :
   - Gratuite sur [Google AI Studio](https://aistudio.google.com/app/apikey).
3. **Dockhand** installé et accessible sur votre VPS.

---

## 🌐 Intégration Nginx Proxy Manager (Réseau Docker `proxy`)

Le fichier `docker-compose.yml` est préconfiguré pour rejoindre votre réseau Docker externe `proxy` utilisé par Nginx Proxy Manager :

```yaml
networks:
  proxy:
    external: true
```

### 1. Vérifier l'existence du réseau `proxy` sur votre VPS
Si ce n'est pas déjà fait pour Nginx Proxy Manager, le réseau doit exister :
```bash
docker network inspect proxy >/dev/null 2>&1 || docker network create proxy
```

### 2. (Optionnel) Créer un Proxy Host dans Nginx Proxy Manager
Le bot intègre un mini serveur HTTP de diagnostic sur le port **3000** (endpoints `/` et `/health`).
Si vous souhaitez exposer une page d'état avec certificat SSL (ex : `theo.mondomaine.com`) :
1. Dans l'interface **Nginx Proxy Manager**, allez dans **Hosts** > **Proxy Hosts** > **Add Proxy Host**.
2. Renseignez :
   - **Domain Names** : `theo-bot.votredomaine.fr` (ou sous-domaine de votre choix)
   - **Scheme** : `http`
   - **Forward Hostname / IP** : `theo-schneider-bot` *(le nom exact du conteneur)*
   - **Forward Port** : `3000`
   - Cochez **Block Common Exploits** et **Websockets Support**.
3. Dans l'onglet **SSL** : demandez un certificat Let's Encrypt gratuit avec renouvellement automatique.
4. En accédant à `https://theo-bot.votredomaine.fr/health`, vous obtiendrez l'état en direct du bot, de la latence Discord et de la connexion Gemini !

---

## 🚀 Méthode : Déploiement via Stack / Compose dans Dockhand (Recommandé)

### Étape 1 : Préparer le dossier sur votre VPS
Connectez-vous en SSH à votre VPS et créez le dossier du bot :

```bash
mkdir -p /opt/dockhand-stacks/theo-bot
cd /opt/dockhand-stacks/theo-bot
```

Placez-y les 3 fichiers fournis dans ce dossier :
- `bot.js`
- `package.json`
- `Dockerfile`
- `docker-compose.yml`

*(Astuce : Vous pouvez aussi simplement cloner le dépôt ou copier-coller les fichiers via le terminal ou le gestionnaire de fichiers de votre VPS).*

### Étape 2 : Configurer la Stack dans Dockhand
1. Ouvrez votre interface web **Dockhand** (`http://votre-ip-vps:port`).
2. Allez dans le menu **Stacks** (ou **Compose**).
3. Cliquez sur **+ Add Stack** (ou **New Stack**).
4. Nommez votre stack : `theo-schneider-bot`.
5. Dans l'éditeur YAML, collez le contenu de `docker-compose.yml`.
6. Dans la section **Environment (.env)** de Dockhand, ajoutez :
   ```env
   DISCORD_BOT_TOKEN=votre_token_secret_discord
   GEMINI_API_KEY=votre_cle_gemini
   ```
7. Cliquez sur **Deploy Stack** (ou **Save and Up**).

---

## 🔍 Vérification dans Dockhand

1. Allez dans le menu **Containers** de Dockhand.
2. Repérez le conteneur nommé `theo-schneider-bot` (statut vert *Running*).
3. Cliquez sur l'icône **Logs** 📜.
4. Vous devriez voir les logs de démarrage :
   ```text
   =========================================================
   🇫🇷 Théo Schneider est en ligne en tant que Théo Schneider#1234 !
   🛥️ Connecté depuis Dubaï sur X serveur(s) Discord.
   💎 Prêt à vendre la formation à 997€ aux patriotes !
   =========================================================
   ```

---

## 🎯 Comment tester sur Discord

1. Mentionnez le bot dans n'importe quel salon :
   > `@Théo Schneider tu penses quoi du redressement de la France ?`
2. Ou répondez directement (fonction *Répondre* / *Reply* de Discord) à l'un de ses messages :
   > `Et pour tes 14 Bugatti, tu paies la vignette Crit'Air ?`

Théo répondra instantanément avec son bagou de millionnaire d'exil fiscal et tentera de vous vendre son Académie Empire Souverain à 997 € ! 🦁🇫🇷
