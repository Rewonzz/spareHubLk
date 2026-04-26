# 6. Implementation

## 6.1 Development Environment Setup

The development environment was configured with the following components:
- **Frontend:** React 19.2.0 with Vite 7.2.2 as the build tool. Tailwind CSS 4.1.17 was configured for styling, and React Router DOM 7.13.0 handled client-side routing.
- **Backend:** Node.js with Express.js 5.2.1. Mongoose 9.2.2 provided the MongoDB object modelling layer.
- **Database:** MongoDB 6.x running locally on the development machine.
- **Version Control:** Git was used throughout the project with regular commits to track progress.
- **Editor:** Visual Studio Code with extensions for JavaScript, React, and MongoDB.

The frontend and backend were developed as separate but coordinated codebases within a single repository. The frontend proxy configuration in `vite.config.js` routed API calls to the backend during development, ensuring seamless integration testing.

## 6.2 Frontend Implementation

### 6.2.1 Project Structure
The frontend source code is organised under `src/` with the following structure:
- `main.jsx` - Application entry point defining routes and providers.
- `components/` - Reusable UI components used across multiple pages.
- `pages/` - Route-level components corresponding to distinct views.
- `context/` - React Context for global authentication state.
- `hooks/` - Custom React hooks for shared logic patterns.
- `services/` - API wrappers and external service integrations.
- `assets/` - Static images and SVG graphics.

### 6.2.2 Routing and Navigation
The application uses React Router DOM with a BrowserRouter. Routes are defined in `main.jsx` without a shared layout wrapper; instead, `Navbar` and `Footer` are imported into each page component individually. This approach provides flexibility but means layout logic is distributed across pages.

Key routes include:
- `/` - Homepage with hero, featured sellers, search, and testimonials.
- `/shop` - Product catalogue with filters and AI chatbot widget.
- `/product/:id` - Single product view with image gallery, reviews, and map.
- `/shop/:sellerName` and `/seller/:sellerId` - Public seller shop profiles.
- `/dashboard` - Standard user dashboard (requires authentication).
- `/post-ad` - Multi-step listing creation wizard (requires authentication).
- `/apply-pro` - PRO seller application form (requires authentication).
- `/pro-dashboard` - PRO seller dashboard with inventory and analytics (requires authentication).
- `/admin` and `/admin/:tab` - Admin panel (requires admin role).
- `/ai-tools` - AI Tools hub (public).
- `/sellers` - Directory of verified PRO sellers (public).

### 6.2.3 State Management
Authentication state is managed through a React Context (`AuthContext.jsx`) that provides user data, token, login/logout functions, and user refresh capability to the entire component tree. On mount, the context checks localStorage for persisted session data and performs a background refresh via `/api/auth/me`.

All other state (forms, UI toggles, filter values, lists) is managed locally within components using `useState` and `useEffect`. There is no global state library such as Redux or Zustand. The `useAuthGuard` custom hook encapsulates the pattern of showing an authentication modal when a guest attempts a protected action.

### 6.2.4 Component Highlights

**Navbar:** A sticky top navigation bar featuring the logo, search bar, category mega-menu dropdown, profile dropdown with inline login form, and wishlist/dashboard triggers. It adapts based on authentication status and user role.

**ProductCard:** Displays product information in a grid layout with image carousel on hover, condition badges, pricing in LKR, location truncation, and star ratings. PRO seller listings receive visual prominence.

**PostAd:** A three-step wizard for creating listings:
- Step 1: Category selection, title, vehicle model, year, engine, and specifications.
- Step 2: Image upload (up to 5 images), price entry, and AI price analysis (Neural Check).
- Step 3: Leaflet map location picker and condition selection.
A live preview sidebar shows how the listing will appear.

**AiTools:** A tabbed interface housing four AI capabilities:
- VIN Decoder: Accepts chassis codes and displays decoded vehicle information with a button to search compatible parts.
- Chatbot: Full-page or floating conversational interface with message history.
- Image Search: Upload interface for part identification with automatic inventory search.
- Market Intelligence: Price evaluation tool for assessing listing fairness.

**AdminDashboard:** A sidebar-navigated admin panel with tabbed sub-components for Overview, Applications, Featured Sellers, Products, Users, and Settings. Applications are displayed in expandable rows with identity document previews.

### 6.2.5 Styling and Theming
The entire application uses a dark-first aesthetic (`#0a0a0a` background, `text-zinc-300` body text) with red (`red-600`) as the primary accent colour. Tailwind CSS utility classes are used exclusively. Custom animations (fadeUp, heroZoom, floatSlow) and a noise texture overlay are defined in `index.css` for visual depth.

## 6.3 Backend Implementation

### 6.3.1 Server Architecture
The backend entry point is `server.js`, which:
1. Configures Express with JSON parsing, CORS, and static file serving.
2. Connects to MongoDB using Mongoose.
3. Mounts all route modules under `/api/`.
4. Serves uploaded product images from the `/uploads` directory.
5. Defines the inline Vehicle schema and lookup endpoint.

### 6.3.2 Authentication System
Authentication is implemented in `routes/auth.js` with the following characteristics:
- Registration validates required fields and hashes passwords with bcrypt (salt round 10).
- Login accepts either email or username and verifies the password hash.
- JWT tokens are signed with `process.env.JWT_SECRET` and expire in 7 days.
- The `verifyToken` middleware in `middleware/auth.js` decodes the token and re-fetches the user from the database, attaching fresh data including `isPremium` and `role`.

### 6.3.3 File Upload Strategy
Two distinct upload strategies are employed:
- **Product Images:** Stored on disk using `multer.diskStorage` in the `uploads/` directory. Filenames are generated with timestamps to prevent collisions. URLs are returned as relative paths served statically.
- **Profile Media:** User avatars, shop banners, and shop avatars are stored as base64 data URLs directly in the MongoDB document using `multer.memoryStorage`. This simplifies profile picture management but increases document size.

### 6.3.4 Data Models and Relationships
Mongoose schemas enforce data structure and validation:
- **User:** Core account with role, premium status, and profile media.
- **Product:** Listing with vehicle compatibility, specifications, images, and seller reference.
- **Review / SellerReview:** Separate collections with compound unique indexes preventing duplicates.
- **PremiumUser:** Formal application record distinct from the User model, requiring sync logic during approval/rejection.
- **FeaturedSeller:** Simple linking table with ordering support.

### 6.3.5 API Implementation Patterns
Routes follow a consistent pattern:
- Input validation through Mongoose schema types and manual checks.
- Database operations using Mongoose queries with population for references.
- Aggregate pipelines for rating recalculation on review changes.
- Cascading deletes in application code (e.g., deleting a user removes their products, premium applications, and featured entries).

## 6.4 AI Integration Implementation

### 6.4.1 Service Architecture
AI capabilities are implemented as separate service modules in the frontend:
- `geminiService.js` - Chatbot and general text generation.
- `vinDecoderService.js` - VIN and chassis decoding with JSON parsing fallbacks.
- `marketIntelligenceService.js` - Price analysis and market context evaluation.

Each service instantiates its own Google Generative AI model with specific generation configurations tuned to the task.

### 6.4.2 Prompt Engineering
Carefully structured prompts are used to guide the AI outputs:
- **VIN Decoder:** Decode this Sri Lankan vehicle chassis number and return make, model, year, engine, and compatible parts as structured data.
- **Image Search:** Identify this automotive spare part and provide part name, category, likely vehicle models, and condition assessment.
- **Price Analysis:** Evaluate whether the given price for a part is fair for the Sri Lankan market and return a status with reasoning.
- **Chatbot:** System prompt establishes expertise in Sri Lankan automotive spare parts, polite tone, and platform navigation assistance.

### 6.4.3 Error Handling and Fallbacks
Each AI service implements error handling for API failures, timeout scenarios, and malformed responses. The VIN decoder includes JSON parsing fallbacks to extract structured data from free-text responses if strict JSON formatting fails.

## 6.5 Map Integration

Leaflet is loaded dynamically via CDN script and link tag injection when map components mount (in `PostAd` and `ProductDetails`). This approach avoids bundling the full Leaflet library, reducing initial JavaScript payload. Users can click on the map to set listing coordinates, and product pages display the location with a marker.

## 6.6 Key Implementation Decisions

1. **Client-Side AI:** AI services are called directly from the frontend rather than proxied through the backend. This reduces backend complexity but exposes API keys in client-side code.

2. **URL-Driven Filters:** The Shop page drives precision search entirely from URL query parameters, making searches shareable and back-button friendly.

3. **Dual Image Storage:** Product images use disk storage for efficiency, while profile media uses base64 in MongoDB for portability.

4. **No Global State Library:** React Context and local state are used instead of Redux or Zustand, keeping the bundle size smaller and reducing abstraction overhead.

5. **Dynamic Leaflet Loading:** Map library is injected at runtime rather than bundled, trading initial load time for occasional CDN dependency.

---

**[Placeholder for Figure 6.1: Screenshot of Homepage]**

**[Placeholder for Figure 6.2: Screenshot of Product Listing Page]**

**[Placeholder for Figure 6.3: Screenshot of AI Tools Hub]**

**[Placeholder for Figure 6.4: Screenshot of Admin Dashboard]**

**[Placeholder for Figure 6.5: Screenshot of PostAd Wizard]**

**[Placeholder for Figure 6.6: Screenshot of Seller Shop Profile]**
