# Systematic Review Support System - Core & Governance Module

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Run the SQL scripts in Supabase SQL Editor:

1. First run: `src/db/coreAndGovernance.sql` - Creates tables
2. Then run: `src/db/coreAndGovernance-data.sql` - Inserts sample data (if needed)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── pages/
│   ├── home/
│   │   └── HomePage.tsx
│   └── projects/
│       ├── ProjectListPage.tsx      # List all projects
│       ├── ProjectFormPage.tsx      # Create/Edit project
│       └── ProjectDetailPage.tsx    # View project details & manage sub-entities
├── services/
│   └── coreAndGovernanceService.ts  # Supabase API calls
├── types/
│   └── coreAndGovernance.ts         # TypeScript interfaces
├── layouts/
│   └── MainLayout.tsx               # Main application layout
└── routes/
    └── MainRoutes.tsx               # Route definitions
```

## 🎯 Features Implemented

### Core & Governance Module

- ✅ **Project Management**
  - Create, read, update, delete systematic review projects
  - Track project status (Planning, In Progress, Completed, On Hold)
  - Define domain and description

- ✅ **Review Needs**
  - Document review needs with justification
  - Track who identified each need

- ✅ **Commissioning Documents**
  - Store sponsor information
  - Define scope and budget
  - Link to external documents

- ✅ **Review Objectives**
  - Define clear review objectives
  - Link objectives to projects

- ✅ **Research Questions**
  - Create research questions with rationale
  - Categorize by question type
  - Link to PICOC framework

- ✅ **PICOC Framework**
  - Population definition
  - Intervention specification
  - Comparison criteria
  - Outcome measures
  - Context description

## 🎨 UI Components

All components use Tailwind CSS for styling and follow a consistent design system:

- **Button**: Primary, secondary, danger, and success variants
- **Input**: Text inputs with labels and error messages
- **Textarea**: Multi-line text inputs
- **Select**: Dropdown selects with options
- **Card**: Container component with optional title
- **Modal**: Overlay dialog for forms
- **LoadingSpinner**: Loading indicator

## 🗺️ Routes

- `/` - Home page with overview
- `/projects` - List all projects
- `/projects/new` - Create new project
- `/projects/:id` - View project details
- `/projects/:id/edit` - Edit project

## 📊 Database Tables

1. **systematic_review_project** - Main project information
2. **review_need** - Review needs and justifications
3. **commissioning_document** - Funding and scope documents
4. **review_objective** - Review objectives
5. **question_type** - Types of research questions
6. **research_question** - Research questions
7. **picoc_element** - PICOC framework elements
8. **population, intervention, comparison, outcome, context** - Detailed PICOC data

## 🔄 Next Steps

To extend this module, consider:

1. **Enhanced Edit Functionality**
   - Add edit modals for review needs, documents, objectives, and questions
   - Implement inline editing

2. **Validation & Error Handling**
   - Add more comprehensive form validation
   - Better error messages and user feedback

3. **Search & Filter**
   - Add search functionality to project list
   - Filter projects by status, domain, date

4. **Export & Import**
   - Export project data as JSON/CSV
   - Import existing projects

5. **Collaboration Features**
   - Add user roles and permissions
   - Track changes and version history

6. **Integration with Other Modules**
   - Link to Search Strategy module
   - Connect to Study Screening workflow

## 🛠️ Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Router 7** - Navigation
- **Supabase** - Backend & Database
- **Vite** - Build tool

## 📝 Notes

- All database operations use Supabase's JavaScript client
- Components are fully typed with TypeScript
- Responsive design works on mobile, tablet, and desktop
- Follow PRISMA framework guidelines for systematic reviews
