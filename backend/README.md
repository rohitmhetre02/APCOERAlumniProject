# APCOER Alumni Backend

A comprehensive Node.js backend API for the APCOER Alumni Network built with Express.js and ES Modules.

## 🚀 Features

- **Authentication & Authorization** with JWT
- **User Management** with role-based access control
- **RESTful API** with proper HTTP status codes
- **Input Validation** using express-validator
- **Security** with helmet, CORS, rate limiting
- **Database Integration** with MongoDB/Mongoose
- **Password Hashing** with bcryptjs
- **Comprehensive Error Handling**
- **Request Logging** with Morgan
- **Environment Configuration** with dotenv

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── userController.js     # User management logic
│   ├── middleware/
│   │   ├── auth.js               # Authentication middleware
│   │   └── validation.js         # Input validation middleware
│   ├── models/
│   │   └── User.js               # User model/schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── users.js              # User management routes
│   └── app.js                    # Express app configuration
│
├── server.js                     # Server entry point
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/apcoer-alumni`

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |

### User Management (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/stats` | Get user statistics | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PATCH | `/api/users/:id/toggle-status` | Toggle user status | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/health` | Server health check | Public |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** to receive a JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Access protected routes** with valid token

### Example Request

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Access protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 📋 User Roles

- **student**: Default role for registered students
- **alumni**: Graduated students with alumni privileges
- **faculty**: Faculty members with elevated permissions
- **admin**: System administrators with full access

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse (100 requests per 15 minutes)
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive request validation
- **JWT Authentication**: Secure token-based authentication

## 📊 Environment Variables

Key environment variables to configure:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/apcoer-alumni

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🧪 Development

### Running Tests

```bash
npm test
```

### Development Server

```bash
npm run dev
```

The server will automatically restart on file changes with nodemon.

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🚀 Deployment

1. **Set environment variables** for production
2. **Build the application** (if needed)
3. **Start the server** with `npm start`

### Production Considerations

- Use a strong JWT secret
- Enable HTTPS
- Configure proper CORS origins
- Set up database backups
- Monitor application logs
- Use process managers like PM2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for APCOER Alumni Network**
