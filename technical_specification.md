# Dictation Drawing Game — Technical Specification (Vercel Stack)

**Target audience:** Kids 4–7; Teachers; Administrators

**Prepared:** 2025-11-11

---

## 1. Executive Summary

A cross-platform educational game where children listen to a spoken word, draw what they hear inside a drawing rectangle, and receive feedback and scoring. Teachers prepare weekly word sets in advance. The system supports offline local play and an online mode with teacher-managed weekly scheduling, analytics, and optional AI-assisted automatic correctness checking.

Goals:
- Simple, child-friendly UI for ages 4–7.
- Teacher workflow to upload/manage weekly words and images.
- Reliable drawing interface (touch + mouse) and audio TTS playback.
- Scoring, animations, and progress tracking.
- Scalable backend for multi-classroom deployment, optional offline-first mode.


---

## 2. Personas & Use Cases

### Personas
- **Teacher (primary):** Prepares weekly word lists, uploads images, sets active week, reviews student results.
- **Child (4–7):** Plays the game: listens, draws, submits drawings; receives immediate feedback.
- **Administrator:** Manages classrooms, users, and analytics.

### High-level Use Cases
1. Teacher uploads `words.txt`/CSV (multi-week) with optional image references.
2. Teacher sets active week (manual or schedule by date).
3. Child opens the app — app syncs active week and shows that week's words.
4. Child taps play — TTS plays the word; child draws in rectangle; child submits.
5. System checks drawing (manual rating or AI-assisted) and gives score + animation.
6. Teacher reviews per-child progress, exports results.


---

## 3. Functional Requirements

### 3.1 Word Management
- Support import formats: plain `txt`, CSV. Format examples:
  - Plain txt (single-column words):
    ```txt
    cat
    dog
    apple
    ```
  - CSV with week labels and image path:
    ```csv
    week,word,image
    1,cat,images/cat.png
    1,sun,images/sun.png
    2,dog,images/dog.png
    ```
- Backend parsing service to convert input to canonical JSON:
  ```json
  {
    "week1": [{"word":"cat","image":"/images/cat.png"}, ...],
    "week2": [...]
  }
  ```
- Allow teacher preview and edit of parsed words before activation.

### 3.2 Weekly Scheduling
- Active week can be set:
  - Manually by teacher.
  - Automatically by mapping current date to configured week start dates.
- UI: calendar-style selector + quick "Activate week X" button.

### 3.3 Kid Gameplay
- Show header: current week and progress (e.g., 3/10 words).
- Controls:
  - Play Word (play TTS)
  - Erase / Undo last stroke
  - Pen size selector (2 sizes)
  - Submit / Next
  - Show Hint (optional: show image for a short time)
- Drawing area: square/rectangle canvas, full-screen optional on tablets.
- Auto-save canvas to local storage in-progress.

### 3.4 Correctness Checking
- Modes:
  - **Manual teacher rating:** Teacher reviews submission and marks correct/incorrect or gives star rating.
  - **AI-assisted auto-check:** Use a classifier (TensorFlow.js / remote ML) trained on sketches or canonical images to produce a confidence score.
- Default flow: if AI confidence >= threshold (e.g., 0.75) → accept; else mark for teacher review.
- Teacher override permitted.

### 3.5 Scoring & Feedback
- Per-word scoring: binary (correct/incorrect) or 1–5 star rating.
- Immediate feedback for kids:
  - Correct: confetti, sound, +1 star.
  - Incorrect: encouraging message + hint option.
- Aggregate weekly score and a progress reward screen.

### 3.6 Teacher Dashboard
- List of classes and students.
- Active week control.
- Word list management (upload, edit, delete).
- Student submissions list with thumbnails and timestamps.
- Export CSV of results.

### 3.7 Offline Support
- App should be usable offline with a cached active week.
- Submissions queued locally and synced automatically when online.


---

## 4. Non-Functional Requirements

- **Platforms:** Web (desktop/tablet) first; option for React Native mobile/tablet builds.
- **Availability:** 99% SLA for hosted services during school hours (dependent on Vercel's SLA).
- **Latency:** TTS < 200ms local; sync operations asynchronous.
- **Security:** GDPR/PDPA-compliant design; least privilege access for storage.
- **Scalability:** Support thousands of students per school district.
- **Accessibility:** Large buttons, voice prompts, color contrast for children.


---

## 5. High-Level Architecture (Vercel Stack)

**Client**
- **Next.js App (PWA):** Serves both the kid's game and the teacher dashboard. Hosted on Vercel.
- Optional React Native app for offline tablets.
- Uses IndexedDB/localStorage for offline cache.

**Backend** (Vercel-native stack)
- **Auth:** NextAuth.js (integrates seamlessly with Next.js and Vercel).
- **API:** Vercel Serverless Functions (written as Next.js API Routes).
- **Database:** Vercel Postgres (fully-managed, serverless PostgreSQL).
- **Storage:** Vercel Blob for storing uploaded images and student drawings.
- **ML service (optional):** Cloud Run microservice (or other container service) for heavier ML tasks, or a client-side TensorFlow.js model. Vercel Serverless Functions can be used for light inference.
- **CDN:** Handled automatically by Vercel's Edge Network.

**DevOps**
- **CI/CD:** GitHub Actions for testing, then Vercel's native GitHub integration for automatic builds and deployments on every `git push`.
- **Monitoring:** Vercel Analytics for web vitals and Sentry for client-side error tracking.

Diagram (textual):
```
[Next.js App on Vercel Edge] <---> [Vercel Serverless Functions] <---> [Vercel Postgres]
                                         |--> [Vercel Blob]
                                         |--> [ML Service (External e.g. Cloud Run)]
```


---

## 6. Data Models

### 6.1 WordSet (stored in Vercel Postgres)
```sql
CREATE TABLE WordSets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  startDate DATE,
  endDate DATE,
  items JSONB, -- [{"word":"cat","image":"<blob_url>","order":1}, ...]
  createdBy VARCHAR(255), -- teacherUserId
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT false
);
```

### 6.2 Submission (stored in Vercel Postgres)
```sql
CREATE TABLE Submissions (
  id SERIAL PRIMARY KEY,
  studentId VARCHAR(255),
  wordId INT,
  word VARCHAR(255),
  imageURL VARCHAR(1024), -- URL from Vercel Blob
  pngThumbURL VARCHAR(1024),
  strokeData JSONB,
  autoScore JSONB, -- {"confidence":0.62, "label":"cat"}
  teacherScore JSONB, -- {"rating":4, "reviewedBy":"teacher_001","reviewedAt":"..."}
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 User
- User table for NextAuth.js, storing `userId`, `role` (teacher/student/admin), `classIds`, `displayName`, `email`, `photoURL`.


---

## 7. API & Endpoints

All endpoints are implemented as Next.js API Routes (`/pages/api/...`) and protected by NextAuth.js session management.

- `GET /api/active-week` — returns active WordSet for the requesting user/class.
- `GET /api/wordsets` — list of word sets (teacher/admin only).
- `POST /api/wordsets` — upload and create new wordset (teacher only).
- `PUT /api/wordsets/:id` — update metadata / activate.
- `POST /api/submissions` — upload a submission. The API route will handle the file upload to Vercel Blob.
- `GET /api/submissions?studentId=&weekId=` — list submissions for teacher.
- `POST /api/submissions/:id/review` — teacher marks teacherScore.
- `GET /api/exports?weekId=` — export CSV of results.

### ML
- `POST /api/ml/check` — accepts compressed stroke-data or a PNG, returns label + confidence. Hosted on Vercel for light models or an external container service for heavy models.


---

## 8. Client Implementation Details

### 8.1 Tech Choices
- Web: **Next.js with TypeScript**. Build as a PWA for offline support. Hosted on Vercel.
- Canvas: HTML5 Canvas for drawing with pointer events; keep stroke data as vector JSON (array of strokes where stroke = {color,size,points:[[x,y],...] }). Save both PNG and stroke JSON.
- TTS: Browser `speechSynthesis` for web. For native: `expo-speech`.
- Storage caching: IndexedDB (via `localForage`) for offline caching of active wordset and queued submissions.

### 8.2 Drawing Format & Upload
- Maintain two representations:
  - **Stroke JSON** (for replay, small size): list of strokes.
  - **PNG export** (for ML check and teacher review): raster snapshot of canvas.
- Upload flow: Client uploads the PNG and stroke JSON directly to a Next.js API Route, which then uses the `@vercel/blob` SDK to stream the files to Vercel Blob storage. The API route then creates the `Submission` record in Vercel Postgres.

### 8.3 Autosave & Undo
- Save stroke JSON to IndexedDB on each completed stroke.
- Allow undo of last stroke by popping strokes array and re-rendering.


---

## 9. Machine Learning (Optional)

Two options:
1. **Client-side TF.js model**
   - Small sketch-recognition model (like Google Quick, Draw! model / Teachable Machine export).
   - **Advantage:** Works offline, zero latency, no server cost.
   - **Disadvantage:** Limited accuracy and model size constraints.

2. **Server-side ML microservice**
   - Host a TensorFlow model on a dedicated container service like **Google Cloud Run** or **AWS Fargate**. The Next.js API would call this external endpoint.
   - **Advantage:** Can use powerful models; model can be updated centrally without client changes.
   - **Disadvantage:** Requires online connectivity, introduces latency, and adds operational complexity/cost. Vercel Serverless functions are not ideal for this due to execution time and memory limits on Hobby/Pro plans.

---

## 10. UX / UI Wireframes (textual)

### Teacher Dashboard
- Left nav: Classes | Word Sets | Submissions | Settings
- Main: WordSet editor (upload CSV, list of words with images), Activate Week button, Schedule picker.

### Child Play Screen
- Header: [Week X] [Progress 2/8] [Score icons]
- Center: Canvas rectangle with simple toolbar: Play (TTS), Undo, Erase, Pen size.
- Bottom: Submit, Show Hint, Next.
- After submit: overlay animation and Next button.

Accessibility notes:
- Large icons; voice labels; minimal text; optional reading of prompts.


---

## 11. Security & Privacy

- Use **NextAuth.js** for authentication and role-based access control in API routes and middleware.
- Vercel Blob access is mediated through serverless functions; public URLs for blobs should be avoided or use time-limited tokens if needed.
- Do not store personal health data. Minimize personally-identifying information.
- Provide data export & delete option for GDPR/PDPA compliance.

---

## 12. Testing Strategy

### Unit tests (Jest/Vitest)
- Parsing uploaded word files.
- Canvas stroke serialization/deserialization.
- API route logic mocks.

### Integration tests
- Testing API routes with a test database instance.
- Vercel Blob upload and retrieval.

### E2E tests
- Cypress or Playwright for teacher flows and student flows against a Vercel preview deployment.

---

## 13. Deployment & DevOps

- **Repo:** Monorepo hosted on **GitHub**.
- **CI/CD:**
  - Connect the GitHub repository to a **Vercel project**.
  - Vercel automatically builds and deploys a preview for every pull request.
  - Merges to the `main` branch are automatically deployed to production.
  - Use **GitHub Actions** for running tests (unit, integration, E2E) on each push, which acts as a gate before the Vercel deployment proceeds.
- **Backups:** Configure automated backups for the Vercel Postgres database. Vercel Blob is automatically replicated.
- **Monitoring:** Vercel Analytics and Sentry.

---

## 14. Roadmap & Milestones

**MVP (4–6 weeks)**
- Core gameplay (draw, TTS, submit)
- Teacher upload & activate week
- Offline caching for active week
- Basic teacher dashboard (list & view submissions)

**Phase 2 (6–10 weeks)**
- AI-assisted checking (client or server)
- Analytics dashboard and export
- React Native tablet app

**Phase 3 (ongoing)**
- Integrations with LMS (Classroom, School MIS)
- Advanced gamification (badges/achievements)


---

## 15. Risks & Open Questions

- **ML accuracy** for hand-drawn sketches of young kids: may be low for complex words. Mitigation: teacher review workflow, configurable thresholds.
- **Offline sync conflicts**: concurrent edits — use last-writer-wins + teacher override.
- **Image copyright & curation**: teachers may upload images; provide guidance for allowed content.


---

## 16. Appendices

### A. Example `words.txt` multi-week format
```
# week 1
cat,images/cat.png
sun,images/sun.png
apple,images/apple.png

# week 2
dog,images/dog.png
fish,images/fish.png
car,images/car.png
```

### B. Stroke JSON schema
```json
[
  {"color":"#000","size":4,"points":[[10,10],[12,12],[15,18]]},
  {"color":"#000","size":2,"points":[[40,40],[42,45]]}
]
```

### C. Sample submission CSV export columns
`studentId,studentName,weekId,word,teacherScore,autoConfidence,submittedAt,reviewedAt,reviewedBy,drawImageURL`
