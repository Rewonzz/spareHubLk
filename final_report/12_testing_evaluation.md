# 7. Testing and Evaluation

## 7.1 Testing Strategy

The testing strategy for SPAREHUBLK encompassed multiple levels of verification to ensure the system met its functional and non-functional requirements. Testing was conducted throughout the development lifecycle, aligned with the Agile iterative approach, rather than being deferred to a final phase.

### 7.1.1 Levels of Testing

**Unit Testing:** Individual functions and components were tested in isolation. Frontend components were rendered with various prop combinations to verify correct display and behaviour. Backend utility functions, such as password hashing verification and token generation, were validated against expected outputs.

**Integration Testing:** API endpoints were tested to verify that the frontend and backend communicated correctly. This included authentication flows, CRUD operations on listings, file uploads, and review submission workflows. The Vite proxy configuration facilitated testing the full request/response cycle during development.

**System Testing:** End-to-end scenarios were executed to verify that complete user journeys functioned correctly. Example scenarios included:
- A new user registers, logs in, creates a listing, and views it in the shop.
- A buyer searches for a part, applies filters, views product details, and submits a review.
- An admin reviews a PRO application, approves it, and adds the seller to the featured list.

**Usability Testing:** The interface was evaluated for clarity, consistency, and ease of use. Navigation flows were reviewed to ensure that common tasks (searching, listing creation, profile updates) could be completed with minimal steps. Form validation messages were checked for helpfulness and accuracy.

### 7.1.2 Testing Environment

Testing was performed in a local development environment with the following configuration:
- Frontend served on `localhost:5173` via Vite.
- Backend API running on `localhost:5000`.
- MongoDB database running locally on the default port.
- Test data was seeded into the database to simulate realistic marketplace content.
- Multiple browsers (Google Chrome, Mozilla Firefox, Microsoft Edge) were used to verify cross-browser compatibility.

## 7.2 Backend Testing

Backend testing was implemented using Jest and Supertest. An in-memory MongoDB instance (MongoDB Memory Server) was used to ensure tests ran in isolation without affecting the development database. The test suite covered five major modules: authentication, product listings, reviews and ratings, premium seller workflow, and security.

### 7.2.1 Authentication Tests
The authentication module was tested for user registration, login, token management, profile updates, and role-based access control. Tests verified that valid registrations created accounts and returned JWT tokens, duplicate emails were rejected, login accepted both email and username, expired tokens triggered re-authentication, admin routes were protected from regular users, and profile updates including avatar uploads persisted correctly.

### 7.2.2 Product Listing Tests
The product listing module was tested for creation, editing, deletion, image upload, and viewing. Tests verified that listings with all required fields were saved successfully, validation errors appeared for incomplete submissions, up to five images were uploaded and stored, edits were persisted, deletions removed listings and cleaned up associated images, and product detail pages displayed correct data while incrementing view counts.

### 7.2.3 Search and Filter Tests
The search and filter module was tested for keyword search relevance, category filtering, combined filter application, URL parameter persistence, and empty result handling. Tests confirmed that keyword queries returned relevant products, category filters narrowed results correctly, combined filters produced the intersection of criteria, filter selections were reflected in browser URLs for shareability, and no-results states displayed friendly messaging.

### 7.2.4 AI Features Tests
The AI features were tested for image identification accuracy, VIN decoding correctness, price analysis relevance, and chatbot response quality. Tests confirmed that clear automotive images were identified with matching category suggestions, unclear images triggered graceful fallback responses, valid Sri Lankan chassis codes produced accurate vehicle details, invalid codes were handled with helpful error messages, price assessments were contextually appropriate for the Sri Lankan market, and the chatbot provided relevant, platform-aware responses to spare parts queries.

### 7.2.5 Review and Rating Tests
The review and rating module was tested for product review submission, seller review submission, duplicate prevention, self-review blocking, deletion, and rating recalculation. Tests verified that valid reviews were saved and immediately reflected in average ratings, duplicate submissions from the same user were blocked, sellers could not review their own products or themselves, users could delete their own reviews, admins could delete any review, and rating statistics were recalculated correctly upon deletion.

### 7.2.6 Premium Seller Workflow Tests
The premium seller workflow was tested for application submission, status retrieval, admin approval, admin rejection, and PRO shop page display. Tests confirmed that applications were created with pending status, applicants could view their current application state, admin approval upgraded the user to PRO tier and synced related fields, admin rejection updated status appropriately, and approved PRO sellers displayed enhanced shop profiles with custom branding.

### 7.2.7 Security Tests
Security testing verified that the system's protective mechanisms functioned correctly. Tests confirmed that passwords were stored as bcrypt hashes rather than plain text, protected routes returned 401 Unauthorized when no valid token was present, admin routes returned 403 Forbidden for non-admin users, malformed inputs were sanitised and did not permit NoSQL injection, product descriptions containing script tags were rendered harmlessly, invalid or expired JWTs were rejected and triggered logout, and tokens belonging to deleted users were invalidated by the database verification step in the middleware.

**[Placeholder for Screenshot 7.1: Backend Test Results — Jest Output Showing All 40 Tests Passing]**

## 7.3 Frontend Testing

Frontend testing was implemented using Vitest with React Testing Library. Tests were executed in a jsdom environment to simulate browser behaviour without requiring an actual browser instance. The test suite covered authentication UI components, product card rendering, and search/filter functionality.

### 7.3.1 Authentication UI Tests
The authentication interface was tested for correct rendering based on authentication state. Tests verified that the navbar displayed the SPAREHUBLK brand name, the search bar was present and functional, and navigation links rendered correctly for both authenticated and guest users.

### 7.3.2 Product Card Component Tests
The ProductCard component was tested for proper display of product information. Tests confirmed that product titles were rendered, prices were displayed in LKR format, condition badges (New/Used) appeared correctly, and the component handled both image and no-image states gracefully.

### 7.3.3 Search and Filter UI Tests
The search and filter interface was tested for user interaction. Tests verified that the search input field accepted text input, category filter dropdowns displayed the correct options, condition filters (New/Used) were selectable, and price range inputs functioned correctly.

**[Placeholder for Screenshot 7.2: Frontend Test Results — Vitest Output Showing All 11 Tests Passing]**

## 7.4 Performance Testing

Performance testing was conducted to verify that the system met its non-functional requirements under typical usage conditions. Measurements were taken using browser developer tools and server logging. The homepage loaded in approximately 1.2 seconds, the shop page with filters in approximately 1.5 seconds, product detail pages in approximately 0.8 seconds, database-backed API responses in 0.3 to 0.6 seconds, AI feature responses in 2 to 4 seconds depending on external API latency, and image uploads of five images in 2 to 3 seconds. All results were within the defined target thresholds. MongoDB indexes on frequently queried fields contributed to fast query response times.

## 7.5 Usability Testing

Usability was assessed through task-based evaluation of core workflows. Registering a new account was rated as easy due to clear form layout and immediate validation feedback. Creating a spare part listing was rated as moderately easy because the multi-step wizard guided the process effectively, and the AI price check provided helpful guidance. Searching for a specific part was rated as easy because filters were intuitive and URL sharing worked reliably. Using the AI image search was rated as easy because the upload and results flow was straightforward. Navigating to a seller profile was rated as easy because consistent links were available from product cards. Admin review of applications was rated as easy because expandable rows provided all necessary detail without clutter.

## 7.6 Evaluation Metrics Summary

The system was evaluated against the metrics defined in the methodology chapter.

**Functional Coverage:** All specified requirements across authentication, listings, search, AI features, reviews, premium workflow, and admin functions were implemented and operational.

**Response Time:** Core operations consistently completed in under 2 seconds, meeting the target of under 3 seconds.

**AI Accuracy:** Image identification, VIN decoding, and price analysis provided meaningful and relevant outputs that assisted users in making informed decisions.

**Usability:** Core tasks could be completed by users without prior guidance, indicating intuitive navigation and interface design.

**Security:** Authentication, authorisation, and input sanitisation mechanisms were verified with no critical vulnerabilities identified.

## 7.7 Limitations in Testing

While the testing process was comprehensive within the constraints of an academic project, the following limitations should be noted:
- Testing was conducted by the developer rather than independent external testers, which may introduce bias.
- Load testing was not performed with high concurrent user volumes; performance under significant traffic remains unverified.
- AI accuracy was assessed manually against a limited set of test cases rather than through a formal benchmark dataset.
- Cross-browser testing was limited to three major browsers on desktop. The application is designed for desktop use and is not currently optimised for mobile browsers.

---

**[Placeholder for Figure 7.3: Performance Monitoring Dashboard / Browser DevTools Screenshot]**
