# Quick Notes — Note Taking Application

A secure, multi-user note-taking application built with **Express.js**, **MongoDB**, and **Auth0**. The app features seamless OAuth authentication, responsive design, and a clean, modern interface.

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [User Roles & Authentication](#user-roles--authentication)
- [Application Usage](#application-usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

---

## ✨ Features

### Core Features
- **Auth0 Authentication** - Secure OAuth login with Auth0
- **User Authentication** - Automatic user sync with MongoDB
- **Note Management** - Create, read, update, and delete notes
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark/Light Theme** - Toggle between dark and light color schemes
- **Real-time Updates** - Notes update instantly in the grid

---

## 🖥️ System Requirements

- **Node.js** v14+ or higher
- **MongoDB** - Local or remote MongoDB instance
- **npm** - Node Package Manager
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge
- **Auth0 Account** - For OAuth setup

---

## 🚀 Installation & Setup

### 1. Clone or Download the Project
```bash
cd c:\Users\User\Documents\CircuitStream\DemoCode\noteTakingApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Ensure MongoDB is Running
- **Local MongoDB**: Start your MongoDB service
  ```bash
  mongod
  ```
- **Remote MongoDB**: Ensure you have internet connectivity and valid connection string

### 4. Configure Auth0

1. Create an [Auth0 account](https://auth0.com)
2. Create a new Application (Regular Web Application)
3. Go to Application Settings and note:
   - **Client ID**
   - **Client Secret**
   - **Domain**

4. Set Allowed Callback URLs:
   ```
   http://localhost:3000/callback
   ```

5. Set Allowed Logout URLs:
   ```
   http://localhost:3000
   ```

### 5. Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/notetakingapp
BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_SECRET=your_generated_secret_here
ADMIN_EMAIL=your-email@example.com
```

**Note**: To generate `AUTH0_SECRET`, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 How to Run

### Start the Server
```bash
node server.js
```

Expected output:
```
✓ MongoDB connected
✓ Server running on http://localhost:3000
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

You will be redirected to the Auth0 login page if not authenticated.

---

## 👥 User Roles & Authentication

### Authentication Flow

1. **User visits app** → Redirected to Auth0 login (if not authenticated)
2. **Auth0 login/signup** → User authenticates via Auth0
3. **User synced to MongoDB** → User profile automatically saved in database
4. **Access app** → User can create and manage notes

### User Profile
Each user has:
- **Auth0 ID** - Unique identifier from Auth0
- **Email** - From Auth0 profile
- **Name** - From Auth0 profile
- **Created At** - Timestamp of first login

---

## 📱 Application Usage

### 1. Login Process

#### First Visit
- Click **"Login"** button
- Redirected to Auth0 login page
- Enter email and password (or social login)
- Authenticated and redirected to Notes App

#### Subsequent Visits
- If already logged in, directly access the app
- Click **"Logout"** to sign out

### 2. Notes App

#### Create a Note
1. Click **"Add Note"** button (top-left)
2. Enter **Title** and **Content**
3. Click **"Save"**

#### View Notes
- All your notes appear in a responsive grid
- Notes display in order from newest to oldest
- Each note shows title and content preview

#### Edit a Note
1. Hover over a note card
2. Click **"Edit"** icon
3. Modify title or content
4. Click **"Save Changes"**

#### Delete a Note
1. Hover over a note card
2. Click **"Delete"** icon (trash)
3. Confirm deletion
4. Note is removed immediately

#### Logout
- Click **"Logout"** button (top-right)
- Redirected to Auth0 logout (and then to login page)

---

## � Project Structure

```
noteTakingApp/
│
├── server.js                 # Main Express server with Auth0 setup
├── package.json             # Dependencies
├── README.md               # This file
├── .env                    # Environment variables (create yourself)
│
├── models/
│   └── models.js           # MongoDB schemas (User & Note)
│
├── routers/
│   ├── authRouter.js       # Authentication routes
│   └── takingRouter.js     # CRUD operations (notes)
│
└── public/
    ├── index.html          # Notes app interface
    ├── loggin.html         # Login interface
    │
    ├── css/
    │   └── styles.css      # All application styles
    │
    └── js/
        ├── takingApp.js    # Notes app logic
        └── loggin.js       # Login interface logic
```

---

## 🔌 API Endpoints

### Authentication Routes (`/auth`)

#### Login
```
GET /auth/login
Redirects to Auth0 login page
```

#### Logout
```
GET /auth/logout
Logs out user and redirects to home
```

#### Get Current User Profile
```
GET /auth/profile
Response: { sub, email, name, ... }
Requires: Authentication
```

#### Get All Users (for dropdown)
```
GET /api/users
Response: [ { email, name }, ... ]
```

### Notes API Routes (`/api`)

#### Get All Notes
```
GET /api/notes
Response: [ { _id, userId, title, content, createdAt }, ... ]
Requires: Authentication
```

#### Create Note
```
POST /api/notes
Body: { title, content }
Response: { _id, userId, title, content, createdAt }
Requires: Authentication
```

#### Update Note
```
PUT /api/notes/:id
Body: { title, content }
Response: { _id, userId, title, content, createdAt }
Requires: Authentication & Ownership
```

#### Delete Note
```
DELETE /api/notes/:id
Response: { success: true }
Requires: Authentication & Ownership
```

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **express-openid-connect** - Auth0 integration
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Flexbox, Grid, Variables)
- **Vanilla JavaScript** - DOM manipulation & API calls
- **Google Fonts** - Poppins font family

### Authentication
- **Auth0** - OAuth 2.0 and OpenID Connect provider

### Development
- **npm** - Package manager
- **Express Router** - Modular routing

---

## 🎨 UI Features

### Responsive Design
- Adapts to desktop, tablet, and mobile screens
- Flexible grid layouts
- Touch-friendly buttons and forms

### Color Scheme
**Light Theme**
- Brand Color: #b98bff (Purple)
- Base Color: #f2f4f8 (Light Gray)
- Surface: #fff (White)
- Text: #1b6e3e (Dark)

**Dark Theme**
- Brand Color: #8b90ff (Light Purple)
- Base Color: #1e1f26 (Dark)
- Surface: #2c2f38 (Dark Gray)
- Text: #4ade80 (Green)

### Interactive Elements
- Hover effects on buttons and cards
- Smooth transitions
- Modal dialogs for actions
- Real-time form validation

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection error
```
**Solution**: Ensure MongoDB is running locally or update MONGO_URI in .env to valid connection string.

### Auth0 Configuration Error
```
Invalid Client ID or Client Secret
```
**Solution**: Verify your Auth0 credentials in .env file and ensure callback URLs are configured.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT in .env or kill process using port 3000.

### CSS Not Loading
**Solution**: Clear browser cache (Ctrl+Shift+Delete) and refresh page.

### Notes Not Appearing
**Solution**: Ensure you're logged in and wait for page to load. Refresh if needed.

---

## 📝 Example Workflow

### Setup & First Login
1. Start MongoDB: `mongod`
2. Configure Auth0 (see Installation & Setup)
3. Create .env file with Auth0 credentials
4. Start server: `node server.js`
5. Open browser: http://localhost:3000
6. Click Login → Auth0 page → Sign up or login
7. Redirected to Notes App
8. Start creating notes!

### Create and Manage Notes
1. Click **"Add Note"** button
2. Enter title: "My First Note"
3. Enter content: "This is great!"
4. Click **"Save"**
5. Note appears in grid
6. Hover to edit or delete
7. Click **"Logout"** when done

---

## 📧 Support

For issues or questions about the application, please refer to the code comments in:
- `server.js` - Main server setup and Auth0 configuration
- `routers/authRouter.js` - Authentication logic
- `routers/takingRouter.js` - CRUD operations
- `public/js/takingApp.js` - Notes app logic

---

## 📄 License

This is an educational project.

---

**Last Updated**: January 19, 2026  
**Version**: 2.0.0