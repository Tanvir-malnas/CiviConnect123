# CiviConnect — Real-Time Civic Complaint Reporting Platform

[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CiviConnect** is a modern, real-time civic complaint reporting platform designed as a demonstration-ready **college project MVP**. It bridges the gap between citizens and municipal authorities: citizens report localized infrastructure hazards (potholes, water leaks, overflowing garbage, broken streetlights) with photographic proof and interactive GPS pins, while city administrators triage, dispatch field departments, track status progressions, and upload verification proof.

---

## 🌟 Key Features

### 👤 Citizen Portal
- **Interactive Issue Reporting**: File grievances with category tags, title, description, photographic evidence, and precise Leaflet GPS map pinpointing.
- **Geolocation Support**: "Use My Current Location" button fetches browser GPS and automatically reverse-geocodes to the street address via OpenStreetMap.
- **Live Public Feed**: Real-time incoming grievance stream powered by Socket.IO with multi-stage filter pills (Roads, Waste, Water, Streetlights, Drainage, Other) and text search.
- **Support & Corroboration**: Community upvoting ("Me too!") and real-time public comments for collective civic verification.
- **Dynamic Visual Stepper**: Vertical status timeline displaying real-time stage progression (`Submitted` → `Verified` → `Assigned` → `In Progress` → `Resolved` / `Rejected`) with official audit remarks.
- **Personal Grievance Tracking**: "My Complaints" dashboard for reviewing personal filings.

### 🏛️ Municipal Administration Console
- **Unified Command Center**: Live grievance queue with tabular filtering, search, and state-of-the-art Leaflet map plotting all city complaints color-coded by status.
- **Status Progression & Audit Trail**: Update status with official remarks that stream instantly to citizen screens without page refresh.
- **Department & Field Dispatching**: Assign responsible municipal departments (Roads, SWM, Water, Electricity, Sewerage) and field engineers.
- **Resolution Proof Upload**: Upload photographic evidence of completed repair work to close grievances.
- **Civic Analytics & KPI Dashboard**: Interactive data visualizations (Recharts) detailing resolution rates, status distribution, category breakdown, and average resolution time.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, TailwindCSS |
| **Mapping** | Leaflet.js, React-Leaflet, OpenStreetMap Tiles & Nominatim Reverse Geocoding |
| **Real-Time Sync**| Socket.IO (Client & Server Room Architecture) |
| **Backend** | Node.js (ES Modules), Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **File Uploads** | Multer (local disk storage in `/uploads`, easily swappable for S3/Cloudinary) |
| **Data Viz** | Recharts (Responsive Bar and Pie charts) |
| **Notifications**| React Hot Toast |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [MongoDB](https://www.mongodb.com/) running locally (e.g. `mongodb://127.0.0.1:27017/civiconnect`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

---

### Step 1: Clone or Navigate to Project
```bash
cd civiconnect
```

---

### Step 2: Backend Setup (`server/`)

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   A default `.env` file is already created. For custom setups or MongoDB Atlas, copy `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/civiconnect
   JWT_SECRET=supersecretciviconnectjwtkey1234567890
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed the Database with realistic sample data**:
   Populates 1 admin, 3 citizens, and 12+ real complaints across Mumbai with coordinates, photos, status histories, and comments:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Server will run at `http://localhost:5000` with real-time Socket.IO ready.*

---

### Step 3: Frontend Setup (`client/`)

1. Open a second terminal and navigate to `client`:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   A default `.env` file is already present. Verify:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_SERVER_URL=http://localhost:5000
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Client will run at `http://localhost:5173`.*

---

## 🔑 Default Credentials (from Seed Script)

| Role | Email | Password | Access |
|---|---|---|---|
| **Municipal Admin** | `admin@civiconnect.com` | `Admin@123` | Full Admin Console, Analytics, Status Overrides, Dispatch |
| **Sample Citizen 1**| `rahul@gmail.com` | `Password@123` | File Complaints, Upvote, Comment, Track Issues |
| **Sample Citizen 2**| `priya@gmail.com` | `Password@123` | Citizen Access |
| **Sample Citizen 3**| `amit@gmail.com` | `Password@123` | Citizen Access |

> **College Presentation Tip:** The Login page includes convenient **"Demo Quick-Fill"** buttons to log in as Admin or Citizen with a single click!

---

## 🎬 College Presentation & Demo Walkthrough

Follow this 4-step script for an impressive project demonstration:

1. **Step 1: Real-Time Multi-Window Demonstration**:
   - Open two browser windows side-by-side:
     - Window A: Logged in as Citizen (`rahul@gmail.com`) on the Public Feed (`http://localhost:5173`).
     - Window B: Logged in as Municipal Admin (`admin@civiconnect.com`) on the Admin Dashboard (`http://localhost:5173/admin/dashboard`).
2. **Step 2: Submit a Complaint with Photo & GPS**:
   - In Window A, click **"Report Issue"**.
   - Select "Roads & Potholes", enter a title, upload a photo, and click on the Leaflet map to drop a pin.
   - Click **Submit Complaint**.
   - **Observe**: Window B (Admin Dashboard) immediately alerts and receives the complaint in the table and map **without any page reload** via `complaint:new` socket event!
3. **Step 3: Admin Triage & Live Citizen Timeline Update**:
   - In Window A, keep the Complaint Detail page open (viewing the vertical resolution timeline).
   - In Window B (Admin), click **Manage** on that complaint.
   - Assign the "Roads & Traffic Dept", change the status to "In Progress", and type an audit note: *"Repair crew deployed with asphalt roller."* Click **Update Status**.
   - **Observe**: Window A's timeline instantly advances to "In Progress" with the note and timestamp appearing live!
4. **Step 4: Upload Resolution Proof & Inspect Analytics**:
   - In Admin view, upload a resolution photo and click **Upload Proof & Mark Resolved**.
   - Navigate to **Analytics** (`/admin/analytics`) to display the live Recharts bar/pie charts and average resolution metrics calculated directly from MongoDB.

---

## 📡 Real-Time Socket.IO Event Architecture

- **`complaint:new`**: Broadcasts newly submitted complaint to public feed listeners and administrative command center.
- **`complaint:statusUpdate`**: Emitted when status changes. Scoped to room `complaint_<id>` for detail page listeners and broadcasted to global feed listeners.
- **`complaint:assigned`**: Broadcasts department and field personnel assignment updates.
- **`complaint:comment`**: Broadcasts new community comments live inside room `complaint_<id>`.

---

## 📂 Project Structure

```
civiconnect/
├── server/
│   ├── src/
│   │   ├── config/db.js              # MongoDB Mongoose connection
│   │   ├── models/User.js            # User Schema (citizen, admin)
│   │   ├── models/Complaint.js       # Complaint Schema (statusHistory, upvotes, comments)
│   │   ├── middleware/authMiddleware.js   # JWT token protection
│   │   ├── middleware/adminMiddleware.js  # Municipal Admin guard
│   │   ├── middleware/uploadMiddleware.js # Multer diskStorage
│   │   ├── controllers/authController.js       # Auth logic
│   │   ├── controllers/complaintController.js  # Grievance CRUD + Sockets
│   │   ├── controllers/adminController.js      # Status overrides & Analytics
│   │   ├── routes/authRoutes.js
│   │   ├── routes/complaintRoutes.js
│   │   ├── routes/adminRoutes.js
│   │   ├── sockets/socketHandler.js  # Real-time rooms & event emitters
│   │   ├── utils/generateToken.js    # JWT utility
│   │   └── app.js                    # Express app & static uploads
│   ├── uploads/                      # Uploaded complaint and proof photos
│   ├── seed/seedData.js              # Database seeder (Admin + Citizens + Mumbai issues)
│   ├── server.js                     # HTTP server + Socket.IO bootstrap
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/axiosInstance.js      # Axios instance with Bearer interceptor
│   │   ├── context/AuthContext.jsx   # Authentication context & storage
│   │   ├── context/SocketContext.jsx # Socket.IO client provider
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive navigation & live indicator
│   │   │   ├── ComplaintCard.jsx     # Feed card with upvote toggle
│   │   │   ├── StatusBadge.jsx       # Color-coded status badge
│   │   │   ├── StatusTimeline.jsx    # Vertical multi-stage progression stepper
│   │   │   ├── MapPicker.jsx         # Leaflet pin dropper + Geolocation
│   │   │   ├── MapView.jsx           # Leaflet multi-pin status map
│   │   │   └── ProtectedRoute.jsx    # Role-based route guards
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Live public feed with search & filters
│   │   │   ├── Login.jsx             # Login with quick-fill demo buttons
│   │   │   ├── Signup.jsx            # Citizen registration
│   │   │   ├── CreateComplaint.jsx   # Grievance reporting form
│   │   │   ├── ComplaintDetail.jsx   # Detail view, comments & live timeline
│   │   │   ├── MyComplaints.jsx      # Citizen's personal issues
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx       # Admin table & incident map
│   │   │   │   ├── AdminComplaintDetail.jsx # Status update & proof upload
│   │   │   │   └── AdminAnalytics.jsx       # Recharts KPI & distribution graphs
│   │   ├── App.jsx                   # Router & routes
│   │   └── main.jsx                  # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

---

## 🌐 Production Deployment Guide

- **Backend (Node/Express + Socket.IO)**:
  - Deploy to **Render** or **Railway**. Both support WebSockets out of the box.
  - Set Environment Variables: `MONGO_URI` (from MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL` (your deployed frontend URL).
  - Storage note: For persistent image uploads in production, swap Multer diskStorage with Cloudinary or AWS S3 (documented in `server/src/middleware/uploadMiddleware.js`).
- **Database (MongoDB Atlas)**:
  - Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
  - Whitelist all IP addresses (`0.0.0.0/0`) in Network Access and copy the connection string into `MONGO_URI`.
- **Frontend (React/Vite)**:
  - Deploy to **Vercel** or **Netlify**.
  - Configure Environment Variables: `VITE_API_URL` and `VITE_SOCKET_URL` pointing to your deployed backend URL.
