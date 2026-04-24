# 📝 Quick Notes — Secure Multi‑User Note Taking App

A full‑stack, secure, multi‑user note‑taking application built with **Node.js**, **Express**, **MongoDB**, and **Auth0**.  
Users can authenticate via OAuth, create and manage notes, and enjoy a responsive, modern UI with light/dark themes.

---

## 📚 Table of Contents

- [Features](#features)  
- [System Requirements](#system-requirements)  
- [Installation & Setup](#installation--setup)  
- [Running the App Locally](#running-the-app-locally)  
- [Environment Variables](#environment-variables)  
- [Authentication Flow](#authentication-flow)  
- [Usage Guide](#usage-guide)  
- [Project Structure](#project-structure)  
- [API Endpoints](#api-endpoints)  
- [Technologies Used](#technologies-used)  
- [Troubleshooting](#troubleshooting)  
- [License](#license)

---

## ✨ Features

- 🔐 **Auth0 OAuth Authentication**  
- 👤 **Automatic User Sync** with MongoDB  
- 📝 **Full CRUD Notes** (Create, Read, Update, Delete)  
- 🎨 **Light/Dark Theme Toggle**  
- 📱 **Responsive UI** (desktop + mobile)  
- ⚡ **Instant UI Updates**  
- 🔒 **User‑isolated notes** (each user sees only their own)

---

## 🖥️ System Requirements

- **Node.js** v14+  
- **npm**  
- **MongoDB** (local or cloud)  
- **Auth0 account**  
- Modern browser (Chrome, Firefox, Edge, Safari)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd noteTakingApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB

**Local MongoDB**
```bash
mongod
```

**MongoDB Atlas**
- Ensure your connection string is correct  
- Whitelist your IP if needed  

### 4. Configure Auth0

1. Create an Auth0 account  
2. Create a **Regular Web Application**  
3. Copy your:
   - Client ID  
   - Client Secret  
   - Domain  

4. Set **Allowed Callback URLs**
```
http://localhost:3000/callback
```

5. Set **Allowed Logout URLs**
```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/notetakingapp
BASE_URL=http://localhost:3000

AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_SECRET=your_generated_secret

ADMIN_EMAIL=your-email@example.com
```

Generate `AUTH0_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 Running the App Locally

### Start the server:
```bash
node server.js
```

Expected output:
```
✓ MongoDB connected
✓ Server running on http://localhost:3000
```

### Open the app:
```
http://localhost:3000
```

You will be redirected to Auth0 for login.

---

## 🔐 Authentication Flow

1. User visits the app  
2. If not logged in → redirected to Auth0  
3. User authenticates  
4. User profile is stored in MongoDB  
5. User can now create/manage notes  

Each user has:
- Auth0 ID  
- Email  
- Name  
- Created timestamp  

---

## 📱 Usage Guide

### Create a Note
- Click **Add Note**
- Enter title + content
- Save

### Edit a Note
- Hover over a note  
- Click **Edit**  
- Save changes  

### Delete a Note
- Hover  
- Click **Delete**  
- Confirm  

### Logout
- Click **Logout** (top‑right)

---

## 📁 Project Structure

```
noteTakingApp/
│
├── server.js               # Express server + Auth0 config
├── package.json
├── .env                    # Environment variables (not included)
│
├── models/
│   └── models.js           # User + Note schemas
│
├── routers/
│   ├── authRouter.js       # Auth routes
│   └── takingRouter.js     # Notes CRUD routes
│
└── public/
    ├── index.html          # Notes UI
    ├── loggin.html         # Login page
    │
    ├── css/
    │   └── styles.css
    │
    └── js/
        ├── takingApp.js    # Notes logic
        └── loggin.js       # Login logic
```

---

## 🔌 API Endpoints

### Auth Routes (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/login` | Redirect to Auth0 |
| GET | `/auth/logout` | Logout user |
| GET | `/auth/profile` | Get logged‑in user profile |

### Notes Routes (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes for user |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

---

## 🛠️ Technologies Used

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- express‑openid‑connect  

### Frontend
- HTML5  
- CSS3 (Grid, Flexbox, variables)  
- Vanilla JavaScript  
- Google Fonts (Poppins)

### Authentication
- Auth0 (OAuth 2.0 + OIDC)

---

## 🧩 Troubleshooting

### MongoDB Not Connecting
- Ensure `mongod` is running  
- Check `MONGO_URI`  

### Auth0 Errors
- Verify Client ID, Secret, Domain  
- Check callback/logout URLs  

### Port Already in Use
Change port in `.env`:
```
PORT=4000
```

### CSS Not Updating
- Hard refresh browser  
- Clear cache  

---

## 📄 License
This project is for educational and portfolio purposes.

---
