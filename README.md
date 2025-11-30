# 🚀 Dynamic Form Builder (Assignment Submission)

This project is a full-stack solution for building and rendering complex forms, showcasing proficiency in modern frontend state management, dynamic UI rendering, and backend data handling.

## ✔️ Milestone Completion Status

The following core requirements have been successfully implemented and verified:

| Feature Area | Status | Notes |
| :--- | :--- | :--- |
| **Form Schema Fetching** | **Completed** | Successfully fetches the form definition from the backend API. |
| **Dynamic Rendering** | **Completed** | The application dynamically renders all specified field types based on the received schema. |
| **Client-Side Validations** | **Completed** | Implemented real-time form field validations for a better user experience. |
| **Form Submission** | **Completed** | Submits form data to the backend with clear success/error state handling. |
| **Submissions Management** | **Completed** | Displays submitted form responses in a **paginated table** for easy admin review. |
| **CRUD & Pagination** | **Completed** | Full **Create, Read, Update, Delete (CRUD)** functionality implemented for forms and fields, utilizing **pagination** for large datasets. |
| **Build Process** | **Completed** | The frontend build process correctly outputs the bundled static files (`dist/`) into the server folder for unified serving. |

---

## 🛠️ Tech Stack Used

### 💻 Frontend

* **React 19:** Modern JavaScript library for building the user interface.
* **Vite:** Next-generation frontend tooling for a fast development experience.
* **TanStack Query:** Used for server state management, caching, and synchronization.
* **TanStack Form:** Employed for declarative form state management and validation.
* **TanStack Table:** Utilized for rendering efficient, paginated tables (specifically for the submissions view).
* **TailwindCSS:** Utility-first CSS framework for rapid styling.

### ⚙️ Backend

* **Node.js + Express:** A fast, unopinionated foundation for the server-side application.
* **In-Memory/JSON Storage:** Used for persistence and rapid prototyping in this assignment environment.

---

## 🚀 Setup & Run Instructions

These instructions detail how to set up and run the application in a local development environment.

### Prerequisites

* **Node.js** (LTS version recommended)
* **npm** (or yarn/pnpm)

### 1. Install and Start the Frontend

The frontend (client) application will run on a development server, fetching data from the backend.

```bash
# Navigate to the client directory
cd client
# Install dependencies
npm install
# Start the Vite development server (usually on http://localhost:5173)
npm run dev
```

### 2. Install and Start the Backend

The backend (server) provides the API endpoints for the form schema, submissions, and CRUD operations.

# Navigate to the server directory
cd server
# Install dependencies
npm install
# Start the Express server (usually on http://localhost:3000 or specified PORT)
npm start

### Accessing the Application
Once both the frontend and backend servers are running, open your web browser and navigate to:

🌐 http://localhost:5173 (or the address indicated by the npm run dev command).