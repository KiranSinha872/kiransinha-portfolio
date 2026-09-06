# kiransinha-portfolio

> Personal portfolio showcasing my projects, skills, certifications, and journey as an AI/ML student and developer.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-FFCA28?logo=firebase)](https://firebase.google.com/)

---

## ✨ Features

- **Dynamic Hero Section**: Modern dark theme (`#0C0C0C`) with interactive Vanta.js birds background, status badge ("Available for Opportunities"), and video banner support.
- **Full-Stack Content Management**: Dedicated `/admin` dashboard with Firebase Authentication (Email/Password), allowing real-time CRUD management for:
  - Profile & Bio
  - Skills & Tech Stack Categories
  - Education History
  - Certifications & Credentials
  - Featured & Showcase Projects
  - Contact Information & Social Links
- **Interactive Media**: Custom image uploader with interactive cropping (`ImageCropModal`) integrated with Firebase Storage.
- **Dynamic Open Graph & Twitter Cards**: Native Next.js `ImageResponse` API generating branded 1200×630 social share cards dynamically.
- **Production Performance & Security**:
  - Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - Custom 404 and Error Boundary pages
  - Auto-generated `sitemap.xml` and `robots.txt`
  - Anti-drag and user-select protections for assets

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/), [Vanta.js](https://www.vantajs.com/)
- **Backend & Database**: [Google Firebase](https://firebase.google.com/) (Firestore, Firebase Auth, Cloud Storage)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/KiranSinha872/kiransinha-portfolio.git
cd kiransinha-portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your Firebase project credentials:

```bash
cp .env.local.example .env.local
```

Required keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
npm run build
npm run start
```

---

## 🔒 Security Rules

Firebase Security Rules for Firestore and Cloud Storage are included:
- `firestore.rules` — Secures collections with public read access and authenticated admin write access.
- `storage.rules` — Secures uploaded media with public read access and authenticated admin write access.

---

## 📄 License

This project is licensed under the MIT License.
