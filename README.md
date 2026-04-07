# Note Board

CodePath WEB103 Final Project

Designed and developed by: Olha Sorych, Sing Zheng, and Jonatan Paulino

🔗 Link to deployed app:

## About

### Description and Purpose

Note Board is an interactive notes app where users can create, edit, and delete notes, organize them into categories, add tags, and customize them with different colors.

This app is designed to make the note-taking process more organized, easy to navigate, and reliable. Users can capture notes anytime without worrying about losing them. The app ensures that all notes are stored safely and remain easy to find when needed.

### Inspiration

The inspiration for Note Board came from the common struggle of managing "digital scrap" those quick thoughts, links, and to do lists that often get lost in cluttered messaging apps or physical sticky notes. We wanted to build a centralized, visually intuitive space that mimics the flexibility of a physical corkboard but adds the power of digital searching, tagging, and categorization.

## Tech Stack

Frontend:   React

Backend:    Express

## Features

### [Full CRUD Functionality]

Users can seamlessly create new notes, view them in a gallery or list format, update content in real-time, and delete notes they no longer need.

### [Dynamic Categorization]

Organize notes into specific categories (e.g., Work, Personal, School) to keep different areas of life separated and manageable.

### [Pinned Favorites]

The ability to "pin" important notes to the top of the dashboard so that high priority information is never buried.

### [Color-Coded Customization]

Assign unique background colors to each note, allowing for visual grouping and a personalized aesthetic.

### [AI Smart-Fix (Text Correction)]

A "Magic Wand" tool that instantly corrects grammar, spelling, and punctuation errors within a note while preserving the user's original intent.

### [Tone Shifter]

Allows users to rewrite a note in a different tone transforming a casual brainstorm into a professional email draft or a formal set of instructions.

## Installation Instructions

Follow these steps to set up the Note Board development environment on your local machine.

📋 Prerequisites
Ensure you have the following installed:

Node.js

npm 

Git

1. Clone the Repository
Open your terminal and run:

git clone <https://github.com/colaola20/web103_finalproject.git>
cd web103_finalproject/FUN

2. Install All Dependencies
We use a monorepo structure. You need to install dependencies in three locations: the root, the backend, and the frontend.

# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to the root folder
cd ..

3. Running the AppFrom the root directory (/FUN), start both the frontend and backend simultaneously.

npm run dev

Service     URL                     Description
Frontend    http://localhost:5173   Vite + React Development Server
Backend     http://localhost:3000   Express API Server