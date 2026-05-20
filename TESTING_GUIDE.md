# 🧪 Guide de Test - Intégration FlowPilot

## Avant de Commencer

✅ Backend FlowPilot en cours d'exécution sur `http://127.0.0.1:8000`
✅ App mobile configurée avec `.env`
✅ Dépendances installées (`npm install`)

## Préparation

### 1. Vérifier le Backend

```bash
# Terminal 1 - Backend
cd C:\Users\kheli\OneDrive\Bureau\FlowPilot\plateforme-back

# Activer l'environnement virtuel (si nécessaire)
.venv\Scripts\activate

# Démarrer le backend
python -m uvicorn main:app --reload

# Devrait afficher:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Démarrer l'App Mobile

```bash
# Terminal 2 - App Mobile
cd C:\Users\kheli\OneDrive\Bureau\mobile-app

npm start

# Puis sélectionner:
# i - iOS Simulator
# a - Android Emulator
# w - Web Browser (recommandé pour debugging)
```

## Tests Fonctionnels

### Test 1: Login ✅

**Endpoint**: `POST /auth/login`

**Préparation:**

1. Créer un utilisateur dans le backend (via DB ou admin panel)
   - Email: `test@example.com`
   - Mot de passe: `password123`
   - Rôle: Développeur

**Test:**

1. Ouvrir l'app
2. Naviguer vers l'écran Login
3. Entrer l'email et le mot de passe
4. Cliquer sur "Se connecter"

**Résultats Attendus:**

- ✅ Pas d'erreur
- ✅ Navigation vers (tabs) réussie
- ✅ Token sauvegardé dans AsyncStorage
- ✅ User affiché dans (tabs)

**Vérification:**

```javascript
// Dans les logs console (Web)
[DEBUG] Login response: { access_token: "...", user_id: 1, nom: "..." }
[DEBUG] Token saved: Bearer ...
```

**Si ça échoue:**

```bash
# Vérifier le backend
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# Doit retourner:
# {"access_token":"...", "user_id":1, ...}
```

---

### Test 2: Register ✅

**Endpoint**: `POST /auth/register`

**Préparation:**

- Aucune (créer un nouvel email à chaque fois)

**Test:**

1. Naviguer vers RegisterScreen (depuis LoginScreen)
2. Remplir:
   - Nom: "Test User"
   - Email: `newuser-{timestamp}@example.com`
   - Téléphone: "+33612345678"
   - Rôle: "Testeur QA"
   - Mot de passe: "password123"
   - Confirmer: "password123"
3. Cliquer sur "Créer mon compte"

**Résultats Attendus:**

- ✅ Inscription réussie
- ✅ Auto-login après inscription
- ✅ Navigation vers (tabs)
- ✅ Rôle "Testeur QA" sauvegardé

**Vérification:**

```bash
# Vérifier en base de données FlowPilot
# User devrait exister avec:
# - email: newuser-...@example.com
# - nom: Test User
# - role_id: 3 (TESTEUR_QA)
```

**Si ça échoue:**

```bash
# Tester l'endpoint directement
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "motDePasse": "password123",
    "telephone": "+33612345678",
    "role_id": 3
  }'
```

---

### Test 3: Forgot Password ✅

**Endpoint**: `POST /auth/request-reset-password`

**Préparation:**

- Avoir un email valide dans le système

**Test:**

1. Sur LoginScreen, cliquer "Mot de passe oublié?"
2. Entrer email: `test@example.com`
3. Cliquer "Envoyer le lien"

**Résultats Attendus:**

- ✅ Message: "Email envoyé avec succès"
- ✅ Affichage de l'écran de confirmation
- ✅ Email reçu (vérifier inbox: contact.FlowPilot1@gmail.com)

**Vérification:**

```bash
# Vérifier les logs du backend
# Devrait avoir:
# [INFO] Email sent to: test@example.com
```

**Note:** L'email est envoyé via SMTP Gmail du backend FlowPilot

- Email: contact.FlowPilot1@gmail.com
- Vérifier le spam si non reçu

---

### Test 4: Reset Password ✅

**Endpoint**: `POST /auth/reset-password`

**Préparation:**

- Recevoir l'email de reset password
- Extraire le token du lien

**Test:**

1. Depuis l'écran de reset password
2. Entrer le nouveau mot de passe: `newpassword123`
3. Cliquer "Réinitialiser"

**Résultats Attendus:**

- ✅ Message: "Mot de passe réinitialisé"
- ✅ Redirection vers Login
- ✅ Peut se connecter avec le nouveau mot de passe

**Vérification:**

```bash
# Tester le login avec le nouveau mot de passe
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=newpassword123"
```

---

### Test 5: OAuth (Optional) 🔵

**Note:** Nécessite la configuration Google/GitHub OAuth

**Si Non Configuré:**

- Les boutons Google & GitHub n'ont pas d'effet (intentionnel)
- L'intégration OAuth nécessite `expo-auth-session`

**Si Configuré:**

1. Cliquer sur le bouton Google
2. Sélectionner un compte Google
3. Autoriser l'accès
4. Si premier login: SelectRoleScreen
5. Sélectionner un rôle
6. Confirmer

---

## Tests Techniques

### Vérifier le Format des Requêtes

**Login (form-urlencoded):**

```bash
# Doit être en form-urlencoded, PAS JSON
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# ✅ Résultat: { access_token: "...", user_id: 1, ... }

# ❌ JSON ne marche pas:
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123"}'
# Erreur: 422 Unprocessable Entity
```

**Register (JSON):**

```bash
# Doit être en JSON
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "motDePasse": "password123",
    "telephone": "+33612345678",
    "role_id": 2
  }'

# ✅ Résultat: { access_token: "...", user_id: 1, ... }
```

**Token Header:**

```bash
# Les endpoints protégés demandent:
# Authorization: Bearer {token}

curl -X GET http://127.0.0.1:8000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ✅ Résultat: { id: 1, nom: "Test User", email: "...", ... }
```

---

## Tests de Persistance

### 1. Vérifier le Token en AsyncStorage

```javascript
// Dans une cellule React Native:
import AsyncStorage from "@react-native-async-storage/async-storage";

const data = await AsyncStorage.getItem("auth-storage");
console.log(JSON.parse(data));

// Doit afficher:
// {
//   user: { id: "1", fullName: "Test User", ... },
//   token: "eyJ...",
//   isAuthenticated: true
// }
```

### 2. Reload et Vérifier la Persistance

1. Naviguer vers l'écran Login
2. Se connecter
3. **Fermer complètement l'app** (ou recharger R+R)
4. **Rouvrir l'app**
5. **Doit être directement sur l'écran (tabs)** sans refaire login

---

## Tests de Gestion d'Erreur

### Erreur: Email Invalide

**Test:**

```
Email: invalid-email
Mot de passe: password123
```

**Résultat Attendu:**

```
❌ Error message: "Format d'email invalide"
```

---

### Erreur: Email Inexistant

**Test:**

```
Email: nonexistent@example.com
Mot de passe: password123
```

**Résultat Attendu:**

```
❌ Error message: "Email ou mot de passe incorrect"
```

---

### Erreur: Mot de Passe Incorrect

**Test:**

```
Email: test@example.com
Mot de passe: wrongpassword
```

**Résultat Attendu:**

```
❌ Error message: "Email ou mot de passe incorrect"
```

---

### Erreur: Mot de Passe Trop Court

**Test (Register):**

```
Nom: Test User
Email: test@example.com
Mot de passe: 123 (moins de 8 caractères)
```

**Résultat Attendu:**

```
❌ Erreur de validation: "Minimum 8 caractères"
```

---

### Erreur: Backend Non Disponible

**Test:**

1. Arrêter le backend
2. Essayer de se connecter

**Résultat Attendu:**

```
❌ Error message: "Erreur de connexion"
❌ Navigation non effectuée
```

---

## Checklist de Validation

```
LOGIN
- [ ] Email + Password valides → Login réussi
- [ ] Email + Password invalides → Erreur affichée
- [ ] "Mot de passe oublié?" fonctionne
- [ ] Remember me fonctionne (si implémenté)

REGISTER
- [ ] Tous les champs obligatoires
- [ ] Email unique (erreur si existe)
- [ ] Mot de passe 8+ caractères
- [ ] Rôle sélectionnable (4 options)
- [ ] Auto-login après création

FORGOT PASSWORD
- [ ] Email envoyé
- [ ] Confirmation affichée
- [ ] Email reçu
- [ ] Lien de reset valide

RESET PASSWORD
- [ ] Nouveau mot de passe accepté
- [ ] Login avec nouveau mot de passe fonctionne
- [ ] Ancien mot de passe ne fonctionne plus

TOKENS & STORAGE
- [ ] Token stocké dans AsyncStorage
- [ ] Token envoyé dans Authorization header
- [ ] Persistance après reload
- [ ] Logout efface le token

ERROR HANDLING
- [ ] Erreurs API affichées
- [ ] Formulaires validés
- [ ] Loading states affichés
- [ ] Pas de crash lors d'erreur

PERFORMANCE
- [ ] Login rapide (< 2s)
- [ ] Register rapide (< 2s)
- [ ] Navigation fluide
- [ ] Pas de lag lors des transitions
```

---

## Logs & Debugging

### Activer les Logs dans api.ts

```javascript
// Ajouter à la classe AuthApi:
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    console.log('[DEBUG] Login attempt:', credentials.email);
    const response = await this.axiosInstance.post(...);
    console.log('[DEBUG] Login success:', response.data);
    return this.transformFlowPilotResponse(response.data);
  } catch (error) {
    console.error('[ERROR] Login failed:', error);
    throw this.handleError(error);
  }
}
```

### Vérifier les Erreurs CORS

```bash
# Si erreur CORS, vérifier le backend:
# BACKEND doit avoir CORS configuré pour l'URL de l'app

# Dans main.py du backend:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ou spécifier les URLs
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Prochaines Actions Après Tests

✅ **Si tous les tests passent:**

1. Intégrer d'autres endpoints (`/projets`, `/sprints`, etc)
2. Ajouter la biométrie
3. Configurer les notifications
4. Préparer le déploiement

❌ **Si tests échouent:**

1. Vérifier les logs backend
2. Vérifier la configuration .env
3. Vérifier CORS dans le backend
4. Contacter le support FlowPilot

---

**Bonne chance! 🚀**
