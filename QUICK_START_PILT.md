# 🚀 Démarrage Rapide - FlowPilot Integration

## ⏱️ 5 Minutes pour Commencer

### Étape 1: Démarrer le Backend FlowPilot (2 min)

```bash
cd C:\Users\kheli\OneDrive\Bureau\FlowPilot\plateforme-back

# Activer l'environnement virtuel
.venv\Scripts\activate

# Démarrer le serveur
python -m uvicorn main:app --reload

# ✅ Vous devriez voir:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Étape 2: Vérifier la Configuration (.env)

```bash
# Ouvrir le fichier .env
cat C:\Users\kheli\OneDrive\Bureau\mobile-app\.env

# Vérifier que vous avez:
# EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Étape 3: Démarrer l'App Mobile (2 min)

```bash
cd C:\Users\kheli\OneDrive\Bureau\mobile-app

# Installe les dépendances (une fois seulement)
npm install

# Démarrer le développement
npm start

# Choisir une option:
# w - Web Browser (recommandé pour debugging)
# i - iOS Simulator (si sur Mac)
# a - Android Emulator
```

### Étape 4: Tester la Connexion (1 min)

1. **Ouvrir l'app dans le navigateur**
   - L'app devrait charger après ~5-10 secondes
2. **Aller à l'écran Login**
   - Utiliser le compte test du backend:
     ```
     Email: admin@example.com
     Mot de passe: (à obtenir du backend)
     ```

3. **Se Connecter**
   - Si ça marche → 🎉 **C'est prêt!**
   - Si erreur → Voir [Troubleshooting](#-troubleshooting)

---

## 📁 Structure du Projet

```
mobile-app/
├── src/features/auth/
│   ├── api.ts              ← Intégration FlowPilot ✅
│   ├── store.ts            ← État global
│   ├── hooks.ts            ← Custom hooks
│   └── screens/            ← 4 écrans auth
│
├── .env                    ← Configuration
├── .env.example            ← Template
└── FlowPilot_INTEGRATION.md     ← Doc technique
```

---

## 🧪 Test Rapide

### Créer un Utilisateur

```bash
# Terminal séparé avec curl
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "motDePasse": "password123",
    "telephone": "+33612345678",
    "role_id": 2
  }'

# Réponse attendue:
# { "access_token": "...", "user_id": 1, ... }
```

### Tester Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# Réponse attendue:
# { "access_token": "...", "user_id": 1, ... }
```

---

## 🐛 Troubleshooting

### ❌ "Network Error" au Login

**Cause:** Backend non démarré ou URL incorrecte

**Solution:**

```bash
# 1. Vérifier que le backend tourne
curl http://127.0.0.1:8000/docs

# 2. Vérifier .env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000

# 3. Redémarrer l'app
# Appuyer sur R+R dans le terminal npm start
```

### ❌ "Email ou mot de passe incorrect"

**Cause:** Utilisateur n'existe pas dans le backend

**Solution:**

```bash
# Créer un utilisateur:
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "email": "test@example.com",
    "motDePasse": "password123",
    "role_id": 2
  }'
```

### ❌ "CORS Error"

**Cause:** Backend n'accepte pas les requêtes de l'app

**Solution:** Vérifier que le backend a CORS configuré (normalement ok dans FlowPilot)

### ❌ "Invalid Content-Type"

**Cause:** Format de requête incorrect

**Solution:** ✅ Déjà fixé dans api.ts

### ❌ App Crash

**Solution:**

```bash
# Arrêter npm start (Ctrl+C)
# Effacer le cache
npm start
# Appuyer sur R+R
```

---

## 📚 Documentation Complète

- **[FlowPilot_INTEGRATION.md](./FlowPilot_INTEGRATION.md)** - Guide technique détaillé
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Tests fonctionnels
- **[AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)** - Architecture système
- **[SETUP.md](./SETUP.md)** - Configuration complète
- **[README_AUTH.md](./README_AUTH.md)** - Guide de démarrage

---

## ⚡ Commandes Utiles

```bash
# Démarrer l'app
npm start

# Démarrer avec cache cleané
npm start --reset-cache

# Tests (si configurés)
npm test

# Build production (iOS)
eas build --platform ios

# Build production (Android)
eas build --platform android

# Lancer l'émulateur iOS
npm run ios

# Lancer l'émulateur Android
npm run android
```

---

## ✅ Checklist Avant de Commencer

- [ ] Backend FlowPilot démarré (http://127.0.0.1:8000)
- [ ] `.env` configuré avec `EXPO_PUBLIC_API_URL`
- [ ] `npm install` exécuté
- [ ] `npm start` fonctionne
- [ ] App ouverte dans navigateur/émulateur
- [ ] Écran Login affiche correctement

---

## 🎯 Prochain Objectif

**Intégrer un autre endpoint FlowPilot** (ex: `/projets`)

```javascript
// Dans src/features/api.ts (nouveau fichier)
export const projectsApi = {
  async getProjects(token: string) {
    return axios.get('/projets', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

---

## 💡 Tips & Tricks

**Web Browser Debugging:**

- Ouvrir DevTools (F12)
- Aller à Network tab
- Voir les requêtes API en direct
- Vérifier les réponses JSON

**Hot Reload:**

- Appuyer sur R+R dans le terminal npm start
- L'app recharge sans perdre l'état

**Émoji Rapide:**

- 🟢 = Succès
- 🔴 = Erreur
- 🟡 = Attention
- 🔵 = Info

---

**Vous êtes maintenant prêt! 🎉**

Ouvrez [FlowPilot_INTEGRATION.md](./FlowPilot_INTEGRATION.md) pour plus de détails techniques.
