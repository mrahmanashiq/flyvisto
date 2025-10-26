# ✈️ Flyvisto - Advanced Flight Booking System

> **Redefining the Way You Book Flights**

A comprehensive, scalable, and secure flight booking and management system built with modern technologies and best practices.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with refresh tokens
- **Role-based Authorization** (Customer, Agent, Admin)
- **Email Verification** and password reset
- **Rate Limiting** to prevent abuse
- **Input Sanitization** and validation
- **CORS Protection** with configurable origins
- **Security Headers** (CSP, XSS Protection, etc.)

### ✈️ Flight Management
- **Advanced Flight Search** with multiple filters
- **Real-time Seat Availability**
- **Dynamic Pricing** by seat class
- **Flight Status Tracking**
- **Multi-airport Route Support**
- **Seat Selection** with seat maps

### 💺 Booking System
- **Multi-passenger Bookings** (up to 9 passengers)
- **Seat Assignment** with preferences
- **Booking Management** with PNR generation
- **Payment Integration** (Stripe ready)
- **Booking Notifications** via email
- **Cancellation & Refund** handling

### 🏢 Administrative Features
- **Flight Scheduling** and management
- **Airline & Airport** management
- **User Management** with role assignment
- **Booking Analytics** and reporting
- **System Monitoring** and health checks

### 🛠 Technical Excellence
- **Comprehensive API Documentation** (Swagger/OpenAPI)
- **Database Migrations** and seeders
- **Automated Testing** (Jest, Supertest)
- **Docker Support** for containerization
- **CI/CD Ready** with GitHub Actions
- **Structured Logging** with Winston
- **Error Handling** with custom error classes

## 📋 Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Redis** 7.x (for caching and sessions)
- **Docker** & Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/flyvisto.git
cd flyvisto

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

### Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Flight Search

```bash
# Search flights
curl "http://localhost:3000/api/v1/flights/search?from=JFK&to=LAX&departureDate=2024-12-01&passengers=2&class=economy"
```

## 🗄️ Database Schema

### Core Entities

- **Users** - Customer accounts with authentication
- **Airlines** - Airline companies and their details
- **Airports** - Airport information with IATA codes
- **Airplanes** - Aircraft fleet with seat configurations
- **Flights** - Flight schedules and pricing
- **Bookings** - Reservation records with PNR
- **Passengers** - Individual passenger details
- **Seats** - Seat inventory and assignments
- **Payments** - Payment processing and history
- **Notifications** - User communication system

### Database Migrations

```bash
# Create a new migration
npx sequelize-cli migration:generate --name create-table-name

# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:migrate:undo

# Reset database
npm run db:migrate:undo:all && npm run db:migrate
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration

# Watch mode
npm run test:watch
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_NAME=flyvisto_dev
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🐳 Docker Deployment

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access database
docker exec -it flyvisto-mysql-dev mysql -u flyvisto -p
```

### Production

```bash
# Build and start production environment
docker-compose --profile production up -d

# Scale application
docker-compose up -d --scale app=3
```

## 📊 Monitoring & Logging

### Health Checks

- **Application Health**: `GET /health`
- **Database Health**: Included in health endpoint
- **Redis Health**: Included in health endpoint

### Logging

Structured logging with Winston:
- **Console**: Development mode
- **File Rotation**: Production mode
- **Log Levels**: Error, Warn, Info, Debug
- **Request Logging**: All HTTP requests

### Metrics

- **Response Times**: Request duration tracking
- **Error Rates**: Error frequency monitoring
- **API Usage**: Endpoint usage statistics

## 🔒 Security Features

### Security Measures Implemented

1. **Authentication Security**
   - JWT tokens with expiration
   - Refresh token rotation
   - Password hashing with bcrypt
   - Email verification required

2. **API Security**
   - Rate limiting per endpoint
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection headers

3. **Network Security**
   - CORS configuration
   - Security headers (CSP, HSTS)
   - Request size limiting
   - Proxy trust configuration

4. **Data Security**
   - Sensitive data encryption
   - PII data handling
   - Audit logging
   - Access control by role

## 📈 Scalability Features

### Performance Optimizations

- **Database Indexing**: Optimized for common queries
- **Connection Pooling**: Efficient database connections
- **Redis Caching**: Frequent data caching
- **Compression**: Response compression enabled
- **Pagination**: Large dataset handling

### Horizontal Scaling

- **Stateless Design**: No server-side sessions
- **Load Balancer Ready**: Multiple instance support
- **Database Separation**: Read/write replicas support
- **Microservice Ready**: Modular architecture

## 🎯 API Endpoints Overview

### Authentication Endpoints
```
POST   /api/v1/auth/register          # User registration
POST   /api/v1/auth/login             # User login
POST   /api/v1/auth/refresh           # Refresh tokens
POST   /api/v1/auth/logout            # User logout
GET    /api/v1/auth/verify-email      # Email verification
POST   /api/v1/auth/request-password-reset  # Request password reset
POST   /api/v1/auth/reset-password    # Reset password
POST   /api/v1/auth/change-password   # Change password
GET    /api/v1/auth/profile           # Get user profile
```

### Flight Endpoints
```
GET    /api/v1/flights/search         # Search flights
GET    /api/v1/flights/:id            # Get flight details
GET    /api/v1/flights/:id/seats      # Get available seats
GET    /api/v1/flights/route/:from/:to # Get flights by route
POST   /api/v1/flights                # Create flight (Admin)
PUT    /api/v1/flights/:id            # Update flight (Admin)
PATCH  /api/v1/flights/:id/status     # Update flight status
```

### Booking Endpoints (To be implemented)
```
POST   /api/v1/bookings               # Create booking
GET    /api/v1/bookings               # Get user bookings
GET    /api/v1/bookings/:id           # Get booking details
PATCH  /api/v1/bookings/:id/cancel    # Cancel booking
POST   /api/v1/bookings/:id/checkin   # Check-in passenger
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** for the robust web framework
- **Sequelize** for excellent ORM capabilities
- **JWT** for secure authentication
- **Docker** for containerization
- **Swagger** for API documentation
- **Winston** for comprehensive logging

## 📞 Support

For support, email support@flyvisto.com or create an issue in this repository.

---

**Built with ❤️ by the Flyvisto Team**

*Making flight booking simple, secure, and scalable.*
