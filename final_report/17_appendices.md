# 12. Appendices

## Appendix A: User Guide

### A.1 System Installation and Setup

#### Prerequisites
- Node.js version 18 or higher
- MongoDB (local installation or MongoDB Atlas cluster)
- Git

#### Backend Setup
1. Navigate to the `backend/` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   - `PORT=5000`
   - `MONGO_URI=mongodb://127.0.0.1:27017/Sparehub_DB`
   - `JWT_SECRET=your_secret_key`
4. Start the server: `node server.js`

#### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The application will be available at `http://localhost:5173`

#### Database Seeding (Optional)
Run `node seed.js` from the backend directory to populate the database with sample data.

### A.2 Minimum Platform Specification
- Processor: Intel i5 or equivalent
- RAM: 8GB minimum
- Storage: 50GB free space (SSD recommended)
- Operating System: Windows 10/11, macOS, or Linux
- Browser: Chrome, Firefox, Edge, or Safari (latest versions)
- Internet Connection: Broadband connection for AI features and image uploads

### A.3 How to Use the System

**For Buyers:**
1. Browse the homepage for featured sellers and popular listings.
2. Use the Shop page to search by keyword or apply filters (category, model, year, engine, condition, price).
3. Click on a product to view details, images, specifications, and seller information.
4. Read reviews from other buyers to assess product and seller quality.
5. Use the AI Tools page to identify parts by image, decode chassis numbers, or get price guidance.
6. Register an account to leave reviews and save favourite listings.

**For Sellers:**
1. Register an account and log in.
2. Navigate to the Dashboard and click "Post Ad."
3. Complete the three-step wizard: enter part details, upload images (with optional AI price check), and set the location.
4. Monitor your listings from the Dashboard.
5. Apply for PRO status to unlock enhanced shop profiles, custom branding, and priority listing features.

**For Admins:**
1. Log in with an admin account.
2. Navigate to the Admin Dashboard.
3. Review and process PRO seller applications.
4. Manage users, products, and featured sellers.
5. Review platform feedback submissions.

---

## Appendix B: Project Source Code

**GitHub Repository:** [Placeholder - Insert GitHub repository link here]

**Repository Structure:**
```
spareHubLk/
  frontend/          - React frontend application
    src/
      components/    - Reusable UI components
      pages/         - Route-level page components
      context/       - Authentication context
      hooks/         - Custom React hooks
      services/      - API and AI service wrappers
  backend/           - Node.js/Express backend API
    middleware/      - Authentication middleware
    models/          - Mongoose data models
    routes/          - Express route handlers
    uploads/         - Product image storage
  docsa/             - Project documentation (PID, Interim Report, etc.)
  final_report/      - Final report markdown files
```

---

## Appendix C: GitHub Commit History

[Placeholder - Include screenshot or link to GitHub commit history graph]

[Placeholder - Include summary of commit activity showing development phases]

---

## Appendix D: Project Initiation Document (PID)

The original Project Initiation Document is included as a separate file in the project submission. It contains the initial problem statement, literature review, methodology, conceptual diagram, initial project plan, Gantt chart concept, and risk analysis as defined at the start of the project.

---

## Appendix E: Interim Report

The Interim Report is included as a separate file in the project submission. It documents the progress made at the midpoint of the project, including system analysis, requirements specification, feasibility study, system architecture diagrams, development tools and technologies, and implementation progress up to that stage.

---

## Appendix F: Records of Supervisory Meetings

[Placeholder - Include meeting dates, discussion topics, and action items from supervisory meetings]

| Date | Discussion Summary | Action Items |
|------|-------------------|--------------|
| [Date] | [Topics discussed] | [Decisions and next steps] |
| [Date] | [Topics discussed] | [Decisions and next steps] |
| [Date] | [Topics discussed] | [Decisions and next steps] |

---

## Appendix G: Design Preliminary Designs and Wireframes

[Placeholder - Include initial wireframes, hand-drawn sketches, or low-fidelity designs created during the system design phase]

[Placeholder - Include final UI mockups or design system documentation]

---

## Appendix H: Test Results and Evidence

### H.1 Functional Test Evidence
[Placeholder - Screenshots or logs from functional testing]

### H.2 Performance Test Evidence
[Placeholder - Browser DevTools network tab screenshots, API response time logs]

### H.3 Security Test Evidence
[Placeholder - Screenshots of authentication flows, error handling]

### H.4 AI Feature Test Samples
[Placeholder - Sample inputs and outputs for image identification, VIN decoding, and price analysis]

---

## Appendix I: Database Schema Details

[Placeholder - Detailed MongoDB schema definitions, index configurations, and sample documents]

---

## Appendix J: API Documentation

[Placeholder - Complete OpenAPI/Swagger-style documentation of all backend endpoints with request/response examples]

---

## Appendix K: Technology Choice Analysis

[Placeholder - Detailed pros/cons analysis of technologies considered and final selections, including alternatives evaluated for the AI layer]

---

## Appendix L: Other Supporting Material

[Placeholder - Any additional supporting material such as user interview transcripts, platform research notes, or competitor analysis summaries]
