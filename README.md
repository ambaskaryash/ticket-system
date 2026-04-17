# 🎫 SkillEctEd Support Desk

A production-grade, SaaS-quality ticket management and customer support portal built with **React 19**, **Vite**, and **Tailwind CSS v4**. Featuring a premium, clean "Studio" aesthetic, it bridges a public-facing student help center with a robust agent dashboard.

![Studio UI Preview](public/vite.svg) <!-- Add a screenshot of the new UI here -->

---

## ✨ Key Features

### 🌐 Public Help Center
- **Smart Submit Portal**: A clean submission interface with spam-protection (cooldowns) and reCAPTCHA.
- **Knowledge Base (FAQ)**: An animated, categorized accordion layout for self-serve help.
- **Dynamic Testimonials**: A rotating CSAT/testimonial block fetching real 5-star ratings from the backend to build trust.
- **Ticket Tracking**: Live tracking using a ticket ID and email to view real-time status.
- **Feedback & Rating**: A post-resolution CSAT rating page for users to score their support experience.

### 🛡️ Admin & Agent Dashboard
- **Ticket Management**: A comprehensive dashboard featuring both a Card Grid view and a Sortable Data Table view.
- **Visual SLA Tracking**: Clear, color-coded progress bars tracking deadlines with automated pulse alerts for breached SLAs.
- **My Tickets**: A dedicated queue strictly for tickets assigned to the logged-in agent.
- **Slide-in Detail Drawer**: A modal/drawer component for full ticket oversight, editing, note-taking, and status changes.
- **Analytics & Reporting**: Visually rich Chart.js integrations showing incoming volume, resolution states, and SLA breakdowns.
- **Team & Template Management**: Structured lists using Studio-style GridLists with left-accent borders for Agents and Canned Responses.

### 💎 Premium "Studio" UI/UX
- **Tailwind UI v4 Patterns**: Utilizes modern structural components like `GridPattern`, `FadeInStagger`, and pill-shaped standard buttons.
- **Mona Sans Typography**: Distinct, premium geometric typography integrated with native Inter base fonts.
- **Micro-interactions**: Smooth page transitions, hover states, chart animations, and toast notifications.
- **Responsive Layouts**: Intelligently structured responsive sidebars, tables, and ticket cards.

---

## 🛠️ Tech Stack

- **React 19** — Functional components, Hooks, and strict memoization
- **Vite 8** — Lightning-fast development server
- **Tailwind CSS v4** — Utility-first styling utilizing the new optimized engine
- **React Router v7** — Application routing and protected views
- **Framer Motion** — Physics-based and layout animations
- **Chart.js & react-chartjs-2** — Data visualization
- **React Quill & jspdf** — Rich text editing and PDF report generation

---

## 📁 Project Structure

```text
src/
├── App.jsx                      # Main routing, Context Providers & Protected Shell
├── index.css                    # Tailwind v4 engine mapping, font config, custom keyframes
│
├── pages/                       # Route Components
│   ├── SubmitPage.jsx           # Public portal
│   ├── KnowledgeBasePage.jsx    # Public FAQ and Search
│   ├── DashboardPage.jsx        # Admin ticket overview
│   ├── AnalyticsPage.jsx        # Visual data and reporting
│   └── ...
│
├── components/                  # UI Primitives
│   ├── TicketTable.jsx          # Sortable data tables
│   ├── SLAProgressBar.jsx       # Custom SLA deadline progress UI
│   ├── GridList.jsx             # Left-accent Studio lists
│   ├── Testimonial.jsx          # Studio quote/CSAT display
│   └── ...
│
├── hooks/                       # Business Logic Separation
│   ├── useTickets.js            # Ticket data & optimistic state
│   ├── useSLA.js                # Deadline calculations
│   └── ...
│
└── utils/
    ├── api.js                   # Fetch wrappers mapped to Google Apps Script actions
    └── normalize.js             # Data shape consistency and key mapping
```

---

## 🔌 Backend Integration

The frontend operates immutably from a **Google Apps Script (Google Sheets)** backend via specific action endpoints:

| Endpoint (Action) | Payload Context |
|-------------------|-----------------|
| `getTickets` | Fetches active and closed tickets |
| `getTestimonials`| Fetches public rows mapped to 5-Star `CSAT Rating` |
| `updateTicket` | Upserts status, agent, priority attributes |
| `submitCSAT` | Saves the student rating payload |

> **CORS Security**: API calls are routed via basic HTTP utilizing `text/plain` methodologies to bypass standard cross-origin locking natively inherent to Google Apps Script executions.

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

# Setup env variables (Create a .env file)
# VITE_API_BASE_URL=https://script.google.com/macros/s/.../exec
# VITE_RECAPTCHA_SITE_KEY=your_site_key

# Start dev server
npm run dev
```

The app will start at **http://localhost:5173/**

### Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License
MIT

---

> Built with ❤️ using React + Vite + Tailwind CSS v4
