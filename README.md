# 🏥 SchedulePro - Patient Session Scheduling App

SchedulePro is a modern and responsive patient-doctor session scheduling application built using **React.js**, **Next.js**, and **Material UI**. It allows patients to register, log in, and schedule sessions with doctors seamlessly, either in-person or online.

---

## 🚀 Live Application

🔗 **Access Live:** [https://schedulepro.vercel.app](https://schedulepro.vercel.app)

---

## 🛠️ Tech Stack

- **Frontend**: ReactJS, NextJS
- **UI Library**: Material UI (MUI), Framer Motion
- **Forms & Validation**: React Hook Form, Zod
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`)
- **Database & Auth**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel

---

## 📋 Features

### 👤 Patient Registration

- Name
- Mobile Number
- WhatsApp Number (✅ Checkbox: Same as Mobile)
- Email ID
- Password
- Address

### 🔐 Login

- Email and password authentication via Firebase
- Validates user presence in Firestore after login

### 📅 Session Scheduling

- Select or auto-detect existing patient from Firebase
- Choose:
  - Date
  - Time Slot
  - Session Type: **In-Person** or **Online**
  - Additional notes or links for online mode
- Confirm & save session to Firestore

### 🧾 Dashboard

- Displays upcoming & past sessions
- Show:
  - Doctor’s photo, name, phone
  - Session details (slot, date, mode)
- Option to mark session as completed

---

## ✅ How to Use

1. Visit [Live App](https://schedulepro.vercel.app)
2. Register as a new patient
3. Log in to your dashboard
4. Click **"Schedule New Appointment"**
5. Select a doctor → Choose date, time, mode
6. Confirm to save your session

---

## 📦 Project Structure

src/
├── components/ # Reusable UI components (RegisterForm, LoginForm, DoctorCard, etc.)
├── pages/ # Next.js pages (index, dashboard, schedule-doctor, etc.)
├── utils/ # Firebase config, helpers
├── styles/ # Global styles

- ✅ Built with **Material UI** for consistent design and responsiveness
- ✅ Uses **Firebase Firestore** to store patient and session data
- ✅ Fully responsive and mobile-friendly layout
- ✅ Authentication handled via Firebase
- ✅ Data is validated using **Zod**

---

## ✨ Future Enhancements

- Add admin/doctor login
- Send WhatsApp or email reminders
- Calendar view for sessions
- PDF summary after session completion

---
