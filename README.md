# Store Rating Platform

A full-stack web application for rating and managing stores with role-based access control.

## Features

- **Three User Roles**: System Administrator, Normal User, Store Owner
- **Authentication**: JWT-based authentication with secure password hashing
- **Store Management**: Create, view, and manage stores
- **Rating System**: Submit and manage ratings (1-5 stars)
- **Admin Dashboard**: Comprehensive analytics and user management
- **Store Owner Portal**: View ratings and analytics for owned stores
- **Responsive Design**: Modern UI with animations and professional styling

## Tech Stack

- **Frontend**: React.js with Next.js, TypeScript, Tailwind CSS
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, Rate limiting

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
\`\`\`sql
CREATE DATABASE store_rating_db;
\`\`\`

2. Create a `.env` file in the `server` directory:
\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/store_rating_db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
\`\`\`

3. Run the database schema and seed scripts:
\`\`\`bash
# Connect to your PostgreSQL database and run:
# scripts/01-create-database-schema.sql
# scripts/02-seed-initial-data.sql
\`\`\`

### Backend Setup

1. Navigate to the server directory:
\`\`\`bash
cd server
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The backend will run on `http://localhost:5000`

### Frontend Setup

1. In the root directory, install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

### Running Both Servers

You can run both frontend and backend simultaneously:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users with filtering
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Stores
- `GET /api/stores` - Get all stores with search and ratings
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create new store (Admin only)

### Ratings
- `POST /api/ratings/stores/:storeId` - Submit/update rating
- `GET /api/ratings/stores/:storeId` - Get store ratings (Store Owner)
- `DELETE /api/ratings/stores/:storeId` - Delete rating

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard statistics
- `GET /api/dashboard/store-owner` - Store owner dashboard

## Default Login Credentials

### System Administrator
- Email: `admin@storerating.com`
- Password: `Admin123!`

### Normal Users
- Email: `john.smith@email.com`
- Password: `User123!`

### Store Owners
- Email: `robert.anderson@techelectronics.com`
- Password: `Owner123!`

## Form Validations

- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters with uppercase and special character
- **Address**: Maximum 400 characters
- **Rating**: Integer between 1-5

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- SQL injection prevention
- XSS protection with Helmet

## Database Schema

The application uses three main tables:
- `users` - User accounts with roles
- `stores` - Store information
- `ratings` - User ratings for stores

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
