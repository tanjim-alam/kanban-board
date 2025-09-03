# Kanban Board - Backend Server

A robust Node.js backend server for the Kanban Board application with real-time collaboration features.

## Features

- **RESTful API** - Complete CRUD operations for boards, tasks, and users
- **Real-time Updates** - Socket.io integration for live collaboration
- **Authentication** - JWT-based authentication with bcrypt password hashing
- **Database** - MongoDB with Mongoose ODM
- **Validation** - Request validation using express-validator
- **Error Handling** - Comprehensive error handling and logging
- **CORS Support** - Cross-origin resource sharing configuration

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Document Mapper
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **dotenv** - Environment variables
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/kanbanboard
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

4. Start the development server:
```bash
npm run dev
```

The server will be available at `http://localhost:3001`.

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Boards
- `GET /api/boards` - Get all user boards
- `GET /api/boards/:id` - Get specific board
- `POST /api/boards` - Create new board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/members` - Add board member
- `DELETE /api/boards/:id/members/:userId` - Remove board member

### Tasks
- `GET /api/tasks/board/:boardId` - Get all tasks for a board
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/move` - Move task to different column
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Users
- `GET /api/users` - Get all users (for assignment)
- `GET /api/users/:id` - Get specific user

## Database Models

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String,
  role: String,
  isActive: Boolean,
  lastLogin: Date,
  preferences: Object
}
```

### Board
```javascript
{
  title: String,
  description: String,
  columns: [ColumnSchema],
  columnOrder: [String],
  owner: ObjectId (User),
  members: [ObjectId (User)],
  isPublic: Boolean,
  settings: Object
}
```

### Task
```javascript
{
  title: String,
  description: String,
  columnId: String,
  boardId: ObjectId (Board),
  priority: String,
  status: String,
  assignees: [ObjectId (User)],
  tags: [String],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  comments: [CommentSchema],
  attachments: [AttachmentSchema],
  createdBy: ObjectId (User),
  lastModifiedBy: ObjectId (User),
  position: Number
}
```

## Socket.io Events

### Client to Server
- `join-board` - Join a board room
- `leave-board` - Leave a board room
- `task-updated` - Task was updated
- `task-created` - Task was created
- `task-deleted` - Task was deleted
- `column-updated` - Column was updated

### Server to Client
- `task-updated` - Broadcast task update
- `task-created` - Broadcast task creation
- `task-deleted` - Broadcast task deletion
- `column-updated` - Broadcast column update

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User registers/logs in
2. Server returns JWT token
3. Client includes token in Authorization header: `Bearer <token>`
4. Server validates token on protected routes

## Error Handling

The server includes comprehensive error handling:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

Error response format:
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Testing

Run tests:
```bash
npm test
```

Test coverage includes:
- API endpoints
- Database models
- Authentication middleware
- Socket.io events

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kanbanboard` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration | `7d` |

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Rate limiting (can be added)
- Helmet.js for security headers (can be added)

## Performance Optimizations

- Database indexing
- Connection pooling
- Efficient queries with population
- Socket.io room management
- Error handling and logging

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set secure JWT secret
4. Configure CORS for production domain
5. Use PM2 or similar for process management

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

