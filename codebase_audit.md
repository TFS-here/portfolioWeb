# Portfolio Codebase Audit — Verifiable Results

> [!CAUTION]
> **IMPORTANT FINDING**: This codebase is NOT "TrustTrade BD". It is a **personal developer portfolio** project.
> There is zero overlap with TrustTrade BD features (no marketplace, no payments, no disputes, no buyer/seller roles).
> All counts below reflect what actually exists in `d:\protfolio`.

---

## 1. TOTAL API ENDPOINTS — **20 routes** across 5 files

**Grep command used:** `router\.(get|post|put|delete|patch)` across `/server/routes/`

| Route File | Method | Path | Auth |
|---|---|---|---|
| **authRoutes.js** (4 routes) | GET | `/api/auth/admin-exists` | `auth` (soft) |
| | POST | `/api/auth/register` | `auth` (soft) |
| | POST | `/api/auth/login` | none |
| | POST | `/api/auth/forgot-password` | none |
| | POST | `/api/auth/reset-password/:token` | none |
| **projectRoutes.js** (5 routes) | GET | `/api/projects/` | none |
| | POST | `/api/projects/` | `strictAuth` |
| | DELETE | `/api/projects/:id` | `strictAuth` |
| | PUT | `/api/projects/reorder/bulk` | `strictAuth` |
| | PUT | `/api/projects/:id` | `strictAuth` |
| **statRoutes.js** (4 routes) | GET | `/api/stats/` | none |
| | POST | `/api/stats/` | `strictAuth` |
| | PUT | `/api/stats/:id` | `strictAuth` |
| | DELETE | `/api/stats/:id` | `strictAuth` |
| **messageRoutes.js** (3 routes) | POST | `/api/messages/` | none |
| | GET | `/api/messages/` | `strictAuth` |
| | DELETE | `/api/messages/:id` | `strictAuth` |
| **resumeRoute.js** (3 routes) | GET | `/api/resume/` | none |
| | POST | `/api/resume/upload` | `strictAuth` + `multer` |
| | DELETE | `/api/resume/delete` | `strictAuth` |

**Plus 1 root health check:** `GET /` (inline in `index.js`)

**TOTAL: 20 route handlers** (or 21 including root health check)

> Note: None of the expected TrustTrade routes exist — no `/orders`, `/payment`, `/wallet`, `/disputes`, `/chat`, `/reviews`, `/qa`, `/admin/` API routes.

---

## 2. DATA MODELS — **5 Mongoose models**

| # | Model Name | File | Fields |
|---|---|---|---|
| 1 | `User` | [User.js](file:///d:/protfolio/server/models/User.js) | email, password, resetPasswordToken, resetPasswordExpires |
| 2 | `Message` | [Message.js](file:///d:/protfolio/server/models/Message.js) | name, email, message, date |
| 3 | `Project` | [Project.js](file:///d:/protfolio/server/models/Project.js) | title, description, techStack[], liveLink, repoLink, image, order |
| 4 | `Resume` | [Resume.js](file:///d:/protfolio/server/models/Resume.js) | resumeUrl, resumePublicId |
| 5 | `Stat` | [Stat.js](file:///d:/protfolio/server/models/Stat.js) | platform, link, totalSolved, totalContests, rating, highestRating, iconColor |

**TOTAL: 5 models**

---

## 3. FRONTEND SCALE

### Pages — **4 page components** (no subdirectory breakdown)

| Page File | Path | Lines |
|---|---|---|
| `Admin.js` | [pages/Admin.js](file:///d:/protfolio/client/src/pages/Admin.js) | 534 |
| `Home.js` | [pages/Home.js](file:///d:/protfolio/client/src/pages/Home.js) | 107 |
| `Login.js` | [pages/Login.js](file:///d:/protfolio/client/src/pages/Login.js) | 96 |
| `ResetPassword.js` | [pages/ResetPassword.js](file:///d:/protfolio/client/src/pages/ResetPassword.js) | 57 |

> No admin/auth/buyer/seller subdirectories exist. All pages are flat under `/pages/`.

### Reusable Components — **6 components**

| Component | Lines |
|---|---|
| `AdminResumeUpload.js` | 127 |
| `CodingStats.js` | 74 |
| `Footer.js` | 132 |
| `Hero.js` | 156 |
| `Navbar.js` | 39 |
| `Skills.js` | 41 |

### Custom Hooks — **0**

- No `/hooks/` directory exists
- No `useXxx` custom hook functions found in codebase

### Context Providers — **0**

- No `/context/` directory exists
- No `createContext`, `useContext`, or `.Provider` patterns found

---

## 4. SOCKET.IO EVENTS — **0**

- No `socket.io` dependency in either `server/package.json` or `client/package.json`
- No `/server/sockets/` directory exists
- No `socket.emit`, `socket.on`, or `io()` calls found anywhere in the codebase
- **Real-time features: none**

---

## 5. MIDDLEWARE / SECURITY LAYERS

| Middleware | File | Applied Where |
|---|---|---|
| `express.json()` | built-in | Global — all routes |
| `cors()` (all origins `*`) | `cors` package | Global — all routes |
| `auth` (soft JWT) | [middleware/auth.js](file:///d:/protfolio/server/middleware/auth.js) | Per-route: `POST /api/auth/register` only. Does NOT block if no token — passes `req.user = null` |
| `strictAuth` (hard JWT) | [middleware/strictAuth.js](file:///d:/protfolio/server/middleware/strictAuth.js) | Per-route: all write/delete routes on projects, stats, messages, resume |
| `multer` (file upload) | [utils/upload.js](file:///d:/protfolio/server/utils/upload.js) | Per-route: `POST /api/resume/upload` only |
| `cloudinary` (cloud storage) | [utils/upload.js](file:///d:/protfolio/server/utils/upload.js) | Used inside resume and project route handlers |

**NOT present (confirmed by search):**
- ❌ `helmet` — not installed, not used
- ❌ `express-rate-limit` — not installed
- ❌ `mongo-sanitize` / `express-mongo-sanitize` — not installed
- ❌ Global error handling middleware — no `app.use((err, req, res, next) => ...)` found
- ❌ CORS is configured with `origin: '*'` (open to all origins)

---

## 6. CODEBASE SIZE

**Method:** `Get-ChildItem -Recurse *.js,*.jsx | Where-Object { $_.FullName -notmatch 'node_modules' }` + line counts

### Backend (`/server/`) — Source files only

| File | Lines |
|---|---|
| index.js | 46 |
| middleware/auth.js | 24 |
| middleware/strictAuth.js | 22 |
| models/Message.js | 10 |
| models/Project.js | 13 |
| models/Resume.js | 8 |
| models/Stat.js | 13 |
| models/User.js | 10 |
| routes/authRoutes.js | 139 |
| routes/messageRoutes.js | 78 |
| routes/projectRoutes.js | 64 |
| routes/resumeRoute.js | 74 |
| routes/statRoutes.js | 32 |
| utils/upload.js | 17 |
| **BACKEND TOTAL** | **550 lines** |

### Frontend (`/client/src/`) — Source files only

| File | Lines |
|---|---|
| App.js | 39 |
| App.test.js | 8 |
| config.js | 1 |
| index.js | 17 |
| reportWebVitals.js | 13 |
| setupTests.js | 5 |
| components/AdminResumeUpload.js | 127 |
| components/CodingStats.js | 74 |
| components/Footer.js | 132 |
| components/Hero.js | 156 |
| components/Navbar.js | 39 |
| components/Skills.js | 41 |
| pages/Admin.js | 534 |
| pages/Home.js | 107 |
| pages/Login.js | 96 |
| pages/ResetPassword.js | 57 |
| **FRONTEND TOTAL** | **1,446 lines** |

| | Lines |
|---|---|
| Backend | 550 |
| Frontend | 1,446 |
| **Grand Total** | **~1,996 lines** |

> Excludes: `node_modules`, build artifacts, config files (`tailwind.config.js`, `postcss.config.js`), CSS files, SVGs, JSON.

---

## 7. THIRD-PARTY INTEGRATIONS

### Server (`server/package.json` dependencies)

| Package | Purpose | Status |
|---|---|---|
| `cloudinary` v2.9.0 | Image/file cloud storage | ✅ Actively used (resume + project images) |
| `nodemailer` v7.0.11 | Email (password reset) | ✅ Actively used in `authRoutes.js` |
| `bcryptjs` v3.0.3 | Password hashing | ✅ Used in auth routes |
| `jsonwebtoken` v9.0.3 | JWT auth tokens | ✅ Used in both middleware files |
| `multer` v2.1.1 | File upload handling | ✅ Used in resume upload |
| `mongoose` v9.0.1 | MongoDB ODM | ✅ Core DB layer |
| `express` v5.2.1 | HTTP framework | ✅ Core server |
| `cors` v2.8.5 | CORS headers | ✅ Global middleware |
| `dotenv` v17.2.3 | Env var loading | ✅ Config management |

### Client (`client/package.json` dependencies)

| Package | Purpose |
|---|---|
| `axios` v1.13.2 | HTTP client for API calls |
| `react-router-dom` v7.10.1 | Client-side routing |
| `framer-motion` v12.23.25 | UI animations |
| `react-icons` v5.5.0 | Icon library |
| `tailwindcss` v3.4.17 | CSS utility framework |
| `cloudinary` v2.9.0 | (listed but unnecessary on client — uploads go through backend) |
| `multer` v2.1.1 | (listed but unnecessary on client — server-side only tool) |

**NOT present (confirmed missing):**
- ❌ SSLCommerz — no payment gateway
- ❌ Pathao — no delivery/logistics API
- ❌ PDFKit — no PDF generation
- ❌ Socket.io — no real-time
- ❌ Redis / Bull — no queues
- ❌ Stripe / PayPal — no payment processing
- ❌ Firebase / Twilio — no SMS/push

**TOTAL external services: 2** (Cloudinary + Nodemailer/SMTP)

---

## 8. DATABASE COLLECTIONS

Based on the 5 registered Mongoose models, the expected MongoDB collections are:

| Collection | Model | Purpose | Estimated Docs |
|---|---|---|---|
| `users` | User | Admin user(s) | 1 (single admin setup) |
| `projects` | Project | Portfolio projects | Unknown (admin-managed) |
| `stats` | Stat | Coding platform stats (LeetCode, etc.) | Unknown (admin-managed) |
| `messages` | Message | Contact form submissions | Unknown |
| `resumes` | Resume | Single resume file URL | Max 1 (replace-on-upload pattern) |

> No seed data files found. No `/seeds/`, `/scripts/`, or test fixture files exist in the repo.
> Cannot confirm live document counts without connecting to the running MongoDB instance.
> The `users` collection likely holds exactly 1 document (single admin model).

---

## SUMMARY TABLE

| Metric | Actual Count |
|---|---|
| API endpoints | 20 (+ 1 health check) |
| Route files | 5 |
| Mongoose models | 5 |
| MongoDB collections | 5 |
| Frontend pages | 4 |
| Reusable components | 6 |
| Custom hooks | 0 |
| Context providers | 0 |
| Socket.IO events | 0 |
| Security middleware layers | 3 (auth, strictAuth, multer) |
| External service integrations | 2 (Cloudinary, Nodemailer) |
| Backend LOC | ~550 |
| Frontend LOC | ~1,446 |
| **Total LOC** | **~1,996** |
