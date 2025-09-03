# 🚀 Kanban Board - Modern Task Management

A full-stack Kanban board application built with React, Node.js, and MongoDB. Features drag & drop functionality, real-time collaboration, and a beautiful modern UI.

![Kanban Board](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-18-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-orange)

## ✨ Features

### 🎯 Core Functionality
- **Drag & Drop**: Intuitive task management with React Beautiful DnD
- **Real-time Updates**: Live collaboration using Socket.io
- **User Authentication**: Secure JWT-based authentication
- **Board Management**: Create, edit, and organize multiple boards
- **Task Management**: Full CRUD operations for tasks
- **User Assignment**: Assign tasks to team members
- **Priority Levels**: Set task priorities (Low, Medium, High, Urgent)
- **Due Dates**: Track task deadlines
- **Comments**: Add comments to tasks
- **Search & Filter**: Find tasks quickly

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful modern interface
- **Responsive Layout**: Works on all devices
- **Dark/Light Theme**: Customizable appearance
- **Smooth Animations**: Delightful user interactions
- **Loading States**: Optimistic UI updates
- **Toast Notifications**: Real-time feedback

### 🔧 Technical Features
- **Redux State Management**: Centralized state with Redux Toolkit
- **Form Validation**: React Hook Form with validation
- **Error Handling**: Comprehensive error management
- **Performance Optimized**: Lazy loading and memoization
- **Accessibility**: WCAG compliant components
- **Testing**: Unit and integration tests

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **React Beautiful DnD** - Drag & drop
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date manipulation
- **Vite** - Build tool
- **Vitest** - Testing framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Jest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kanban-board.git
   cd kanban-board
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `server/.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Start the application**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
kanban-board/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store & slices
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom hooks
│   │   └── styles/        # CSS files
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── package.json
│   └── index.js
└── README.md
```

## 🔧 Configuration

### Database Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`

### Authentication
- JWT tokens are used for authentication
- Tokens expire after 7 days by default
- Password hashing with bcryptjs

### Real-time Features
- Socket.io enables real-time updates
- Automatic reconnection on network issues
- Optimistic UI updates for better UX

## 📱 Usage

### Creating a Board
1. Click "Create Board" from dashboard or sidebar
2. Fill in board details (title, description, color)
3. Set visibility (private/public)
4. Click "Create Board"

### Managing Tasks
1. Navigate to a board
2. Click "Add Task" in any column
3. Fill in task details
4. Assign to team members
5. Set priority and due date
6. Drag & drop between columns

### Collaboration
- Real-time updates for all users
- See who's online
- Live task updates
- Instant notifications

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm run test
```

### Backend Tests
```bash
cd server
npm test
```

### Test Coverage
- Component unit tests
- Redux slice tests
- API endpoint tests
- Integration tests

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy to your platform
3. Update frontend API URL

### Environment Variables
```env
# Production
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-url.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint rules
- Write tests for new features
- Update documentation
- Use conventional commits

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Board Endpoints
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Task Endpoints
- `GET /api/boards/:boardId/tasks` - Get board tasks
- `POST /api/boards/:boardId/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check your connection string
- Ensure your IP is whitelisted
- Verify database credentials

**Socket.io Connection Issues**
- Check CORS settings
- Verify server is running
- Check network connectivity

**Build Errors**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) for drag & drop
- [Socket.io](https://socket.io/) for real-time communication
- [Lucide React](https://lucide.dev/) for beautiful icons
- [React Hook Form](https://react-hook-form.com/) for form management

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@kanbanboard.com
- 💬 Discord: [Join our community](https://discord.gg/kanbanboard)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/kanban-board/issues)

---

**Made with ❤️ by [Your Name]**

⭐ Star this repository if you found it helpful!
