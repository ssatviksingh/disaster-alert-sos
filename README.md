# 🚨 Disaster Alert & SOS App

A mobile application built with **React Native (Expo)** to help users stay informed during disasters and quickly send SOS alerts with location, attachments, and offline retry support.

This project focuses on **safety, reliability, offline-first behavior, and clean UX**.

---

## 📱 Features

### 🚨 Disaster Alerts
- Real-time disaster alerts
- Alert details with severity and location
- Map view for nearby alerts

### 🆘 SOS System
- Long-press SOS trigger to prevent accidental sends
- Sends:
  - Emergency message
  - Live location (if available)
  - Selected safety documents (ID, medical, insurance, etc.)
- Works **offline**:
  - Automatically queues SOS
  - Retries when internet is restored
- SOS history with status tracking:
  - Pending
  - Sending
  - Sent
  - Failed

### 📂 Safety Files
- Upload and manage important files:
  - Documents
  - Images
- Smart auto-suggestion of important files during SOS
- Local caching for fast access

### 🤖 AI Safety Assistant
- Chat-based assistant for:
  - Disaster preparedness
  - Emergency guidance
  - Safety checklists
- Graceful fallback when AI is unavailable

### 📍 Live Location Sharing
- Share live location during emergencies
- Integrated with SOS workflow

### ⚙️ Settings & Accessibility
- Dark mode
- High contrast mode
- Large text mode
- Emergency contacts
- SOS history access
- Local data reset (dev tool)

### 🔐 Authentication
- Email + password login
- Auth state persisted using AsyncStorage
- Backend stores users with privacy-first defaults
- No personal names shown inside the app (shown as **User**)

---

## 🛠 Tech Stack

### Frontend
- React Native
- Expo (SDK 54)
- TypeScript
- Zustand (state management)
- React Navigation
- AsyncStorage
- Expo Location & Notifications

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- bcrypt password hashing

---

## 🧱 Architecture Highlights

- **Offline-first SOS queue**
- **Retry & backoff strategy**
- **Persistent storage for auth, SOS, files**
- **Separation of concerns**:
  - API layer
  - Store layer
  - UI layer
- Strong error handling and fallbacks

---

## 🚀 Getting Started

### Prerequisites
- Node.js (18+ recommended)
- Expo CLI
- Android Studio (for emulator) or physical Android device

---

### 📦 Install dependencies
```bash
npm install
```

### Run the app
npx expo start

### 🔑 Environment Variables
Create a .env file in the root:

API_BASE_URL=http://YOUR_BACKEND_URL
JWT_SECRET=your_secret_key

### 🧪 Demo Credentials
Email: user@example.com
Password: secret123

### 👤 Author
Built as a full-stack mobile safety project using modern React Native practices.
