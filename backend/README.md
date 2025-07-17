# Backend

## Prerequisites

- Node.js
- PostgreSQL with pgvector extension

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file:**
   - Copy the `.env.example` file to a new file named `.env`.
   - Update the environment variables in the `.env` file with your credentials.

3. **Run the database schema:**
   - Connect to your PostgreSQL database.
   - Run the SQL script in `../README.md` to create the necessary tables and indexes.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:3000`.
