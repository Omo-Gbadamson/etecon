# TeachConnect — Setup Guide

## Prerequisites
- Node.js 18+
- A Firebase project with **Firestore**, **Authentication**, and **Storage** enabled

## 1. Extract and install
```bash
unzip teachconnect.zip
cd teachconnect
npm install
```

## 2. Create your Firebase project
1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable **Authentication** → Email/Password and Google
4. Enable **Firestore Database** (start in test mode, then apply the rules below)
5. Enable **Storage**

## 3. Configure environment
```bash
cp .env.example .env
```
Fill in your Firebase config from Project Settings → General → Your apps.

## 4. Apply Firestore Security Rules
Copy the contents of `firestore.rules` into your Firestore Rules tab in the Firebase console.

## 5. Run locally
```bash
npm run dev
```

## 6. Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set dist/ as public dir, SPA: yes
npm run build
firebase deploy
```

## Project Structure
```
src/
├── firebase/         Firebase config, auth, firestore, storage helpers
├── context/          AuthContext, NotificationsContext
├── components/
│   ├── auth/         PrivateRoute, RoleRoute guards
│   ├── jobs/         JobCard, JobListItem
│   ├── teachers/     TeacherCard
│   ├── applications/ ApplicationCard
│   ├── layout/       DashboardLayout, Navbar
│   └── shared/       Button, Badge, Input, Modal, etc.
├── pages/
│   ├── teacher/      Dashboard, Profile, BrowseJobs, JobDetail, Applications
│   └── school/       Dashboard, Profile, ManageJobs, PostJob, ViewApplicants, BrowseTeachers
└── utils/            formatDate, formatSalary, Nigerian states/subjects lists
```

## Features implemented (Phase 1 MVP)
- ✅ Email/Password + Google OAuth registration and login
- ✅ Role selection (School / Teacher) on signup
- ✅ Role-based routing and protected routes
- ✅ Teacher profile builder (subjects, qualifications, CV upload, availability)
- ✅ School profile builder (logo, type, contact info)
- ✅ Job posting with full details (salary, requirements, benefits, deadline)
- ✅ Job browsing with filters (subject, state, job type, experience)
- ✅ Apply to jobs with cover letter (modal flow)
- ✅ Real-time application status tracking for teachers
- ✅ School applicant management (shortlist, review, hire, reject)
- ✅ All Applications view for schools (filterable by status)
- ✅ Browse public teacher profiles
- ✅ Public job board (no auth required)
- ✅ Skeleton loading states throughout
- ✅ Toast notifications (sonner)
- ✅ Nigerian states + subjects + school types
- ✅ Naira (₦) salary formatting
