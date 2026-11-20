# MoodBeats Backend API

Backend API for MoodBeats - A premium study productivity platform. Built with Node.js, Express, and PostgreSQL.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) - Username-only authentication
- **Validation**: Zod

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── db.js        # PostgreSQL connection pool
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── goal.controller.js
│   │   └── session.controller.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── goal.routes.js
│   │   └── session.routes.js
│   ├── services/        # Business logic layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── goal.service.js
│   │   └── session.service.js
│   ├── validators/      # Request validation schemas
│   │   ├── auth.validator.js
│   │   ├── session.validator.js
│   │   └── goal.validator.js
│   ├── utils/           # Utility functions
│   │   └── apiResponse.js
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── tests/               # Test files
├── .env                 # Environment variables (not tracked)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Node.js dependencies and scripts
└── README.md            # This file
```

## Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DATABASE_URL=postgresql://username:password@localhost:5432/moodbeats
   JWT_SECRET=your_secure_random_secret_here
   JWT_EXPIRES_IN=1d
   ```

4. **Set up the database:**

   Create a PostgreSQL database named `moodbeats`:
   ```bash
   createdb moodbeats
   ```

   Run the schema script from the `dbms/` directory:
   ```bash
   psql -d moodbeats -f ../dbms/03_schema.sql
   ```

## Running the Server

### Development Mode

Start the server with hot-reload using nodemon:
```bash
npm run dev
```

### Production Mode

Start the server:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env).

## API Endpoints

### Health Check

**GET** `/api/health`
- **Description**: Check if the API is running
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "message": "MoodBeats API is running",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "development"
  }
  ```

### Authentication

**POST** `/api/auth/register`
- **Description**: Register a new user
- **Access**: Public
- **Body**: `{ "userName": "string" }`

**POST** `/api/auth/login`
- **Description**: Login user (creates user if doesn't exist)
- **Access**: Public
- **Body**: `{ "userName": "string" }`

### Users

**GET** `/api/users/me`
- **Description**: Get current user profile
- **Access**: Private (requires JWT)

**GET** `/api/users/:userId`
- **Description**: Get user by ID
- **Access**: Private (requires JWT)

### Study Goals

**GET** `/api/goals`
- **Description**: Get user's weekly study goal
- **Access**: Private (requires JWT)

**POST** `/api/goals`
- **Description**: Set or update weekly study goal
- **Access**: Private (requires JWT)
- **Body**: `{ "weeklyGoalMinutes": number }`

**GET** `/api/goals/progress`
- **Description**: Get progress towards weekly goal
- **Access**: Private (requires JWT)

**DELETE** `/api/goals`
- **Description**: Delete user's study goal
- **Access**: Private (requires JWT)

### Study Sessions

**GET** `/api/sessions`
- **Description**: Get user's study sessions
- **Access**: Private (requires JWT)
- **Query Params**: `limit` (default: 20), `offset` (default: 0)

**POST** `/api/sessions`
- **Description**: Create a new study session
- **Access**: Private (requires JWT)
- **Body**: Session data with pre-check-in

**GET** `/api/sessions/:sessionId`
- **Description**: Get a single session by ID
- **Access**: Private (requires JWT)

**PUT** `/api/sessions/:sessionId/complete`
- **Description**: Complete a study session
- **Access**: Private (requires JWT)
- **Body**: Completion data with post-check-in

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with username-only login.

**⚠️ Security Note**: This implementation uses username-only authentication without passwords. This is a simplified authentication model suitable for development or controlled environments. For production use with sensitive data, implement password-based authentication or OAuth2.

### Using Protected Endpoints

Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Structure

Tokens contain:
- `userId`: User's database ID
- `userName`: User's name
- Expiration time (default: 1 day)

## Database Connection

The API uses PostgreSQL with a connection pool. Database configuration is in `src/config/db.js`.

### Connection String Format

```
postgresql://username:password@host:port/database
```

### Testing Database Connection

The server automatically tests the database connection on startup. Check the console output for connection status.

You can also verify the connection by checking the health endpoint response.

## Error Handling

The API uses centralized error handling with standard response formats.

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## Testing

Run tests:
```bash
npm test
```

Currently, the test framework is set up but test files need to be created in the `tests/` directory.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |

## Security Considerations

- **JWT Secret**: Use a long, random secret in production
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit `.env` file
- **CORS**: Configure `CLIENT_URL` appropriately
- **Database Credentials**: Use strong passwords and restrict access
- **Input Validation**: All inputs are validated using Zod schemas

## Development

### Code Style

- ES6+ JavaScript with ES modules
- Async/await for asynchronous operations
- Consistent error handling
- Descriptive variable and function names

### Adding New Features

1. Create service functions in `src/services/`
2. Create controller handlers in `src/controllers/`
3. Define routes in `src/routes/`
4. Add validation schemas in `src/validators/`
5. Update this README with new endpoints

## Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists and schema is loaded
- Check user permissions

### Port Already in Use

- Change `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Check token format in Authorization header
- Verify token hasn't expired

## License

ISC
