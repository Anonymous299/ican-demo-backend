# Backend Modular Structure

The backend has been refactored into a modular structure for better maintainability and organization.

## Directory Structure

```
ican-demo-backend/
├── index.js                 # Main application entry point
├── middleware/              # Authentication and other middleware
│   └── auth.js             # JWT authentication middleware
├── routes/                  # Route handlers organized by feature
│   ├── auth.js             # Authentication routes (login, me)
│   ├── teachers.js         # Teacher management routes
│   ├── classes.js          # Class management routes
│   └── curriculum.js       # Curriculum planning routes
├── data/                    # Data layer
│   └── mockData.js         # In-memory data storage
└── utils/                   # Utility functions (for future use)
```

## Key Features

### Modular Route Organization
- **Auth Routes** (`/api/auth/*`): Login, user authentication
- **Teacher Routes** (`/api/teachers/*`): CRUD operations, file upload
- **Class Routes** (`/api/classes/*`): Class management, enrollment tracking
- **Curriculum Routes** (`/api/curriculum/*`): Curriculum planning with fake data

### Middleware
- **Authentication**: JWT-based token authentication
- **CORS**: Cross-origin resource sharing enabled
- **File Upload**: Multer for Excel/PDF file handling

### Data Layer
- **Mock Data**: Centralized in-memory data storage
- **Pre-seeded Data**: Includes users, students, classes, curriculum plans
- **Demo Credentials**: All users use password "12345"

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `POST /api/teachers/upload` - Upload teachers from Excel
- `GET /api/teachers/template` - Download Excel template

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/:id/stats` - Get class statistics
- `POST /api/classes/bulk` - Bulk create classes

### Curriculum Planning (New Feature)
- `GET /api/curriculum` - Get all curriculum plans
- `GET /api/curriculum/:id` - Get specific curriculum plan
- `POST /api/curriculum` - Create curriculum plan
- `PUT /api/curriculum/:id` - Update curriculum plan
- `DELETE /api/curriculum/:id` - Delete curriculum plan
- `GET /api/curriculum/:id/stats` - Get curriculum statistics
- `POST /api/curriculum/:id/units` - Add unit to curriculum
- `PUT /api/curriculum/:id/units/:unitId` - Update curriculum unit
- `DELETE /api/curriculum/:id/units/:unitId` - Delete curriculum unit

### Health Check
- `GET /health` - Server health status

## Server Configuration

- **Port**: 5050 (default, configurable via PORT environment variable)
- **Base URL**: http://localhost:5050
- **Health Check**: http://localhost:5050/health

## Demo Data

The system includes fake curriculum plans for testing:

1. **Mathematics Foundation Program** (Grade 1)
   - Numbers 1-20 unit
   - Basic Addition unit
   - Complete with objectives, activities, assessments

2. **Language Arts Exploration** (Grade 1)
   - Letter Sounds and Phonics unit
   - Integrated language arts approach

## Benefits of Modular Structure

1. **Maintainability**: Each feature has its own file
2. **Scalability**: Easy to add new route modules
3. **Testing**: Routes can be tested independently
4. **Code Organization**: Clear separation of concerns
5. **Team Development**: Different developers can work on different modules

## Migration Notes

- Original `index.js` backed up as `index_backup_original.js`
- All existing functionality preserved
- New curriculum planning endpoints added
- Password hashes updated for bcryptjs compatibility