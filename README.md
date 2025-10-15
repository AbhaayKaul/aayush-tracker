# Response Collector Web App

A simple, responsive web application for collecting and displaying user responses.

## Features

- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🎯 **Multi-Step Form** - One question at a time for better UX (6 questions total)
- ⬅️➡️ **Navigation** - Move forward and backward between questions
- 📊 **Progress Bar** - Visual indicator showing completion progress
- ✅ **Validation** - Must answer each question before proceeding
- 💾 **MongoDB Atlas** - Stores responses in cloud database (free tier)
- ✨ **Modern UI** - Beautiful gradient design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
```bash
cd "/Users/mmt12021/go/src/csv webapp"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your MongoDB connection string with password

### Running the Application

Start the server:
```bash
npm start
```

The application will be available at: **http://localhost:3000**

You should see: `✅ Connected to MongoDB successfully!`

## Project Structure

```
csv webapp/
├── server.js           # Express backend server
├── package.json        # Project dependencies
├── .env                # Environment variables (MongoDB connection)
├── .env.example        # Example environment file
├── models/
│   └── Response.js    # MongoDB schema/model
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # CSS styling
│   └── app.js         # Frontend JavaScript
└── README.md          # This file
```

## How It Works

1. **Multi-Step Form**: Users answer questions one at a time:
   - Question 1: Your Name
   - Question 2: Date (calendar picker)
   - Question 3: Reason for calling Aayush Singh
   - Question 4: Aayush Status (yes/no/hehehe bhai)
   - Question 5 (conditional): If Yes → How much time taken to come down
   - Question 6 (conditional): If No → Reason for Not Coming
2. **Conditional Logic**: 
   - If "Yes" selected → Shows Q5 (time taken) then submits
   - If "No" selected → Shows Q6 (reason) then submits
   - If "Hehehe bhai" selected → Directly to submit (4 questions total)
3. **Navigation**: Users can move forward (after answering) or go back to previous questions
4. **Backend**: Express server receives all answers via POST request
5. **Storage**: Data is saved to MongoDB Atlas (cloud database) with automatic timestamps

### Form Features

- **One question at a time** - Focused, distraction-free experience
- **Progress tracking** - Visual progress bar and counter (e.g., "Question 3 of 6")
- **Validation** - Can't proceed without answering the current question
- **Navigation** - "Previous" and "Next" buttons for easy movement
- **Enter key support** - Press Enter to move to next question (except on textarea)
- **Auto-focus** - Input automatically focuses when question appears

## API Endpoints

- `POST /api/submit` - Submit a new response
- `GET /api/responses` - Retrieve all responses (sorted by newest first)

## Database

This app uses **MongoDB Atlas** (free tier) for data storage:
- Responses are stored in the cloud
- Automatic timestamps (createdAt, updatedAt)
- Accessible from anywhere
- View data in MongoDB Atlas dashboard

## Viewing Your Data

1. **MongoDB Atlas Dashboard**: 
   - Go to https://cloud.mongodb.com
   - Browse Collections → responses

2. **Via API**: 
   - Visit http://localhost:3000/api/responses

## Next Steps

To enhance this application, you could:
- Add authentication
- Create an admin dashboard to view responses
- Export responses to CSV/Excel
- Add filtering and search functionality
- Add data visualization/charts

