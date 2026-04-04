# 🎫 Ticket Management Admin Dashboard

A production-grade, SaaS-quality ticket management dashboard built with **React**, **Vite**, and **Tailwind CSS v4**. Inspired by tools like Linear, Jira, and Zendesk — featuring a dark glassmorphism UI, real-time filtering, animated stats, and optimistic API updates.

![Dashboard Preview](src/assets/hero.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Animated Stats Cards** | Real-time counters for Total, Open, In Progress, and Resolved tickets |
| 🃏 **Card-Based Ticket List** | Glassmorphism ticket cards with status/priority badges and time-ago display |
| 🔍 **Debounced Search** | 300ms debounced search across name and subject fields |
| 🎛️ **Instant Filters** | Filter by status (Open / In Progress / Resolved) and priority (Low / Medium / High / Critical) |
| 📋 **Ticket Detail Drawer** | Slide-in panel showing full ticket details with editable status & agent assignment |
| ⚡ **Optimistic UI Updates** | Instant UI feedback with automatic rollback on API failure |
| 🔔 **Toast Notifications** | Success, error, and info toasts with auto-dismiss |
| 💀 **Loading Skeletons** | Shimmer skeleton loaders while data is fetched |
| 🚨 **Error Handling** | Inline error banner with retry, plus toast alerts |
| 🌙 **Dark Glassmorphism Theme** | Deep dark backgrounds with frosted-glass card effects |
| 🎬 **Smooth Animations** | Fade-in, slide-up, counter-pop, drawer transitions |
| 📱 **Fully Responsive** | Mobile-first layout that scales to desktop |

---

## 🛠️ Tech Stack

- **React 19** — Functional components with hooks
- **Vite** — Lightning-fast dev server and build
- **Tailwind CSS v4** — Utility-first styling with custom theme
- **Google Fonts (Inter)** — Clean, modern typography
- **Fetch API** — No external HTTP libraries

---

## 📁 Project Structure

```
src/
├── App.jsx                      # Main dashboard layout & state
├── main.jsx                     # Entry point
├── index.css                    # Tailwind v4 theme, glass utilities & animations
│
├── components/
│   ├── StatsCard.jsx            # Animated counter stat cards + skeleton
│   ├── TicketCard.jsx           # Glass-effect ticket cards + skeleton
│   ├── TicketModal.jsx          # Slide-in detail drawer with editable fields
│   └── ToastContainer.jsx       # Toast notification system
│
├── hooks/
│   └── useTickets.js            # Ticket state, optimistic updates, toasts, debounce
│
└── utils/
    └── api.js                   # Fetch wrapper with timeout & error handling
```

---

## 🔌 API Integration

Connects to a **Google Apps Script** backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/exec?action=getTickets` | Fetch all tickets |
| `GET` | `/exec?action=getTicketById&id=...` | Fetch a single ticket |
| `POST` | `/exec?action=updateTicket` | Update ticket status/agent |

> **Note:** POST uses `Content-Type: text/plain` to avoid CORS preflight with Google Apps Script.

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ambaskaryash/ticket-system.git
cd ticket-system

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be running at **http://localhost:5173/**

### Production Build

```bash
npm run build
npm run preview
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#020617` / `#0f172a` |
| Card effect | `backdrop-filter: blur(20px)` + gradient overlay |
| Font | Inter (Google Fonts) |
| Status: Open | 🔵 Blue (`#3b82f6`) |
| Status: In Progress | 🟡 Yellow (`#f59e0b`) |
| Status: Resolved | 🟢 Green (`#10b981`) |
| Priority: Low | Cyan · Medium: Amber · High: Red · Critical: Deep Red |

---

## ⚠️ CORS Note

Google Apps Script blocks cross-origin requests from `localhost`. The dashboard will show a "Failed to fetch" error during local development. Options to fix:

1. **Deploy to production** — CORS works when served from a real domain
2. **Vite proxy** — Add this to `vite.config.js`:

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/macros/s/YOUR_SCRIPT_ID/exec'),
      },
    },
  },
});
```

---

## 📄 License

MIT

---

> Built with ❤️ using React + Vite + Tailwind CSS
