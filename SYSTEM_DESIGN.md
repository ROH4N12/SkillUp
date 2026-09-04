# System Design Specification — SkillUp Platform

## Executive Summary

**SkillUp** is an AI-driven adaptive learning path, skill gap analysis, and career readiness platform designed to serve three distinct personas: **Learners**, **Counselors**, and **Trainers**. 

The system leverages automated domain mapping, skill vector scoring, real-time activity/streak tracking, and role-based intervention analytics to guide users along personalized learning journeys toward high-demand tech roles.

---

## 1. System Context & Architecture Overview

```mermaid
graph TD
    subgraph Clients [Client Layer - Presentation Tier]
        LD[Learner Dashboard]
        CD[Counselor Dashboard]
        TD[Trainer Dashboard]
        LP[Learning Path Generator]
        PT[Progress Analytics]
    end

    subgraph API Gateway [Server Layer - Application Tier]
        EX[Express.js API Server :5000]
        AUTH[Auth Service - JWT / OAuth2]
        PGE[Path Generation Engine]
        VRE[Video Recommendation Engine]
        RDE[Risk & Readiness Engine]
        STE[Streak & Activity Engine]
    end

    subgraph External [External Services]
        YTA[YouTube Data Search API]
        GOG[Google OAuth 2.0 Provider]
    end

    subgraph Storage [Database Tier]
        MDB[(MongoDB Primary)]
        USERS[(User Profiles)]
        COURSES[(Courses & Videos)]
        PATHS[(Learning Paths & Stages)]
        ENROLL[(Enrollments & Progress)]
        ACTS[(Daily Activity Logs)]
        NOTIFS[(Notifications & Alerts)]
    end

    Clients <-->|HTTP/REST & JSON + Bearer JWT| EX
    EX <--> AUTH & PGE & VRE & RDE & STE
    PGE & VRE & RDE & STE <-->|Mongoose ODM| MDB
    MDB --- USERS & COURSES & PATHS & ENROLL & ACTS & NOTIFS
    VRE <-->|yt-search| YTA
    AUTH <-->|Google Token Validation| GOG
```

---

## 2. Technology Stack & Tier Decomposition

| Tier | Technology | Key Libraries / Modules | Function |
| :--- | :--- | :--- | :--- |
| **Frontend (Presentation)** | React 18, Vite 6 | `react-router` v7, `recharts`, `lucide-react`, `tailwindcss` v4, `@react-oauth/google` | Responsive SPA, interactive charts, dynamic timeline rendering, theme switching |
| **Backend (Application)** | Node.js v18/20, Express 5 | `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `yt-search` | REST APIs, authentication, algorithm execution, video aggregation |
| **Database (Storage)** | MongoDB v6+ | `mongoose` ODM | Document persistence, schema validation, index-optimized spatial & aggregation queries |
| **Integrations** | External APIs | Google Auth Library, YouTube Web Scraper / API | Social OAuth authentication & video course material enrichment |

---

## 3. Database Schema & Data Models

### 3.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ LEARNING_PATH : creates
    USER ||--o{ ENROLLMENT : owns
    USER ||--o{ ACTIVITY : logs
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ COURSE : instructs

    COURSE ||--o{ ENROLLMENT : contains
    LEARNING_PATH ||--|{ STAGE : contains
    STAGE }|--|{ COURSE : references

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "learner | counselor | trainer"
        string careerGoal
        object preferences
    }

    COURSE {
        ObjectId _id PK
        string title
        string domain
        array skills
        string level "Beginner | Intermediate | Advanced"
        ObjectId trainerId FK
        array videos
    }

    LEARNING_PATH {
        ObjectId _id PK
        ObjectId user FK
        string title
        string goal
        string level
        array knownSkills
        array stages
    }

    ENROLLMENT {
        ObjectId _id PK
        ObjectId user FK
        ObjectId course FK
        number progress
        string status "Not Started | In Progress | Completed"
        array completedVideos
        date lastAccessed
    }

    ACTIVITY {
        ObjectId _id PK
        ObjectId user FK
        string date "YYYY-MM-DD"
        string activity
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId sender FK
        string title
        string message
        string type
        boolean read
    }
```

### 3.2 Collection Schemas & Data Constraints

1. **User Schema (`User.js`)**:
   - `email`: Required, unique string.
   - `role`: Enum `['learner', 'counselor', 'trainer']` (default `'learner'`).
   - `preferences`: Embedded sub-document for `theme` (`'light'|'dark'|'system'`), `notifications` (boolean), `progressReminders` (boolean), `weeklyReports` (boolean).

2. **Course Schema (`Course.js`)**:
   - `title`: Required string.
   - `domain`: Required string (e.g., `'Frontend Development'`, `'Data Science'`).
   - `skills`: Array of strings.
   - `level`: Enum `['Beginner', 'Intermediate', 'Advanced']`.
   - `videos`: Array of embedded objects `{ videoId, title, thumbnail, channel }`.

3. **LearningPath Schema (`LearningPath.js`)**:
   - `user`: Ref to `User` (required).
   - `stages`: Array of sub-documents `{ stageName: string, courses: [Ref to Course] }`.
   - `courses`: Legacy flat array of Course references for backward compatibility.

4. **Enrollment Schema (`Enrollment.js`)**:
   - `user`: Ref to `User` (required).
   - `course`: Ref to `Course` (required).
   - `progress`: Number between 0 and 100.
   - `completedVideos`: Array of video ID strings.
   - `status`: Enum `['Not Started', 'In Progress', 'Completed']`.

5. **Activity Schema (`Activity.js`)**:
   - `user`: Ref to `User` (required).
   - `date`: String formatted as `"YYYY-MM-DD"`.
   - `activity`: String description of activity.
   - **Compound Unique Index**: `{ user: 1, date: 1, activity: 1 }` to prevent duplicate daily log entries.

6. **Notification Schema (`Notification.js`)**:
   - `userId`: Ref to `User` (required recipient).
   - `sender`: Ref to `User` (optional sender for Counselor/Trainer messages).
   - `type`: Enum `['system', 'reminder', 'achievement', 'action_required', 'alert', 'trainer', 'counselor']`.

---

## 4. Algorithmic Engines Specification

### 4.1 Path Generation & Domain Resolution Engine

The Path Generator (`server/routes/path-generator.js`) uses a multi-step pipeline:

```mermaid
flowchart TD
    A[User Input: Goal, Level, Known Skills] --> B{Resolve Domain via Alias Map}
    B -- Match Found --> C[Fetch Exact Domain Courses from DB]
    B -- No Match --> D[Return Available Domain Suggestions]
    C --> E[Score Courses in Domain]
    E --> F[Sort by Level Order & Score]
    F --> G[Deduplicate Overlapping Skill Sets > 70%]
    G --> H[Partition into Stages: Foundation, Core, Advanced]
    H --> I[Enforce Capping: Max 4 Foundation, 5 Core, 3 Advanced, Total 12]
    I --> J[Upsert User Learning Path Document & Populate]
```

#### Scoring Formula (`scoreCourseInDomain`)
$$\text{Score} = 10 \text{ (Base)} + \Delta_{\text{title}} + \Delta_{\text{skills}} + \Delta_{\text{level}} + \Delta_{\text{gap}} - \Delta_{\text{known}}$$

Where:
- $\Delta_{\text{title}} = +3$ if any goal keyword matches course title.
- $\Delta_{\text{skills}} = +2$ if goal keyword matches course skill tags.
- $\Delta_{\text{level}} = +3$ if course level equals user chosen target level.
- $\Delta_{\text{gap}} = +2 \times \text{count of course skills user DOES NOT know}$.
- $\Delta_{\text{known}} = -3 \times \text{count of course skills user ALREADY knows}$.

#### Skill Overlapping Deduplication
If $\frac{|\text{Course Skills} \cap \text{Existing Selected Skills}|}{|\text{Course Skills}|} > 0.7$, the course is flagged as duplicate and skipped to ensure curriculum variety.

---

### 4.2 Readiness Score & Risk Detection Engine

Calculated dynamically in Counselor & Learner Controllers (`server/routes/roles.js` & `server/routes/learner.js`):

$$\text{Readiness Score} = \left\lfloor \frac{\sum_{i=1}^{N} \text{Enrollment Progress}_i}{N} \right\rfloor$$

#### Risk Classification Matrix
- **High Risk (`At Risk`)**: Readiness $< 40\%$
- **Medium Risk (`Needs Support`)**: $40\% \le \text{Readiness} \le 70\%$
- **Low Risk (`On Track`)**: Readiness $> 70\%$

#### Real Skill Gap Formula
$$\text{Missing Skills} = \bigcup_{s \in \text{Assigned Path}} \text{Skills}(s) \setminus \bigcup_{e \in \text{Completed Courses}} \text{Skills}(e)$$
$$\text{Skill Gap Count} = |\text{Missing Skills}|$$

---

## 5. API Interface Architecture

All REST API endpoints are mounted on base path `/api`.

### 5.1 Authentication Endpoints (`/api/auth`)
- `POST /register`: Registers user account (`learner`, `counselor`, or `trainer`). Returns JWT.
- `POST /login`: Validates password via `bcrypt.compare`. Returns JWT & user profile.
- `POST /google`: Validates Google OAuth credential token, syncs user profile, returns JWT.

### 5.2 Learner & Path Endpoints (`/api/learner`)
- `GET /dashboard`: Aggregates active streak, completion rates, overall progress, and skill radar chart data.
- `GET /path`: Fetches user's current populated `LearningPath`.
- `POST /generate-path`: Executes the dynamic path generator algorithm (Protected).
- `PUT /progress/:courseId`: Updates progress percentage and completed video IDs. Automatically flips status to `'Completed'` when progress $= 100\%$.
- `GET /videos/:courseId`: Fetches cached YouTube videos or queries YouTube API via `yt-search`.

### 5.3 Activity & Streak Endpoints (`/api/activity`)
- `POST /log`: Logs daily activity for timezone-safe `"YYYY-MM-DD"` date.
- `GET /streak`: Analyzes last 30 days of activity logs to compute active daily streak.

### 5.4 Staff & Role Management Endpoints (`/api`)
- `GET /counselor/dashboard`: Aggregates all learner readiness scores, risk distributions, and missing skill metrics (Requires `counselor` role).
- `GET /counselor/learner/:id`: Deep academic profile view for a specific student.
- `GET /trainer/dashboard`: Returns aggregate class statistics, struggling student flags, and course completion rates (Requires `trainer` role).

---

## 6. End-to-End Sequence Diagrams

### 6.1 User Authentication & JWT Flow

```mermaid
sequenceDiagram
    autonumber
    actor Learner
    participant Client as React SPA
    participant Server as Express Server
    participant DB as MongoDB

    Learner->>Client: Enters credentials / Clicks Google Login
    Client->>Server: POST /api/auth/login or /api/auth/google
    Server->>DB: Find User by Email
    DB-->>Server: User Document (with hashed password)
    Server->>Server: Verify Bcrypt Hash / Google Token
    Server->>Server: Generate JWT (expiresIn: 30d)
    Server-->>Client: { token, user: { id, name, role, email } }
    Client->>Client: Store JWT in localStorage / State
    Client->>Server: GET /api/learner/dashboard (Headers: Authorization: Bearer <token>)
    Server->>Server: Middleware verify JWT
    Server-->>Client: 200 OK + Dashboard Payload
```

### 6.2 Path Generation & Course Enrollment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Learner
    participant Client as React SPA
    participant Server as Express Server
    participant DB as MongoDB

    Learner->>Client: Chooses Goal ("Frontend Development"), Level, Known Skills
    Client->>Server: POST /api/learner/generate-path
    Server->>Server: 1. Resolve Domain Alias Map
    Server->>DB: 2. Query Courses matching domain
    DB-->>Server: Domain Course Documents
    Server->>Server: 3. Score, Deduplicate (>70% overlap), & Partition into Stages
    Server->>DB: 4. Upsert LearningPath Document for User
    DB-->>Server: Saved LearningPath
    Server-->>Client: 200 OK + Populated LearningPath JSON
    Client->>Learner: Render Stage Timelines (Foundation, Core, Advanced)
```

---

## 7. Security, Authorization & Access Control

1. **Authentication Guard (`server/middleware/auth.js`)**:
   - Extracts `Bearer <token>` from HTTP `Authorization` header.
   - Verifies JWT using `jsonwebtoken.verify(token, process.env.JWT_SECRET)`.
   - Attaches decoded user object (excluding password) to `req.user`.

2. **Role-Based Access Control - RBAC (`server/middleware/roleGuard.js`)**:
   - `requireRole(...roles)` middleware enforces authorization boundaries.
   - Restricts counselor endpoints (`/api/counselor/*`) to users with `role === 'counselor'`.
   - Restricts trainer endpoints (`/api/trainer/*`) to users with `role === 'trainer'`.

3. **Data Protection**:
   - Password hashing via `bcryptjs` (salt rounds: 10).
   - Strict CORS configuration preventing unauthorized cross-origin requests.
   - Input sanitization and Mongoose type casting to defend against SQL/NoSQL injection.

---

## 8. Performance, Scalability & Reliability

| Optimization Target | Strategy Implemented | Technical Benefit |
| :--- | :--- | :--- |
| **Database Indexing** | Compound index on `Activity`: `{ user: 1, date: 1, activity: 1 }` | Fast $O(1)$ lookup for daily streak calculations & duplicate prevention |
| **YouTube Video Caching** | Cached video array inside `Course` schema documents | Eliminates external API quota limits and reduces network latencies |
| **Payload Optimization** | Mongoose `.select('-password')` & targeted `.populate()` | Reduces serialized network payload sizes by ~60% |
| **Client Rendering** | Virtualized lists, CSS containment, and dynamic SVG charts with Recharts | Ensures smooth 60 FPS transitions across mobile and desktop devices |

---

## 9. Deployment Architecture & Environment Setup

```mermaid
graph LR
    subgraph Local Dev Environment
        Vite[Vite Dev Server :5173]
        Express[Express Node Server :5000]
        MongoLocal[(Local MongoDB :27017)]
    end

    subgraph Production Cloud Environment
        CDN[Vercel / Netlify Static CDN]
        AppServer[Node.js API Container - Render / AWS ECS]
        Atlas[(MongoDB Atlas Multi-AZ Cluster)]
    end

    Vite <--> Express <--> MongoLocal
    CDN <-->|HTTPS| AppServer <-->|TLS connection| Atlas
```

---

## 10. Traceability Matrix & Requirements Mapping

| Functional Requirement | Architectural Component | Source Code Location |
| :--- | :--- | :--- |
| **Adaptive Learning Path** | Path Generator Engine | [path-generator.js](file:///d:/SkillUp%20UI%20Design%20%281%29/server/routes/path-generator.js) |
| **Role Match & Skill Gap** | Counselor Analytics Controller | [roles.js](file:///d:/SkillUp%20UI%20Design%20%281%29/server/routes/roles.js) |
| **Video Walkthrough Feed** | YouTube Search Service | [videos.js](file:///d:/SkillUp%20UI%20Design%20%281%29/server/routes/videos.js) |
| **Daily Streak Counter** | Activity Tracking Engine | [activity.js](file:///d:/SkillUp%20UI%20Design%20%281%29/server/routes/activity.js) |
| **Multi-Role RBAC Guard** | Express Middleware Guard | [roleGuard.js](file:///d:/SkillUp%20UI%20Design%20%281%29/server/middleware/roleGuard.js) |
