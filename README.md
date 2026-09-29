# ResearchLink

ResearchLink is a web application for coordinating student research projects and theses. Students can submit proposals, request supervisors, share files and links, and follow deadlines and feedback. Teachers and administrators can manage supervision, research work, submissions, and progress.

## Features

- **Role-based workspaces:** Student, Teacher, Co-Admin, and Admin dashboards.
- **Account management:** Login, registration, profile editing, profile pictures, password changes, and password reset.
- **Student project workflow:** Submit a project proposal, request a supervisor, upload and download files, share resource links, and view feedback.
- **Supervision management:** Teachers can review supervision requests, manage assigned students, and give feedback.
- **Thesis management:** Create and manage thesis records, assign supervisors, update status and deadlines, upload files, and provide feedback.
- **Deadline tracking:** Teachers can create deadlines; students can submit files and receive reviews or reply to feedback.
- **Notifications:** View notifications and mark them read or delete them.
- **Administration:** Manage students, teachers, and co-admins; assign supervisors; and review projects and theses.

## Technology

- **Frontend:** React, Vite, React Router, Redux Toolkit, Axios, and Tailwind CSS
- **Backend:** Node.js, Express, and Mongoose
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens and bcrypt
- **File uploads and email:** Multer and Nodemailer

## Project structure

```text
.
├── client/                 # React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Shared layouts and UI components
│       ├── lib/            # Shared utilities and Axios configuration
│       ├── pages/          # Pages grouped by role and feature
│       └── store/          # Redux store and slices
└── server/                 # Express API
    ├── config/             # Database and authentication configuration
    ├── controllers/        # API request handlers
    ├── middlewares/        # Authentication, uploads, and error handling
    ├── models/             # Mongoose models
    ├── router/             # API routes
    ├── services/           # Business logic, email, and file services
    ├── uploads/            # Uploaded files (created by the server)
    └── utils/              # Shared helpers and email templates
```

## Requirements

- Node.js and npm
- A MongoDB database, either local or hosted
- SMTP credentials if you want password-reset emails to be sent

## Local setup

### 1. Install dependencies

From the repository root, install the backend and frontend dependencies in their respective folders:

```powershell
cd server
npm install
cd ..\client
npm install
```

### 2. Point the frontend to the local API

The Axios client currently uses the deployed API URL. To use the local backend, change `baseURL` in `client/src/lib/axios.js` to:

```js
baseURL: "http://localhost:4000/api/v1",
```

The backend allows requests from `http://localhost:5173` and the deployed frontend origin `https://research-link-ten.vercel.app`.

### 3. Start the applications

Open two terminals from the repository root.

In the first terminal, start the API:

```powershell
cd server
npm run dev
```

The API listens on port `4000` by default (or the port set by `PORT`).

In the second terminal, start the frontend:

```powershell
cd client
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

Run these commands from the relevant folder:

| Folder | Command | Description |
| --- | --- | --- |
| `client/` | `npm run dev` | Start the Vite development server |
| `client/` | `npm run build` | Build the frontend for production |
| `client/` | `npm run preview` | Preview the production frontend build |
| `client/` | `npm run lint` | Run ESLint on the frontend |
| `server/` | `npm start` | Start the API with Node.js |
| `server/` | `npm run dev` | Start the API with Nodemon |

## API route groups

The API base path is `/api/v1`. Routes are grouped under:

- `/auth` — registration, login, profile, and password operations
- `/admin` — user, project, thesis, and supervisor administration
- `/student` — proposals, supervisor requests, project files, links, and feedback
- `/teacher` — requests, assigned students, files, feedback, and project progress
- `/project` — project file downloads
- `/thesis` — thesis records, files, deadlines, and feedback
- `/deadline` — deadline creation, submissions, and reviews
- `/notification` — notification listing and read/delete actions

Most API routes require authentication; role-specific operations are restricted by user role.

## Deployment notes

- Update the Axios `baseURL` in `client/src/lib/axios.js` for the API environment you deploy to.
- Configure the backend environment variables and CORS origins for your deployment domains.
- Uploaded files are stored on the server filesystem under `server/uploads/`. Use persistent storage if deploying to an environment with ephemeral filesystems.
- Configure a working SMTP provider to enable password-reset email delivery.

## License

No license is currently specified in this repository.
