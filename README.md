# 🚛 RoadPulse Frontend

This is the frontend for the RoadPulse application, a web interface for managing trips and Electronic Logging Device (ELD) logs for trucking operations. Built with React, TypeScript, and Vite, it provides a responsive UI to interact with the RoadPulse backend API.

---

## 🧭 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [⚙️ Setup Instructions](#️-setup-instructions)
- [📁 Project Structure](#-project-structure)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📬 Contact](#-contact)

---

## ✨ Features

- 📝 View and manage trip details (start, update, delete).
- 📊 Generate and view ELD logs with a 24-hour duty status graph.
- 📱 Responsive dashboard for trip and log management.
- 🔐 User authentication with JWT.
- ⚡ Interactive UI with real-time API integration.

---

## 🧰 Tech Stack

- **Framework:** React 18, TypeScript ⚛️  
- **Build Tool:** Vite ⚡  
- **State Management:** React Query (`react-query`)  
- **HTTP Client:** Axios 📡  
- **UI Components:** Tailwind CSS, Lucide React Icons 🎨  
- **Animation:** Framer Motion 🎞️  
- **Routing:** React Router 🧭  
- **Deployment:** Vercel 🌐  

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js 18+ 🟢  
- Git 🔀  
- Vercel CLI (for deployment) 🧪  
- Running RoadPulse backend (see Backend README) 📘

### 📦 Installation

**Clone the Repository**
```bash
git clone https://github.com/VitthalGund/roadpulse-frontend.git
cd roadpulse-frontend
````

**Install Dependencies**

```bash
npm install
```

**Set Up Environment Variables**

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/
```

**Start the Development Server**

```bash
npm run dev
```

🔗 Access the app at [http://localhost:5173](http://localhost:5173)

### ✅ Testing

Run linting and type checking:

```bash
npm run lint
npm run type-check
```

---

## 📁 Project Structure

```
src/
├── components/        # 🧩 Reusable UI components (Button, Card, Input, Modal)
├── hooks/             # 🪝 Custom React Query hooks (useTrips, useTripDetails, useELDLogs)
├── pages/             # 📄 Page components (TripDetailsPage, ELDLogsPage)
├── App.tsx            # 🛣️ Main app with routing
├── index.tsx          # 🛠️ Entry point with QueryClientProvider
├── index.css          # 🎨 Global styles (Tailwind)
```

---

## 🚀 Deployment

### 🧪 Set Up Vercel

Install the Vercel CLI:

```bash
npm install -g vercel
vercel login
```

### 🔐 Configure Vercel

Add environment variables in the Vercel dashboard:

```
VITE_API_BASE_URL=https://your-railway-backend-url/
```

### 📤 Deploy

```bash
vercel --prod
```

🌐 Access the deployed app at the provided Vercel URL.

---

## 🤝 Contributing

1. 🔀 Fork the repository.
2. 🌱 Create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```
3. 💾 Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```
4. 🚀 Push to the branch:

   ```bash
   git push origin feature/your-feature
   ```
5. 📥 Open a Pull Request.

---

## 📬 Contact

**Author:** Vitthal Gund
**GitHub:** [VitthalGund](https://github.com/VitthalGund)
**LinkedIn:** [Vitthal Gund](https://www.linkedin.com/in/vitthal-gund)
**Email:** [vitthalgund@example.com](mailto:vitthalgund@gmail.com)
