__WEB TECHNOLOGIES ÔÇö COURSE PROJECT__

__SmartClinic__

AI\-Augmented Outpatient Management Platform

__Technologies Required__

React  ┬À  NestJS  ┬À  PostgreSQL  ┬À  LLM AI API  ┬À  WebSocket  ┬À  JWT Auth

Web Technologies ┬À Full\-Stack Track

# __1\. Project Overview__

A mid\-sized private clinic network is struggling with appointment chaos, misrouted patients, overburdened doctors, and slow insurance pre\-authorization processes\. Paper\-based and legacy digital systems cause delays, errors, and patient dissatisfaction\.

Your team will design and build SmartClinic ÔÇö a full\-stack web application that modernises clinic operations and embeds AI to assist both staff and patients across the entire outpatient journey\. This is not a prototype\. It is a production\-grade architecture exercise with real\-world constraints\.

## __1\.1 Learning Objectives__

- Design and implement a modular NestJS backend with guards, interceptors, and Swagger documentation
- Build a multi\-role React frontend with protected routing, real\-time updates, and AI\-powered UI components
- Integrate a large language model \(LLM\) API into a secure backend proxy layer
- Apply software engineering practices: ER modelling, API contracts, environment configuration, and testing
- Reflect critically on architectural tradeoffs made during development

## __1\.2 Team Size & Duration__

- Team size: 3 ÔÇô 4 students
- Submission: source code repository \+ Word/PDF report \+ live demo

# __2\. Real\-World Scenario__

## __2\.1 Client Profile__

Al\-Noor Medical Group operates four outpatient clinics across the city with the following profile:

- 12 specialist doctors across General Practice, Cardiology, Dermatology, and Orthopaedics
- ~200 patient appointments per day across all branches
- Receptionist staff who manually manage bookings via phone and spreadsheets
- Insurance partnerships with three major providers requiring pre\-authorisation for specialist visits

## __2\.2 Problems to Solve__

The client has identified the following operational pain points:

__Pain Point__

__Detail__

Double\-booking

Receptionists frequently overbook slots, causing patient wait times over 90 minutes

Misrouted patients

Patients book the wrong specialty because they don't know which doctor to see

No\-show rate

~22% of appointments result in no\-shows with no advance warning to the clinic

Slow pre\-auth

Insurance pre\-authorisation is handled via fax and email, adding 2\-3 days to specialist referrals

Doctor prep time

Doctors receive no structured patient information before consultations, leading to slow starts

# __3\. Core Application Modules__

The system must implement all six modules below\. Each maps directly to a NestJS module on the backend and one or more React views on the frontend\.

## __3\.1 Multi\-Role Authentication__

Four distinct user roles must be supported:

- Patient ÔÇö books appointments, views records, uses the intake chatbot
- Doctor ÔÇö views scheduled appointments, writes clinical notes, sees AI triage summaries
- Receptionist ÔÇö manages all appointments, handles walk\-ins, sends reminders
- Clinic Admin ÔÇö views analytics dashboard, manages doctors and rooms, exports reports

Technical requirements: JWT access \+ refresh tokens, bcrypt password hashing, role\-based route guards on all NestJS controllers, and React route guards using a custom AuthContext\.

## __3\.2 Appointment Engine__

- Patients can search available slots by date, specialty, and doctor
- Real\-time conflict detection prevents double\-booking \(use database\-level locking\)
- Receptionist view shows a live daily calendar with drag\-to\-reschedule
- Cancellation within 2 hours of appointment sends an automated alert to the next patient on a waitlist

## __3\.3 Medical Records__

- Each appointment generates a visit record linked to the patient
- Doctors complete a structured SOAP note \(Subjective, Objective, Assessment, Plan\) per visit
- Patients can view their own records; doctors see all records for their patients
- File upload support for lab results \(PDF/image, max 5 MB\)

## __3\.4 Real\-Time Notifications__

- WebSocket gateway \(NestJS @WebSocketGateway\) broadcasts appointment status changes
- Patients receive confirmations, reminders \(24h and 1h before\), and queue position updates
- Receptionists see live arrival and check\-in events on the booking board

## __3\.5 Insurance Pre\-Authorisation Tracker__

- Receptionists submit pre\-auth requests for specialist appointments with required fields
- Status progresses through: Pending ÔåÆ Submitted ÔåÆ Approved / Rejected
- Doctors are blocked from finalising a specialist note until pre\-auth is Approved
- Admin can view aggregated approval rates by insurance provider

## __3\.6 Admin Analytics Dashboard__

- Daily and weekly appointment occupancy rates per doctor
- No\-show rate trend over the past 30 days
- Average consultation duration by specialty
- Insurance approval rate and average turnaround time
- All charts rendered client\-side using Recharts or Chart\.js

# __4\. Required AI Integrations__

All four AI features are mandatory\. Each must be routed through the NestJS AI proxy module ÔÇö direct LLM API calls from the React frontend are not permitted\.

## __4\.1 Patient Intake Chatbot__

__  AI Feature 1  __

A conversational chat widget embedded in the patient portal, activated when a patient has an upcoming appointment within 24 hours\.

- Collects: chief complaint, symptom duration, severity \(1ÔÇô10\), relevant history, current medications
- Conversation guided by a system prompt that enforces a structured intake flow
- On completion, produces a structured JSON triage summary stored in the database
- The assigned doctor sees this summary as a pre\-consultation card on their dashboard
- Must handle graceful degradation: if the AI service is unavailable, a static intake form is shown instead

## __4\.2 Smart Appointment Recommender__

__  AI Feature 2  __

When a patient initiates a new booking, they describe their concern in a free\-text field\. The AI returns a specialty recommendation with a brief rationale\.

- Input: patient's free\-text description \+ past visit history \(if any\)
- Output: recommended specialty, top 2 doctor suggestions, confidence indicator
- The patient can accept the recommendation or override it manually
- Recommendation rationale must be shown to the patient for transparency

## __4\.3 Clinical Note Assistant \(SOAP Formatter\)__

__  AI Feature 3  __

Doctors can dictate or type rough notes during or after a consultation\. The AI assistant reformats these into a structured SOAP note and suggests ICD\-10 diagnostic codes\.

- Doctor types or pastes raw consultation notes into a text area
- On clicking 'Format with AI', the NestJS service sends the text to the LLM with a SOAP\-formatting prompt
- Returned structured note is loaded into the four SOAP fields for the doctor to review and edit before saving
- ICD\-10 code suggestions \(up to 3\) are shown with descriptions; doctor selects or dismisses each
- Doctors must always be able to edit and save manually, independent of the AI output

## __4\.4 No\-Show Risk Predictor__

__  AI Feature 4 \(Bonus\)  __

A NestJS service computes a no\-show risk score for each upcoming appointment and surfaces high\-risk bookings to receptionists\.

- Features used: days until appointment, time of day, day of week, patient no\-show history, specialty type
- Implement as a rule\-based scoring function or a simple logistic regression trained on dummy historical data
- Appointments with score > 0\.65 are flagged with a warning badge in the receptionist calendar view
- Receptionist can trigger a WhatsApp/SMS reminder \(mock API call\) for flagged appointments

# __5\. Technical Stack & Constraints__

__Layer__

__Technology__

__Notes__

Frontend

React 18 \+ TypeScript

Vite, React Router v6, Axios

State

React Context \+ Zustand

No Redux required

Backend

NestJS \+ TypeScript

Modular architecture, REST \+ WS

ORM

TypeORM or Prisma

Migrations required

Database

PostgreSQL 15

Dockerised for local dev

Auth

JWT \(Passport\.js\)

Access \+ refresh token pair

Real\-time

Socket\.io via NestJS

Rooms per role/user

AI

OpenAI GPT\-4o or Anthropic Claude

Via NestJS proxy ÔÇö no direct FE calls

API Docs

Swagger \(auto\-generated\)

All endpoints documented

Testing

Jest \+ Supertest

Min\. 60% controller coverage

## __5\.1 Mandatory Constraints__

- The NestJS AI proxy module must sit between the React frontend and any LLM API\. No API keys in frontend code\.
- All secrets \(DB credentials, AI API keys\) must be stored in \.env files\. No hardcoding\.
- At least one AI feature must gracefully degrade when the AI service is unavailable\.
- All role\-protected API routes must have Jest \+ Supertest integration tests\.
- Swagger documentation must be auto\-generated and accurate ÔÇö not written by hand\.
- Docker Compose file must bring up the database and backend with a single command\.

# __6\. Deliverables__

## __Deliverable 1 ÔÇö System Design Document__

- Entity\-relationship \(ER\) diagram covering all database entities
- API contract listing all endpoints, methods, request/response shapes \(can use Swagger YAML\)
- React component tree showing major components and their role\-visibility
- AI integration architecture: how prompts are structured, context managed, and outputs handled
- One paragraph per AI feature explaining the prompt engineering approach chosen

## __Deliverable 2 ÔÇö NestJS Backend__

- All six core modules implemented with full CRUD operations
- JWT authentication with role guards applied to all protected routes
- WebSocket gateway for real\-time notifications
- AI proxy module routing all LLM requests
- Swagger docs auto\-generated at /api
- Jest \+ Supertest tests with minimum 60% controller coverage
- Database migrations that run cleanly from scratch

## __Deliverable 3 ÔÇö React Frontend__

- Role\-based dashboards for all four user types
- Protected routing with redirect\-to\-login for unauthenticated users
- Appointment booking flow with real\-time slot availability
- AI chatbot widget for patient intake
- AI\-powered SOAP note assistant in the doctor's visit view
- Admin analytics dashboard with at least four chart types
- Responsive layout \(usable on tablet viewport\)

## __Deliverable 4 ÔÇö AI Integration Report__

- Full prompt templates used for each AI feature
- Explanation of context management strategy \(how conversation history is handled\)
- Description of fallback/degradation behaviour for each AI feature
- At least two prompt iterations documented: original ÔåÆ revised, with rationale
- Ethical consideration: one paragraph on data privacy implications of sending patient data to an LLM

## __Deliverable 5 ÔÇö Live Demo & Reflection Report__

- 15\-minute live demonstration of two complete end\-to\-end user flows
- Flow 1: Patient books appointment using AI recommender ÔåÆ completes intake chatbot ÔåÆ doctor views triage summary ÔåÆ doctor writes SOAP note using AI assistant
- Flow 2: Receptionist views flagged no\-show risk appointment ÔåÆ triggers reminder ÔåÆ admin reviews daily analytics
- Written reflection \(1,500 ÔÇô 2,000 words\): three architectural decisions made, tradeoffs accepted, and what you would change with more time

# __7\. Grading Rubric__

__Criterion__

__Weight__

__Key Indicators__

Backend Architecture & API Design

__25%__

Module separation, guard correctness, Swagger coverage, test pass rate

React Frontend ÔÇö UX & State Management

__20%__

Role\-based routing, real\-time updates, component design, responsiveness

AI Integration Quality & Prompt Engineering

__25%__

All 3 mandatory AI features functional, prompt quality, fallback handling

Real\-World Problem Coverage

__15%__

All 6 core modules functional, data integrity, edge case handling

System Design Document

__10%__

ER diagram accuracy, API contract completeness, AI architecture clarity

Demo & Critical Reflection

__5%__

Both flows completed live, reflection depth, honest tradeoff analysis

__Bonus: No\-Show Risk Predictor \(AI Feature 4\)__

__\+5%__

Functional risk scoring service integrated into receptionist view

*Note: All team members are expected to contribute to all layers\. Individual contribution will be assessed via Git commit history and a brief individual viva \(5 minutes per student\) during Demo Day\.*

# __9\. Academic Integrity & Use of AI Tools__

Students are permitted to use AI coding assistants \(GitHub Copilot, Claude, ChatGPT\) as development aids\. However:

- All AI\-generated code must be understood, reviewed, and documented by the team
- AI tools may not be used to write the reflection report or system design document ÔÇö these must demonstrate your own reasoning
- Prompt templates submitted in the AI Integration Report must be your team's original work
- Any code copied verbatim from external sources must be cited in a comments block with the source URL

*Plagiarism between teams will result in a zero for all parties involved\. Viva questions are designed to verify individual understanding of the submitted work\.*

*Good luck ÔÇö build something you are proud of\.*

