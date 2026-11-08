# Security Guide & Hardening Reference

This document outlines the security architecture, threat model, API key restriction procedures, App Check activation guide, and credentials rotation checklist for the portfolio application.

---

## 1. Firebase API Key Restriction Guide

Firebase Web Configuration keys (`NEXT_PUBLIC_FIREBASE_API_KEY`) are public client-side project identifiers. Unlike server-side secret keys, client keys are embedded into frontend JavaScript bundles. Security is enforced through **Firebase Security Rules**, **Google Cloud API Key Restrictions**, and **Firebase App Check**.

### Step-by-Step Google Cloud Console Restrictions
1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your Firebase Project (`portfolio-kiran` or your project ID).
3. Under **API Keys**, locate the key corresponding to your `NEXT_PUBLIC_FIREBASE_API_KEY`.
4. Click **Edit API Key**:
   - **Set Name**: `Browser Portfolio Client Key`
   - **Application Restrictions**:
     - Choose **Websites (HTTP referrers)**
     - Add allowed referrers:
       - `http://localhost:*`
       - `https://*.vercel.app/*`
       - `https://your-custom-domain.com/*` (e.g. `https://kiransinha.me/*`)
   - **API Restrictions**:
     - Choose **Restrict key**
     - Select **ONLY** the following required APIs:
       1. **Cloud Firestore API**
       2. **Identity Toolkit API** (Firebase Authentication)
       3. **Cloud Storage for Firebase** / **Google Cloud Storage JSON API**
       4. **Firebase Installations API**
       5. **Firebase App Check API**
5. Click **Save**. Note that changes take ~5 minutes to propagate across Google's edge.

---

## 2. Setting Your Admin UID in `firestore.rules`

In `firestore.rules`, administrative write permissions are restricted exclusively to your administrative UID:

```javascript
function isAdmin() {
  return request.auth != null && request.auth.uid == "<MY_ADMIN_UID>";
}
```

### Action Required:
1. Open the [Firebase Console Authentication Tab](https://console.firebase.google.com/project/_/authentication/users).
2. Locate your administrative user account row.
3. Copy the **User UID** string (e.g., `aB1c2D3e4F5g6H7i8J9k0L1m2N3o`).
4. In `firestore.rules`, replace `<MY_ADMIN_UID>` with your real UID.
5. Deploy the rules to Firebase:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## 3. Firebase App Check Activation Sequence

To prevent unauthorized automated scrapers, abusive bots, and DDoS attempts against Firestore and Cloud Storage, Firebase App Check with reCAPTCHA v3 is supported in `src/lib/firebase/client.ts`.

### Recommended Activation Order (Zero Downtime):
1. **Register reCAPTCHA v3**:
   - Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
   - Register a new site with **reCAPTCHA v3**.
   - Add domains: `localhost`, `vercel.app`, and your custom production domain.
   - Copy the **Site Key** and **Secret Key**.
2. **Register in Firebase Console**:
   - Go to Firebase Console > **App Check** > **Apps**.
   - Select your Web app and enter the reCAPTCHA v3 Secret Key.
3. **Configure Environment Variables**:
   - Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your_site_key>` in `.env.local` and your Vercel Project Environment Settings.
   - For local development, set `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN=true` to generate a debug token in your browser devtools console, and register that token in the Firebase App Check console.
4. **Deploy Frontend**:
   - Deploy your application. Verify in browser devtools that App Check tokens are being exchanged.
5. **Monitor Traffic (Do NOT enforce yet)**:
   - Monitor the Firebase App Check metrics dashboard for 24-48 hours. Ensure verified request rate is near 100%.
6. **Enable Enforcement**:
   - In Firebase Console > App Check > Cloud Firestore: Click **Enforce**.
   - In Cloud Storage: Click **Enforce**.

---

## 4. Key Rotation & Git History Purge Checklist

### Credentials Audited:
| Credential / Key | Status | Action Required |
|---|---|---|
| `GEMINI_API_KEY` | Never committed to Git | None (kept in server/local env only) |
| `.env.local` | Never tracked in Git | None |
| Firebase Client Config | Committed in initial commit (`459dfcd`) | Recommend regenerating API key in Google Cloud Console if desired; enforce referrer and API restrictions |

### Purging Sensitive Commits from Git History (Optional):
If you wish to purge the initial commit's hardcoded fallback values from your git history:
```bash
# 1. Install git-filter-repo (via brew or pip)
brew install git-filter-repo

# 2. Rewrite history to redact the commit or text
git-filter-repo --replace-text <(echo "AIzaSy...==>REDACTED")

# 3. Force push to your remote repository (coordinated action)
git push origin refactor-and-security --force
```

---

## 5. Security Rules Verification Matrix

| Target | Anonymous Public | Non-Admin Auth | Admin UID | Test Status |
|---|---|---|---|---|
| `profile` | Read Allowed, Write Denied | Write Denied | Read/Write Allowed | Verified |
| `projects` | Read Allowed, Write Denied | Write Denied | Read/Write Allowed | Verified |
| `skills` | Read Allowed, Write Denied | Write Denied | Read/Write Allowed | Verified |
| `education` | Read Allowed, Write Denied | Write Denied | Read/Write Allowed | Verified |
| `certifications` | Read Allowed, Write Denied | Write Denied | Read/Write Allowed | Verified |
| `contact_messages` | Create (Validated) Allowed, Read/Update/Delete Denied | Read/Update/Delete Denied | Read & Delete Allowed, Update Denied | Verified |
| Cloud Storage (`images/`) | Read Allowed, Write Denied | Write Denied | Write (<=5MB, PNG/JPEG/WEBP/GIF) Allowed | Verified |
| Cloud Storage (`resumes/`)| Read Allowed, Write Denied | Write Denied | Write (<=10MB, PDF) Allowed | Verified |
