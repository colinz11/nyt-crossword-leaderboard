# NYT Express Backend

This project is an Express.js backend service that interacts with the New York Times API to fetch and store articles in a database.

## Project Structure

```
nyt-express-backend
├── src
│   ├── app.js                # Entry point of the application
│   ├── controllers           # Contains controllers for handling requests
│   │   └── nytController.js  # Controller for New York Times articles
│   ├── routes                # Contains route definitions
│   │   └── nytRoutes.js      # Routes for New York Times articles
│   ├── models                # Contains database models
│   │   └── nytModel.js       # Model for New York Times articles
│   └── services              # Contains services for API interactions
│       └── nytService.js     # Service for interacting with New York Times API
├── package.json              # NPM configuration file
├── .env                      # Environment variables
├── .gitignore                # Files and directories to ignore by git
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nyt-express-backend.git
   cd nyt-express-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your New York Times API key and database connection string:
   ```
   NYT_API_KEY=your_nyt_api_key
   DATABASE_URL=your_database_connection_string
   ```

4. Start the application:
   ```
   npm start
   ```
