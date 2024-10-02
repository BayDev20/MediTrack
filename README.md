# MedStock: Urgent Care Inventory Management System

Created by Cody Beggs

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Components](#components)
7. [State Management](#state-management)
8. [Authentication](#authentication)
9. [Database](#database)
10. [Styling](#styling)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

## Introduction

MedStock is a comprehensive inventory management system designed specifically for urgent care facilities. It provides real-time tracking of medical supplies, low stock alerts, and efficient reordering processes. This application aims to streamline inventory management, reduce waste, and ensure that critical supplies are always available when needed.

## Features

- Real-time inventory tracking
- User authentication and authorization
- Dark mode support
- QR code scanning for quick stock updates
- Low stock alerts and automatic reorder list generation
- Categorized supply management
- Search and filter functionality
- Responsive design for desktop and mobile use

## Technology Stack

- **Frontend**: Next.js 13+ (React framework)
- **Backend**: Firebase (Authentication and Firestore)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Deployment**: Vercel (recommended)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/medstock-app.git
   cd medstock-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication and Firestore in your Firebase project
   - Copy your Firebase configuration to a `.env.local` file:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
medstock-app/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── firebase.ts
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── lib/
│   └── utils.ts
├── public/
├── styles/
│   └── globals.css
├── .env.local
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## Components

### Main Components

- **Home**: The main dashboard component (`app/page.tsx`)
- **ThemeToggle**: Toggles between light and dark mode
- **Supply**: Represents an individual supply item
- **SupplyList**: Displays the list of supplies
- **AddSupplyForm**: Form for adding new supplies
- **OrderList**: Displays items that need reordering

### UI Components (from shadcn/ui)

- **Button**: Customizable button component
- **Input**: Text input component
- **Select**: Dropdown select component
- **Card**: Container for displaying information
- **Badge**: Used for displaying stock status
- **Switch**: Toggle switch, used for theme switching
- **ScrollArea**: Creates a scrollable area with a custom scrollbar

## State Management

The application uses React Hooks for state management:

- `useState`: Manages local component state
- `useEffect`: Handles side effects like data fetching
- `useAuthState`: Manages authentication state (from react-firebase-hooks)

## Authentication

Firebase Authentication is used for user management. The `useAuthState` hook from `react-firebase-hooks` is used to manage the authentication state throughout the application.

## Database

Firebase Firestore is used as the database. The `supplies` collection stores information about each supply item, including name, category, stock level, and low stock threshold.

## Styling

The application uses Tailwind CSS for styling, with additional custom components from shadcn/ui. Dark mode is supported and can be toggled by the user.

## Deployment

The easiest way to deploy your MedStock app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

---

Created with passion by Cody Beggs. For urgent care facilities striving for efficient inventory management.
