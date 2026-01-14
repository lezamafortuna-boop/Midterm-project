# Quick Notes — Note Taking Application

A secure, multi-user note-taking application built with **Express.js**, **MongoDB**, and **Passport.js**. The app features role-based access control with an admin panel for user management, responsive design, and a clean, modern interface.

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [User Roles & Authentication](#user-roles--authentication)
- [Application Usage](#application-usage)
- [Admin Panel](#admin-panel)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

---

## ✨ Features

### Core Features
- **User Authentication** - Secure login with Passport.js and bcrypt password hashing
- **User Selection** - Simple interface to select user before entering password
- **Note Management** - Create, read, update, and delete notes
- **User Limit** - Maximum of 4 registered users (configurable)
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark/Light Theme** - Toggle between dark and light color schemes
- **Real-time Updates** - Notes update instantly in the grid

### Admin Features
- **User Management** - View, edit, and delete user accounts
- **Password Reset** - Change user passwords from admin panel
- **User Username Edit** - Rename user accounts
- **Notes Management** - Admin can delete users along with their notes
- **Admin Protection** - Admin account cannot be edited or deleted
- **Admin Dashboard** - Dedicated admin panel for management tasks

---

## 🖥️ System Requirements

- **Node.js** v14+ or higher
- **MongoDB** - Local or remote MongoDB instance
- **npm** - Node Package Manager
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge

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

### 4. Environment Variables (Optional)
Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/notetakingapp
```

### 5. Initialize Admin User
The admin user is automatically created on first server startup:
- **Username**: `lezama24`
- **Password**: `Lezama2402!`

---

## 🏃 How to Run

### Start the Server
```bash
node server.js
```

Expected output:
```
✓ MongoDB connected
✓ Admin user already exists
✓ Total registered users: 2
Server running on http://localhost:3000
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

You will be redirected to the login page if not authenticated.

---

## 👥 User Roles & Authentication

### User Roles

#### 1. **Regular User**
- Can **create** personal notes
- Can **edit** their own notes
- Can **delete** their own notes
- Can **view** only their own notes
- Cannot access admin panel
- Cannot view or manage other users

#### 2. **Admin User**
- Has all regular user privileges
- **Admin Username**: `lezama24`
- **Admin Password**: `Lezama2402!`
- Can access **Admin Panel**
- Can view all registered users
- Can **edit** user information (username & password)
- Can **delete** users (including all their notes)
- **Cannot be deleted or modified** (admin account is protected)
- Automatically redirected to Admin Panel on login

### User Limit
- **Maximum Users**: 4 total
- **Current Available Slots**: Depends on number of registered users
- When limit is reached, new user registration is **blocked**
- Message: "Maximum 4 users allowed. Cannot register more users."

---

## 📱 Application Usage

### 1. Login Process

#### First Screen - User Selection
- App displays all registered users as clickable buttons
- Select your username from the list
- If you're a new user, click **"Register New User"** button

#### Second Screen - Password Entry
- Enter your password
- Click **"Login"** button
- If admin user logs in → **Redirected to Admin Panel**
- If regular user logs in → **Redirected to Notes App**

#### Error Handling
- **Invalid Password**: "Invalid password." message displayed
- **User Not Found**: "Login failed." message
- **Server Error**: "An error occurred." message

### 2. Registration Process

#### Register New User (if slots available)
1. On login screen, click **"Register New User"**
2. Enter desired **username**
3. Enter desired **password**
4. Click **"Register"**
5. Success message displays
6. Automatically redirected to login screen
7. Select new username and login

#### Registration Errors
- **Username Already Exists**: "Username already exists."
- **User Limit Reached**: "Maximum 4 users allowed. Cannot register more users."
- **Missing Fields**: "Missing username or password"

### 3. Notes App (Regular User)

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
3. Note is removed immediately

#### Logout
- Click **"Logout"** button (top-right)
- Redirected to login page

### 4. Admin Dashboard

#### Access Admin Panel
- Login as **lezama24**
- Automatically redirected to Admin Panel
- Or click **"Go to Notes App"** to access notes features

#### View Users
- Admin panel displays all registered users in a table
- Shows username and action buttons
- Admin account labeled as **(Admin)** - protected from editing/deletion

#### Edit User
1. Click **"Edit"** button next to user
2. Dialog opens with username and password fields
3. **Change Username** (optional) - must be unique
4. **Change Password** (optional) - leave blank to keep current
5. Click **"Save Changes"**
6. User table refreshes automatically

#### Delete User
1. Click **"Delete"** button next to user
2. Confirmation dialog appears
3. Warning: "This action cannot be undone. All notes for this user will be deleted."
4. Click **"Delete User"** to confirm
5. User and all their notes are permanently removed
6. User table refreshes automatically

#### Refresh User List
- Click **"Refresh Users"** button to reload the user list
- Useful after making changes in another window

#### Additional Features
- **Go to Notes App**: Switch to regular note-taking features
- **Logout**: Return to login page

---

## 🔐 Admin Panel

### Admin Account Protection
- Admin account (`lezama24`) **cannot be edited** or **deleted**
- Attempting to modify admin shows error: "Cannot modify admin account"
- Attempting to delete admin shows error: "Cannot delete admin account"

### Admin Actions Log
All admin actions are logged to console:
- ✓ User updated
- ✓ User deleted
- ✓ Admin user already exists
- ✓ New user registered

### User Management Table
| Username | Actions |
|----------|---------|
| User1 | Edit, Delete |
| User2 | Edit, Delete |
| lezama24 | (Admin) |

---

## 📁 Project Structure

```
noteTakingApp/
│
├── server.js                 # Main Express server (routes & setup only)
├── package.json             # Dependencies
├── README.md               # This file
├── seedAdmin.js            # (Can be deleted - functionality in authRouter)
│
├── models/
│   └── models.js           # MongoDB schemas (User & Note)
│
├── routers/
│   ├── authRouter.js       # Authentication (login, register, admin init)
│   └── takingRouter.js     # CRUD operations (notes & admin endpoints)
│
└── public/
    ├── index.html          # Notes app interface
    ├── loggin.html         # Login & registration interface
    ├── admin.html          # Admin panel interface
    │
    ├── css/
    │   └── styles.css      # All application styles
    │
    └── js/
        ├── takingApp.js    # Notes app logic
        ├── loggin.js       # Login & auth logic
        └── admin.js        # Admin panel logic
```

---

## 🔌 API Endpoints

### Authentication Routes (`/auth`)

#### User Selection
```
GET /auth/users
```
Returns all registered usernames for login screen selection.

#### User Login
```
POST /auth/login
Body: { username, password }
Success: Redirects to / (redirects to admin or notes based on user)
Failure: Redirects to /auth/login?loginError=1
```

#### User Registration
```
POST /auth/register
Body: { username, password }
Response: { success: true, message: "User registered successfully" }
Error: { error: "Error message" }
```

#### User Logout
```
GET /auth/logout
Response: Redirects to /auth/login
```

#### Admin User Management
```
GET /auth/admin/users
PUT /auth/admin/users/:id
DELETE /auth/admin/users/:id
```

### Notes API Routes (`/api`)

#### Get All Notes
```
GET /api/notes
Response: [ { _id, userId, title, content, createdAt }, ... ]
```

#### Create Note
```
POST /api/notes
Body: { title, content }
Response: { _id, userId, title, content, createdAt }
```

#### Update Note
```
PUT /api/notes/:id
Body: { title, content }
Response: { _id, userId, title, content, createdAt }
```

#### Delete Note
```
DELETE /api/notes/:id
Response: { success: true }
```

### Admin API Routes (`/api/admin`)

#### Get All Users (Admin Only)
```
GET /api/admin/users
Response: [ { _id, username }, ... ]
Requires: Admin authentication (lezama24)
```

#### Update User (Admin Only)
```
PUT /api/admin/users/:id
Body: { username?, password? }
Response: { success: true, user: { _id, username } }
Requires: Admin authentication
```

#### Delete User (Admin Only)
```
DELETE /api/admin/users/:id
Response: { success: true, message: "User deleted" }
Requires: Admin authentication
```

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **express-session** - Session management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Flexbox, Grid, Variables)
- **Vanilla JavaScript** - DOM manipulation & API calls
- **Google Fonts** - Poppins font family

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
- Text: #191b23 (Dark)

**Dark Theme**
- Brand Color: #8b90ff (Light Purple)
- Base Color: #1e1f26 (Dark)
- Surface: #2c2f38 (Dark Gray)
- Text: #f0f0f0 (Light)

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
**Solution**: Ensure MongoDB is running locally or update MONGO_URI to valid connection string.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT in .env or kill process using port 3000.

### Admin User Not Created
```
✗ Error initializing admin
```
**Solution**: Check MongoDB connection and ensure write permissions.

### CSS Not Loading
**Solution**: Clear browser cache (Ctrl+Shift+Delete) and refresh page.

### Notes Not Appearing
**Solution**: Ensure you're logged in and wait for page to load. Refresh if needed.

---

## 📝 Example Workflow

### Setup & First Login
1. Start MongoDB: `mongod`
2. Start server: `node server.js`
3. Open browser: http://localhost:3000
4. Select user: **lezama24**
5. Enter password: **Lezama2402!**
6. Redirected to Admin Panel

### Create Regular User
1. On login screen, click **"Register New User"**
2. Username: `john_doe`
3. Password: `SecurePass123`
4. Register and login
5. Redirected to Notes App
6. Start creating notes!

### Admin Management
1. Login as admin (lezama24)
2. View users in admin panel
3. Click Edit to change user password
4. Click Delete to remove user (and their notes)
5. Click "Go to Notes App" to create/manage your own notes

---

## 📧 Support

For issues or questions about the application, please refer to the code comments in:
- `routers/authRouter.js` - Authentication logic
- `routers/takingRouter.js` - CRUD operations
- `public/js/loggin.js` - Login interface
- `public/js/admin.js` - Admin panel logic

---

## 📄 License

This is a midterm project for educational purposes.

---

**Last Updated**: January 13, 2026  
**Version**: 1.0.0