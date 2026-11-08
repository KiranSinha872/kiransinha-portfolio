# Comprehensive Codebase & Security Audit

**Target:** Personal Portfolio Website (`portfolio-kiran`)  
**Stack:** Next.js (App Router, Turbopack) + TypeScript + Tailwind CSS v4 + Firebase (Auth, Firestore, Storage)  
**Deployment Platform:** Vercel  
**Date:** November 2026  
**Auditor:** Antigravity Engineering Agent  

---

## 1. Executive Summary

A comprehensive architectural and security audit was conducted on the portfolio repository. While the application possesses a functional user interface with interactive animations and an administrative CMS dashboard, it was rapidly vibe-coded without standard security defense-in-depth principles. 

Key architectural and vulnerability highlights:
1. **Critical Rule Insecurities**: Firestore and Firebase Storage access control functions evaluate `isAdmin()` as `request.auth.uid != null`. This inadvertently allows **any authenticated Firebase user** to modify or delete every database collection and storage object.
2. **Hardcoded Fallbacks in Source History**: Firebase configuration in `lib/firebase.ts` contains hardcoded fallback credentials committed to Git history.
3. **No Server-Side Protection on Admin Pages**: Administrative routes (`/admin/dashboard`) and managers are protected purely through client-side React state (`useAuth()`), completely bypassing server verification.
4. **No Route Handlers / API Layer**: The current application executes all Firestore and Storage mutations directly from client browsers via client SDKs. There is currently no `app/api` backend layer enforcing server-side authorization or schema validation.
5. **Architectural Clutter & File Duplication**: Duplicate icon assets exist in both `app/` and `public/`, several administrative manager components exceed 400–600 lines with multiple mixed concerns, and starter template SVG assets remain in `public/`.

---

## 2. Current Architecture & Structural Problems

### 2.1 Directory Layout & Problems Identified
```
.
├── app/                        # App Router root (mixed with static favicon/OG assets)
│   ├── (public)/               # Public layout and home page
│   ├── admin/                  # Admin routes (dashboard, login)
│   ├── api/                    # Empty folder (no route handlers)
│   └── ...                     # Global layout, icons, metadata, robots, sitemap
├── components/
│   ├── admin/                  # Monolithic CMS managers (>300-660 lines each), UI pieces
│   ├── motion/                 # Framer Motion utility components
│   └── public/                 # Public sections, backgrounds, modals, UI badges
├── lib/
│   ├── auth-context.tsx        # Client-only auth provider
│   ├── firebase.ts             # Client Firebase SDK initialization with hardcoded fallbacks
│   ├── firestore.ts            # Client-side Firestore queries & listeners (499 lines)
│   └── storage.ts              # Client-side storage upload helpers with heavy Base64 fallback
├── public/                     # Static assets containing duplicates and Next.js starter templates
├── types/
│   └── index.ts                # TypeScript domain models
├── firestore.rules             # Overly permissive security rules
├── storage.rules               # Overly permissive storage rules
├── next.config.ts              # Missing CSP, permissive image remote patterns
├── vercel.json                 # Minimal configuration
└── package.json                # Overlapping dependencies
```

### 2.2 Detailed Structural Findings
* **Duplicate Assets**:
  - Favicon & Icon duplicates: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` coexist with `public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png`.
  - Environment examples: Both `.env.example` and `.env.local.example` exist at root with near-identical configurations.
* **Dead / Unreferenced Code**:
  - Default Next.js starter assets: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` are not referenced anywhere in code.
  - Build artifact on disk: `tsconfig.tsbuildinfo` is present locally.
  - Redundant 3D dependencies: `three` and `vanta` are listed as production npm dependencies in `package.json`, yet `app/layout.tsx` loads Three.js and Vanta via external CDN `<Script>` tags from `cdnjs.cloudflare.com` and `cdn.jsdelivr.net`.
  - Unused environment variable: `GEMINI_API_KEY` is present in local `.env.local` but never referenced in source code.
* **High Complexity / Large Monolithic Files (>300 lines)**:
  - `components/admin/ProfileManager.tsx` (661 lines): Mixes profile data loading, form state, social links parsing, photo cropping, and resume upload orchestration.
  - `components/admin/ProjectsManager.tsx` (642 lines): Combines project listing, filtering, create/update modal, image uploads, screenshot management, and delete flows.
  - `components/admin/CertificationsManager.tsx` (467 lines): Handles certification CRUD, badge upload, date validations, and layout in one file.
  - `components/admin/ImageCropModal.tsx` (403 lines): Contains HTML Canvas transformations, gesture zoom, drag calculations, and file conversions.
  - `components/admin/EducationManager.tsx` (382 lines): Combines list view, inline modal editing, and order adjustments.
  - `components/admin/SkillsManager.tsx` (352 lines): Combines categorizations, proficiency sliders, featured flags, and CRUD.
  - `lib/firestore.ts` (499 lines): Houses all 5 entity collections' CRUD logic and 5 real-time listeners in a single file.
* **Component Misplacement**:
  - Small reusable UI components (`Toast.tsx`, `StatCard.tsx`, `SkillBadge.tsx`, `SkeletonLoaders.tsx`, `ImageCropModal.tsx`) are split arbitrarily between `components/admin/` and `components/public/`.
  - Background animations (`HeroBirdsBackground.tsx`, `CodingProfilesVideoBackground.tsx`, `HlsBackgroundVideo.tsx`) are mixed inside `components/public/`.
  - Missing `src/` hierarchy to cleanly decouple build artifacts, docs, and configs from application code.

---

## 3. Surface Analysis: Secrets, Auth, Database, Storage, Input, and External APIs

### 3.1 Secrets & Environment Variables
| Location | Variable / Secret Name | Scope | Status / Finding |
|---|---|---|---|
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_API_KEY` | Public (Client) | Hardcoded fallback committed in Git history (commit `459dfcd`) |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public (Client) | Hardcoded fallback committed in Git history |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public (Client) | Hardcoded fallback committed in Git history |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public (Client) | Hardcoded fallback committed in Git history |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public (Client) | Hardcoded fallback committed in Git history |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_APP_ID` | Public (Client) | Hardcoded fallback committed in Git history |
| `lib/firebase.ts` | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Public (Client) | Hardcoded fallback committed in Git history |
| `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts` | `NEXT_PUBLIC_SITE_URL` | Public (Client/Build) | Unvalidated fallback to `https://kiransinha.dev` |
| `.env.local` | `GEMINI_API_KEY` | Server-only (intended) | Present in uncommitted `.env.local`, unused in code |

* **Risk**: No Zod schema or fail-fast validation exists for environment variables. If environment variables are missing in production, the app silently falls back to hardcoded strings instead of aborting startup.

### 3.2 Authentication & Authorization
* **Mechanism**: Client-side Firebase Authentication (`firebase/auth`).
* **Implementation**:
  - `lib/auth-context.tsx` exposes `login` (`signInWithEmailAndPassword`) and `logout` (`signOut`).
  - No session cookies (e.g. `__session`), no HTTP-only storage, no Next.js middleware, and no Firebase Admin SDK verification.
  - Custom Claims: No check for `admin: true`.
  - User Identification: No verification against an allowlist of permitted admin UIDs on the server.
* **Information Disclosure on Login**:
  - `app/admin/login/page.tsx` maps specific Firebase error codes (`auth/user-not-found` vs `auth/wrong-password`), allowing attackers to enumerate valid administrator emails.

### 3.3 Database (Cloud Firestore)
* **Configuration**: `firestore.rules`.
* **Access Control Vulnerability**:
  ```javascript
  function isAdmin() {
    return isAuthenticated() && (
      request.auth.uid != null
    );
  }
  ```
  Because `request.auth.uid != null` evaluates to `true` for **any** authenticated Firebase user, anyone with an account in the Firebase project can perform write/delete actions on `profile`, `education`, `skills`, `certifications`, and `projects`.
* **Missing Collections in Rules**:
  - There is no rule configuration for contact message submissions (`contact_messages`), meaning any future visitor submission endpoint would fail or be misconfigured.
* **Lack of Field-Level Validation**:
  - Rules permit any shape, data type, or payload size during document writes.

### 3.4 Cloud Storage
* **Configuration**: `storage.rules` & `lib/storage.ts`.
* **Access Control Vulnerability**:
  ```javascript
  function isAdmin() {
    return isAuthenticated() && (
      request.auth.uid != null
    );
  }
  match /{allPaths=**} {
    allow read: if true;
    allow write: if isAdmin();
  }
  ```
  Any authenticated user can overwrite, upload, or delete any file in storage.
  Default rule makes every file in the storage bucket publicly readable.
* **Denial of Service via Base64 Fallback**:
  - In `lib/storage.ts`, when Firebase Storage upload fails or times out, the code converts images or resumes to Base64 data URLs (`compressImageToBase64` / `fileToDataUrl`) and returns them. Storing multi-megabyte base64 strings in Firestore documents can crash client queries and violate Firestore's 1 MB maximum document size limit.
* **File Validation**:
  - No validation of file MIME types via magic numbers; validation is limited to client-side extension/input checks.

### 3.5 User Input & Rendering
* **Input Vectors**:
  - Administrative forms in Profile, Education, Skills, Certifications, Projects, and Contact managers.
  - Public contact section currently renders static contact links (`mailto:`, `tel:`, LinkedIn).
* **Cross-Site Scripting (XSS)**:
  - Codebase audit confirmed **zero** occurrences of `dangerouslySetInnerHTML`.
  - Input fields lack Zod schema sanitization and length bounds prior to Firestore writes.

### 3.6 External APIs & Third-Party Resources
* **Third-Party CDN Scripts**:
  - `app/layout.tsx` loads `three.min.js` from `cdnjs.cloudflare.com` and `vanta.birds.min.js` from `cdn.jsdelivr.net` without Subresource Integrity (SRI) hashes or a Content Security Policy (CSP).
* **Remote Media**:
  - `next.config.ts` allows wildcard Google user content (`*.googleusercontent.com`), Unsplash, Firebase Storage, and GitHub avatars.
  - Video files are fetched directly from AWS CloudFront (`d8j0ntlcm91z4.cloudfront.net`).

---

## 4. API Routes Inventory (`app/api`)

| Route Path | HTTP Methods | Allowed Callers | Function / Purpose | Auth Enforced? | Input Validated? |
|---|---|---|---|---|---|
| *(None)* | N/A | N/A | `app/api` directory is currently empty. No route handlers exist. | N/A | N/A |

* **Note**: Currently, all administrative actions, data retrieval, and file uploads are conducted directly from the client browser to Firebase via the client SDK. Introducing route handlers in Phase 4 and Phase 5 will be vital to enforce server-side authentication, rate limiting, and input schema validation.

---

## 5. Admin Pages Protection Inventory

| Route Path | Current Protection Mechanism | Server-Side vs. Client-Side Only | Vulnerability / Bypass Risk |
|---|---|---|---|
| `/admin` | Next.js server-side `redirect('/admin/dashboard')` | Server-Side Redirect | None for `/admin` itself, but forwards user to unhardened dashboard |
| `/admin/login` | Public page | Public | No rate limiting; verbose error messages allow email enumeration |
| `/admin/dashboard` | `AdminAuthGuard` in `app/admin/layout.tsx` checks React state `useAuth().user` | **Client-Side Only** | Anyone can inspect page bundles, disable JS, or mock client auth state. No server-side session cookie or middleware validation. |

---

## 6. Risk Assessment Matrix (Ranked by Severity)

### CRITICAL RISKS
1. **Broken Access Control in Firestore Security Rules**:
   - *Impact*: In `firestore.rules`, `isAdmin()` checks only `request.auth.uid != null`. Any authenticated user can modify, overwrite, or delete all portfolio collections (`profile`, `projects`, `skills`, `education`, `certifications`).
2. **Broken Access Control in Storage Security Rules**:
   - *Impact*: In `storage.rules`, any authenticated user has write/delete access across all buckets. The default rule also grants unrestricted public read access to every file.
3. **Hardcoded Firebase Credentials in Git History**:
   - *Impact*: Git commit `459dfcd` directly contains fallback values for `NEXT_PUBLIC_FIREBASE_API_KEY`, Project ID, and App ID in `lib/firebase.ts`. While client Firebase keys are intended for browser communication, having them hardcoded bypasses environment variable isolation and leaves the project exposed when combined with weak rules.
4. **Complete Absence of Server-Side Admin Authentication**:
   - *Impact*: Administrative views rely entirely on client-side React state. An attacker disabling JavaScript or accessing API endpoints (once introduced) will bypass all front-end UI guards.

### HIGH RISKS
5. **No Rate Limiting on Authentication or Mutations**:
   - *Impact*: `/admin/login` can be brute-forced without throttling. There is no protection against credential stuffing or denial-of-wallet attacks.
6. **User Enumeration on Admin Login Form**:
   - *Impact*: Explicit Firebase error messages (`auth/user-not-found` vs `auth/wrong-password`) disclose whether an email is registered in Firebase Auth.
7. **Document Bloat & DoS via Base64 Fallback**:
   - *Impact*: `lib/storage.ts` converts images and PDF resumes into Base64 data URLs when Firebase Storage times out or fails, writing massive strings into Firestore documents. This can exceed Firestore's 1 MB document limit and break site rendering.
8. **Unrestricted File Uploads**:
   - *Impact*: File uploads lack server-side MIME type verification via magic bytes and rely solely on client-reported extensions.

### MEDIUM RISKS
9. **Missing Content Security Policy (CSP)**:
   - *Impact*: The site loads external scripts from `cdnjs.cloudflare.com` and `cdn.jsdelivr.net` without CSP headers or SRI hashes, creating supply-chain attack vectors.
10. **Absence of Environment Variable Validation Schema**:
    - *Impact*: No Zod schema enforces that required environment variables are present and correctly formatted at startup.
11. **No Server-Side Input Validation (Zod)**:
    - *Impact*: Form inputs are sent directly to Firestore without schema bounds, length caps, or stripping of malicious markup.
12. **Missing Security Response Headers**:
    - *Impact*: `next.config.ts` lacks `poweredByHeader: false`, custom CSP, and strict caching controls (`Cache-Control: no-store` on administrative assets).

### LOW RISKS
13. **Asset & Example File Duplication**:
    - *Impact*: Duplicate icons in `app/` and `public/`, and duplicate `.env.example` / `.env.local.example` files create maintenance confusion.
14. **Unused Starter Code & Assets**:
    - *Impact*: Starter SVGs (`file.svg`, `globe.svg`, `vercel.svg`, etc.) and `GEMINI_API_KEY` clutter the repository.
15. **Unpinned Node Engine**:
    - *Impact*: Lack of `.nvmrc` and `engines` field in `package.json` risks runtime divergence across deployment environments.

---

## 7. Action Plan for Phase 2 & Beyond

1. **Phase 2 (Restructure)**:
   - Reorganize project into `src/` directory layout.
   - Separate reusable UI, layouts, sections, motion, backgrounds, and admin managers.
   - Deconstruct monolithic manager components exceeding 300 lines.
   - Remove duplicate icons, clean unused SVG starters, consolidate `.env.example`, and clean `tsconfig.tsbuildinfo`.
   - Update README and documentation.
2. **Phase 3 (Secrets & Environment)**:
   - Remove hardcoded fallbacks from `lib/firebase.ts`.
   - Introduce `src/lib/env.ts` with strict Zod validation.
   - Classify environment variables into public vs. server-only with `import "server-only"`.
   - Document credential rotation instructions in `docs/SECURITY.md`.
3. **Phase 4 (Authentication & Admin Protection)**:
   - Configure Firebase Admin SDK on the server.
   - Implement HTTP-only session cookies with verification.
   - Implement Next.js `middleware.ts` for `/admin/*` route guarding.
   - Restrict administrative authority via Firebase Custom Claims (`admin: true`) and UID allowlist.
   - Harden login with generic error messages and rate limiting.
4. **Phase 5 (API & Input Security)**:
   - Migrate CMS mutations and contact submissions to validated API route handlers.
   - Enforce Zod validation and sanitization for all request bodies.
   - Implement rate limiting and upload file type verification.
5. **Phase 6 (Database & Storage Rules)**:
   - Rewrite `firestore.rules` and `storage.rules` to enforce strict default-deny and custom claim `request.auth.token.admin == true`.
6. **Phase 7 (Security Headers & Config Hardening)**:
   - Configure strict CSP and security headers in `next.config.ts` / middleware.
   - Disable `poweredByHeader` and enforce `Cache-Control: no-store` on admin routes.
7. **Phase 8 & 9 (Dependency Audit & Final Verification)**:
   - Update vulnerable dependencies, test real requests against endpoints, and confirm security posture.
