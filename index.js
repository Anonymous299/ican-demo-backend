const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');

// Import route modules
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const curriculumRoutes = require('./routes/curriculum');
const attendanceRoutes = require('./routes/attendance');
const testsRoutes = require('./routes/tests');
const studentsRoutes = require('./routes/students');

// Import middleware and data
const { authenticateToken } = require('./middleware/auth');
const { data, demoPdfBuffer } = require('./data/mockData');

const app = express();
const PORT = process.env.PORT || 5050;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:4173',
      'https://ican-demo-frontend.vercel.app'
    ];
    
    // Check if origin is in allowed list or matches Vercel pattern
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.match(/^https:\/\/ican-demo-frontend-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/students', studentsRoutes);

// Competency management routes
app.get('/api/competencies', authenticateToken, (req, res) => {
  res.json(data.curricularGoals);
});

app.get('/api/competencies/:domain', authenticateToken, (req, res) => {
  const domain = req.params.domain;
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  res.json(data.curricularGoals[domain]);
});

app.post('/api/competencies/:domain', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const { title, description } = req.body;
  
  if (!data.curricularGoals[domain]) {
    data.curricularGoals[domain] = [];
  }
  
  const maxId = Math.max(...Object.values(data.curricularGoals).flat().map(g => g.id), 0);
  const newGoal = {
    id: maxId + 1,
    title,
    description,
    competencies: [],
    createdAt: new Date().toISOString()
  };
  
  data.curricularGoals[domain].push(newGoal);
  res.json(newGoal);
});

// Template management routes
app.get('/api/templates', authenticateToken, (req, res) => {
  res.json(data.templates);
});

app.get('/api/templates/:category', authenticateToken, (req, res) => {
  const category = req.params.category;
  if (!data.templates[category]) {
    return res.status(404).json({ error: 'Template category not found' });
  }
  res.json(data.templates[category]);
});

// Student management routes
app.get('/api/students', authenticateToken, (req, res) => {
  if (req.user.role === 'parent') {
    const parentStudents = data.students.filter(s => req.user.studentIds.includes(s.id));
    return res.json(parentStudents);
  } else if (req.user.role === 'student') {
    const studentData = data.students.find(s => s.id === req.user.studentId);
    return res.json(studentData ? [studentData] : []);
  }
  
  const { search, class: className, standard, division } = req.query;
  let filteredStudents = [...data.students];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredStudents = filteredStudents.filter(s => 
      s.name.toLowerCase().includes(searchLower) ||
      s.rollNumber.toLowerCase().includes(searchLower) ||
      s.studentId.toLowerCase().includes(searchLower)
    );
  }
  
  if (className) {
    filteredStudents = filteredStudents.filter(s => s.class === className);
  }
  
  if (standard) {
    filteredStudents = filteredStudents.filter(s => s.standard === standard);
  }
  
  if (division) {
    filteredStudents = filteredStudents.filter(s => s.division === division);
  }
  
  res.json(filteredStudents);
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = data.students.find(s => s.id === studentId);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  if (req.user.role === 'parent' && !req.user.studentIds.includes(studentId)) {
    return res.status(403).json({ error: 'Access denied' });
  } else if (req.user.role === 'student' && req.user.studentId !== studentId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json(student);
});

app.post('/api/students', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const maxId = Math.max(...data.students.map(s => s.id), 0);
  const newStudent = {
    id: maxId + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.students.push(newStudent);
  
  const classItem = data.classes.find(c => c.name === newStudent.class);
  if (classItem) {
    classItem.currentEnrollment = data.students.filter(s => s.class === classItem.name).length;
  }
  
  res.json(newStudent);
});

// Activity and portfolio routes
app.get('/api/domains', authenticateToken, (req, res) => {
  res.json(data.domains);
});

app.get('/api/activity-competencies', authenticateToken, (req, res) => {
  res.json(data.activityCompetencies);
});

app.get('/api/learning-outcomes', authenticateToken, (req, res) => {
  res.json(data.learningOutcomes);
});

app.get('/api/rubric-entries', authenticateToken, (req, res) => {
  res.json(data.rubricEntries);
});

// Activities routes
app.post('/api/activities', authenticateToken, (req, res) => {
  const maxId = Math.max(...data.activities.map(a => a.id), 0);
  const newActivity = {
    id: maxId + 1,
    ...req.body,
    teacherId: req.user.id,
    teacherEmail: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.activities.push(newActivity);
  res.json(newActivity);
});

app.get('/api/activities/class/:classId', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.classId);
  const classActivities = data.activities.filter(a => a.classId === classId);
  res.json(classActivities);
});

// Feedback and observations routes
app.post('/api/feedback/:type', authenticateToken, (req, res) => {
  const type = req.params.type;
  if (!data.feedback[type]) {
    return res.status(400).json({ error: 'Invalid feedback type' });
  }
  
  const newFeedback = {
    id: Date.now(),
    ...req.body,
    submittedBy: req.user.email,
    submittedAt: new Date().toISOString()
  };
  
  data.feedback[type].push(newFeedback);
  res.json(newFeedback);
});

app.post('/api/observations', authenticateToken, (req, res) => {
  const newObservation = {
    id: Date.now(),
    ...req.body,
    observerId: req.user.id,
    observerEmail: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  data.observations.push(newObservation);
  res.json(newObservation);
});

// Portfolio routes
app.get('/api/portfolio/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const portfolioItems = data.portfolio.filter(p => p.studentId === studentId);
  res.json(portfolioItems);
});

app.post('/api/portfolio', authenticateToken, (req, res) => {
  const maxId = Math.max(...data.portfolio.map(p => p.id), 0);
  const newPortfolioItem = {
    id: maxId + 1,
    ...req.body,
    uploadedBy: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  data.portfolio.push(newPortfolioItem);
  res.json(newPortfolioItem);
});

// Assessment routes
app.post('/api/assessments', authenticateToken, (req, res) => {
  const newAssessment = {
    id: Date.now(),
    ...req.body,
    assessedBy: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.assessments.push(newAssessment);
  res.json(newAssessment);
});

app.get('/api/assessments/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const studentAssessments = data.assessments.filter(a => a.studentId === studentId);
  res.json(studentAssessments);
});

// PDF upload route
app.post('/api/upload-demo-pdf', authenticateToken, upload.single('demoPdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }
  
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  
  demoPdfBuffer.set(req.file.buffer);
  
  res.json({
    message: 'Demo PDF uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size
  });
});

app.get('/api/demo-pdf-status', authenticateToken, (req, res) => {
  res.json({
    hasDemo: !!demoPdfBuffer.get(),
    uploadedAt: demoPdfBuffer.get() ? new Date().toISOString() : null
  });
});

// HPC generation route
app.get('/api/generate-hpc/:studentId/:term', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const term = req.params.term;
  
  const student = data.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  if (!demoPdfBuffer.get()) {
    return res.status(400).json({ error: 'No demo PDF template available. Please upload a PDF template first.' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${student.name}_HPC_${term}.pdf"`);
  res.send(demoPdfBuffer.get());
});

// Template download routes
app.get('/api/templates/student', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const templateData = [
    {
      'Student Name': 'John Doe',
      'Roll Number': 'R001',
      'Student ID': 'STU001',
      'Date of Birth': '2018-01-15',
      'Standard': '1',
      'Division': 'A',
      'Class': 'Grade 1A',
      'APAAR ID': 'APAAR001',
      'Address': '123 Main Street, City',
      'Phone': '9876543210',
      'Mother Name': 'Jane Doe',
      'Mother Education': 'M.A.',
      'Mother Occupation': 'Teacher',
      'Father Name': 'Robert Doe',
      'Father Education': 'B.Tech',
      'Father Occupation': 'Engineer',
      'Siblings': '1',
      'Sibling Age': '5',
      'Mother Tongue': 'English',
      'Medium of Instruction': 'English',
      'Is Rural': 'false'
    }
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.xlsx"');
  res.send(buffer);
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;