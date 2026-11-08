# Kiran Sinha — Personal Portfolio & CMS

> High-performance personal portfolio and dynamic administrative content management system built with Next.js (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, and Firebase.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-FFCA28?logo=firebase)](https://firebase.google.com/)

---

## ✨ Features

- **Public Presentation**:
  - Hero header with custom interactive Vanta birds canvas background.
  - Video banner and responsive coding profiles showcasing LeetCode, CodeChef, Codeforces, and GitHub.
  - Dynamic skill badges categorized into Frontend, Backend, Tools & Cloud, and Core CS.
  - Featured projects with tags, live links, repository links, and interactive image modals.
  - Formal timeline views for education and verified certification credentials.
  - Responsive contact form with server-side validation and anti-abuse safeguards.
- **Administrative CMS (`/admin`)**:
  - Secure dashboard for editing profile details, avatar photos, resume documents, and social links.
  - Interactive client-side image cropper with custom aspect ratios (`16:9`, `4:3`, `1:1`).
  - Full CRUD operations over skills, projects, certifications, education, and contact submissions.
- **Security & Reliability**:
  - Strict Firebase Security Rules with default-deny, type and length bounds, and admin UID allowlisting.
  - Firebase App Check support (reCAPTCHA v3) with zero-downtime deployment guidance.
  - Comprehensive HTTP security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
  - Admin routes protected with `noindex` robots directives and `Cache-Control: no-store`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Motion & Visuals**: Framer Motion, Three.js, Vanta.js
- **Database & Storage**: Google Cloud Firestore & Cloud Storage
- **Authentication**: Firebase Authentication (Email/Password)
- **Validation**: Zod (Environment variables & Form input)

---

## 📁 Folder Structure

All application source code resides under `src/`:

```
├── .env.example                     # Environment template with documentation
├── docs/                            # Architectural, security, and audit reports
│   ├── ARCHITECTURE.md              # Detailed system design and directory breakdown
│   ├── AUDIT.md                     # Codebase vulnerability and structure audit
│   └── SECURITY.md                  # Security policies, API key restriction, and App Check guide
├── firestore.rules                  # Production-hardened Firestore security rules
├── storage.rules                    # Production-hardened Cloud Storage security rules
├── public/                          # Static public assets
├── src/
│   ├── app/                         # App Router (pages, layouts, dynamic OG/Twitter metadata)
│   │   ├── (public)/                # Public portfolio landing page
│   │   └── admin/                   # Administrative management interfaces
│   ├── components/
│   │   ├── admin/                   # Admin manager interfaces and modals (<300 lines each)
│   │   ├── backgrounds/             # Interactive canvas and background video components
│   │   ├── layout/                  # Navbar, Footer, AdminHeader, AdminSidebar
│   │   ├── motion/                  # Animation wrappers (AnimatedText, FadeIn, Magnet)
│   │   ├── sections/                # Modular landing page sections
│   │   └── ui/                      # Reusable UI widgets, loaders, and modals
│   ├── lib/
│   │   ├── env.ts                   # Fail-fast Zod-validated environment config
│   │   ├── firebase/                # Firebase client init & React Auth Context
│   │   ├── services/                # Firestore and Storage service layer
│   │   └── utils/                   # Helper functions (crop, transforms)
│   └── types/                       # Shared TypeScript type definitions
└── tests/                           # Security rules and unit test suites
```

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public / Client | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public / Client | Firebase Auth domain (`project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public / Client | Google Cloud / Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public / Client | Cloud Storage bucket (`project.firebasestorage.app`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public / Client | Cloud Messaging sender identifier |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public / Client | Firebase Web application identifier |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Public / Client (Optional) | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public / Client (Optional) | reCAPTCHA v3 site key for Firebase App Check |
| `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN` | Public / Client (Dev only) | Set to `true` in local development to debug App Check |

---

## 🚀 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KiranSinha872/kiransinha-portfolio.git
   cd kiransinha-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase configuration values in .env.local
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment

### 1. Deploy to Vercel
1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings > **Environment Variables**, add the variables from `.env.example`.
4. Deploy.

### 2. Deploy Firebase Rules
To deploy your Firestore and Cloud Storage security rules:
```bash
# Set your active Firebase project
firebase use <YOUR_FIREBASE_PROJECT_ID>

# Deploy rules
firebase deploy --only firestore:rules,storage
```

---

## 🔒 Security Hardening

For complete security instructions, API key restrictions, and App Check activation procedures, refer to [docs/SECURITY.md](docs/SECURITY.md).

---

## 📄 License

MIT © [Kiran Sinha](https://github.com/KiranSinha872)
