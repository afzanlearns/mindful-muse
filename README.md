# Mindful Muse 🧠📝
*A calm, modern note-taking experience for focused thinking.*

Mindful Muse is a full-stack note-taking web application designed to reduce friction between thought and action. It prioritizes clarity, minimalism, and privacy while offering powerful features such as secure authentication, markdown support, and cloud-synced notes.

This project demonstrates real-world frontend architecture, secure backend integration, and production-ready deployment practices.

---

## 🖼️ Preview

A distraction-free workspace with tag-based notes, live markdown editing, and a soft, mindful interface.

> Screenshot showcasing the main editor, sidebar with tagged notes, and preview toggle.

---

## ✨ Core Features

### 📝 Thoughtful Note-Taking
- Markdown editor with live preview
- Auto-save with persistent storage
- Word and character count
- Seamless title and content editing
- Instant updates across sessions

### 🏷️ Organization & Filtering
- Tag-based notes (Work, Personal, Ideas, To-Do)
- Filter notes by tags
- Visual tag indicators for quick context
- Clean and intuitive sidebar navigation

### 🔐 Secure Authentication
- Email/password signup and login
- Supabase Auth integration
- Persistent user sessions
- Protected routes for authenticated users
- Secure logout

### 🎨 Interface & UX
- Calm, minimal design system
- Light and dark mode support
- Smooth micro-interactions
- Fully responsive layout
- Accessible UI components

---

## 🧠 Design Philosophy

Mindful Muse is built around one guiding principle:

**Less friction. More clarity.**

Instead of overwhelming users with features, the app:
- Reduces visual noise
- Keeps interactions intentional
- Prioritizes readability and calm spacing
- Stays out of the way while you think

---

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend
- Supabase
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)

### Deployment
- Vercel (frontend hosting)
- Supabase (managed backend services)

---

## 🗄️ Database & Security

- Notes are scoped per user using `user_id`
- Row Level Security ensures users can only access their own data
- Database indexes for improved performance
- Automatic timestamp handling via database triggers
- No sensitive credentials stored in the client

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A Supabase account

### Installation
-bash
npm install

### Environment Setup

### Create a .env file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

## Start Development Server
npm run dev


The application will be available at:

http://localhost:5173

## 🌐 Production Deployment (Vercel)

Mindful Muse is optimized for deployment on Vercel.

Deployment Steps

Push the repository to GitHub

Import the project into Vercel

Configure the following environment variables:

#### - VITE_SUPABASE_URL

#### - VITE_SUPABASE_ANON_KEY

Use the following build settings:

Build Command: npm run build

Output Directory: dist

Deploy the project

Once deployed, the application runs with secure authentication and persistent cloud storage.

## 📌 Project Intent

This project was built to showcase:

Modern frontend architecture

Secure authentication and authorization patterns

Thoughtful UI/UX design

Clean code organization

Real-world deployment readiness.
