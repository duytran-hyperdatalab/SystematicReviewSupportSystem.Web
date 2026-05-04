# Systematic Review Support System (SRSS) – Front-End  

English: Web-based System to Support Systematic Literature Review Based on the PRISMA Framework  
Vietnamese: Hệ thống Web hỗ trợ thực hiện Systematic Literature Review theo tiêu chuẩn PRISMA  
Abbreviation: SRSS



# Overview

**SRSS (Systematic Review Support System)** is a web-based platform developed to support researchers in conducting **Systematic Literature Review (SLR)** following the **PRISMA 2020** standard.  

SLR is widely applied in evidence-based fields such as medicine, computer science, psychology, and social sciences — but the workflow is often manual, time-consuming, error-prone, and difficult to track.  

SRSS provides a centralized and structured environment to streamline SLR execution, ensuring consistency, transparency, and reproducibility in research reporting.

> This repository contains the **Front-End application built with ReactJS + Vite**.  
> Internal workflow logic and backend implementation details are intentionally not included.



# Technology Stack (Front-End)

| Technology | Purpose |
|----------|----------|
| **ReactJS + Vite** | UI framework & build tool |
| **React Router DOM** | Routing & navigation |
| **Axios** | API communication layer |
| **Redux Toolkit** | State management |
| **TailwindCSS / SCSS / CSS Modules** | Styling system |
| **ESLint + Prettier** | Code format & linting |
| **Vercel** | Deployment-ready |
...



# Project Folder Structure
```plaintext
src/
├── assets/ # Static assets (images, icons, fonts)
├── components/ # Reusable UI components
├── pages/ # Application screens
├── layouts/ # Page layout structures
├── routes/ # Router configuration
├── config/ # Global dependencies handler
├── services/ # API handlers & request logic
├── hooks/ # Reusable custom hooks
├── utils/ # Helper functions & formatters
├── main.jsx # App entry
└── App.jsx # Router group
```


# Installation & Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env 

# Start development server
npm run dev 

# Build production bundle
npm run build 
```


# License Notice
This project is developed as part of a FPT University Final Capstone Graduation Project.
All rights reserved to authors and contributors. Redistribution or reuse should follow academic ethics.