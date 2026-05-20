# 🔗 Intégration FlowPilot - Guide Technique

## Configuration Complétée ✅

L'application mobile est maintenant **connectée au backend FlowPilot**.

### URL Backend

```
http://127.0.0.1:8000  (Développement)
```

## Différences Importantes

### 1. Format des Requêtes

#### Login

**FlowPilot utilise OAuth2PasswordRequestForm (form-urlencoded)**

```javascript
// Incorrect (JSON):
POST /auth/login
{ "email": "user@example.com", "password": "123456" }

// Correct (form-urlencoded):
POST /auth/login
Content-Type: application/x-www-form-urlencoded
username=user@example.com&password=password123
```

✅ **Adapté**: Le fichier `api.ts` convertit automatiquement.

#### Register

**FlowPilot utilise des noms en français**

```json
{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "motDePasse": "password123",
  "telephone": "+33612345678",
  "role_id": 2
}
```

Mapping des rôles:

- 2 = Développeur
- 3 = Testeur QA
- 4 = Product Owner
- 5 = Scrum Master

✅ **Adapté**: Le fichier `api.ts` convertit automatiquement.

### 2. Format des Réponses

**FlowPilot retourne**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 42,
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "role": {
    "id": 2,
    "nom": "Développeur",
    "code": "DEVELOPPEUR",
    "niveau_acces": 1
  }
}
```

**L'app reçoit**:

```json
{
  "user": {
    "id": "42",
    "email": "jean@example.com",
    "fullName": "Jean Dupont",
    "phoneNumber": "",
    "role": "Développeur",
    "createdAt": "2026-04-23T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": ""
}
```

✅ **Adapté**: La méthode `transformFlowPilotResponse()` convertit automatiquement.

### 3. Endpoints Disponibles

```
POST   /auth/login                      Login
POST   /auth/register                   Register
POST   /auth/request-reset-password     Forgot Password
POST   /auth/reset-password             Reset Password
POST   /auth/select-role                Select Role (OAuth)
GET    /auth/oauth/{provider}/login     OAuth Login
GET    /auth/oauth/{provider}/callback  OAuth Callback
GET    /auth/me                         Get Current User
```

### 4. Tokens

**FlowPilot utilise JWT avec durée de vie de 30 minutes**

```
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Pas de refresh token implémenté dans le backend**

- ✅ Token stocké dans AsyncStorage
- ✅ Token envoyé dans Authorization header: `Bearer {token}`
- ⚠️ Session expire après 30 minutes d'inactivité
- ⚠️ Pas de refresh automatique (l'utilisateur doit se reconnecter)

## Fichiers Modifiés

### ✅ `src/features/auth/api.ts` (200 lignes)

**Changements:**

- Format login: OAuth2PasswordRequestForm (form-urlencoded)
- Format register: Noms français + role_id
- Transformation des réponses FlowPilot → App format
- Conversion automatique des rôles (string ↔ number)
- Endpoints: request-reset-password au lieu de forgot-password
- Removed: refreshToken() (FlowPilot n'utilise pas)

### ✅ `src/types/auth.ts` (80 lignes)

**Ajout:**

- `FlowPilotAuthResponse`: Response format du backend
- `FlowPilotRegisterRequest`: Request format register
- `FlowPilotTokenRole`: Role object du backend
- `FlowPilotSelectRoleRequest`: Select role request format
- `MessageResponse`: Response générique (message)

### ✅ `.env` (20 lignes)

**Changements:**

- `EXPO_PUBLIC_API_URL=http://127.0.0.1:8000`
- Ajout des client IDs Google & GitHub (du backend FlowPilot)
- Commentaires informatifs

### ✅ `.env.example` (NEW)

**Ajout:** Template d'environnement documenté

## Flows d'Authentification

### 1️⃣ Login

```
App → POST /auth/login (form-urlencoded)
  username: user@example.com
  password: password123

Backend → 200 OK
{
  access_token: "...",
  user_id: 42,
  nom: "Jean Dupont",
  email: "jean@example.com",
  role: { id: 2, code: "DEVELOPPEUR", ... }
}

App transforms → AuthResponse
  token: "..."
  user: { fullName: "Jean Dupont", role: "Développeur", ... }

✅ Set token in header
✅ Save in AsyncStorage
✅ Navigate to (tabs)
```

### 2️⃣ Register

```
App → POST /auth/register (JSON)
{
  nom: "Jean Dupont",
  email: "jean@example.com",
  motDePasse: "password123",
  telephone: "+33612345678",
  role_id: 2
}

Backend → 201 CREATED
{ access_token, user_id, ... }

App transforms → AuthResponse
✅ Auto-login after registration
✅ Navigate to (tabs)
```

### 3️⃣ Forgot Password

```
App → POST /auth/request-reset-password
{ email: "user@example.com" }

Backend → 200 OK
{ message: "Email de réinitialisation envoyé" }

FlowPilot sends email with reset link
User clicks link → app receives token
```

### 4️⃣ Reset Password

```
App → POST /auth/reset-password
{
  token: "...",
  new_password: "newpassword123"
}

Backend → 200 OK
{ message: "Mot de passe réinitialisé" }

✅ User can now login
```

### 5️⃣ Select Role (OAuth)

```
OAuth callback triggers /auth/oauth/{provider}/callback

Backend:
1. Fetch user profile from Google/GitHub
2. Check if user exists
   - YES: Login
   - NO: Create user (no role) → return token
3. If no role: Return special response

Frontend:
✅ If response has role → Navigate to (tabs)
⚠️ If no role → Navigate to select-role screen

User selects role:
App → POST /auth/select-role
{
  user_id: 42,
  role: 2
}

Backend → Updated token with role
✅ Navigate to (tabs)
```

## Configuration Requise

### Backend FlowPilot

- ✅ URL: http://127.0.0.1:8000
- ✅ Database: PostgreSQL (Neon)
- ✅ OAuth Google configured
- ✅ OAuth GitHub configured
- ✅ Email SMTP configured

### App Mobile

- ✅ API URL configured in .env
- ✅ Type mappings configured
- ✅ Token storage configured
- ✅ Error handling configured

## Prochaines Étapes

### À Faire

1. **Tester Login**

   ```bash
   npm start
   # Utiliser credentiel du backend FlowPilot
   ```

2. **Tester Register**

   ```bash
   # Créer un nouvel utilisateur
   # Vérifier que le rôle est bien sauvegardé
   ```

3. **Tester Password Reset**

   ```bash
   # Demander réinitialisation
   # Vérifier l'email reçu
   ```

4. **Tester OAuth (Optional)**

   ```bash
   # Configurer Google OAuth
   # Configurer GitHub OAuth
   # Tester flow complet
   ```

5. **Intégrer autres endpoints**
   ```bash
   # Ajouter GET /auth/me pour profile
   # Intégrer endpoints métier (/projets, /sprints, etc)
   ```

## Debugging

### Logs Backend

```bash
cd /path/to/backend
tail -f logs/app.log
```

### Network Requests (Expo)

```bash
npm start
# Ouvrir Expo DevTools → Network tab
```

### Token Debug

```javascript
// Dans api.ts
console.log("Token:", response.data.access_token);
console.log("User ID:", response.data.user_id);
console.log("Role:", response.data.role?.code);
```

## Erreurs Courantes

### ❌ "Invalid token type"

**Cause:** Content-Type incorrect pour login
**Solution:** ✅ Déjà fixé dans api.ts

### ❌ "Role not found"

**Cause:** role_id invalide (1, 2, 3, 4, 5 uniquement)
**Solution:** Utiliser mapping dans api.ts

### ❌ "Email already exists"

**Cause:** Utilisateur déjà inscrit
**Solution:** Utiliser login au lieu de register

### ❌ "Invalid reset token"

**Cause:** Token expiré ou invalide
**Solution:** Demander un nouveau reset

### ❌ "Network Error"

**Cause:** Backend non démarré
**Solution:**

```bash
cd /path/to/backend
python -m uvicorn main:app --reload
```

## Documentation Complète

- [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) - Système complet
- [SETUP.md](./SETUP.md) - Installation & configuration
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Exemples de code
- [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) - Statut du projet

---

**✅ Intégration FlowPilot Complétée!**

L'application est maintenant prête à communiquer avec le backend FlowPilot. Commencez par tester les endpoints dans l'ordre:

1. Login
2. Register
3. Forgot Password
4. Reset Password
5. OAuth (optional)
