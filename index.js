const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = 'ican-demo-secret-key';

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// In-memory data storage
const data = {
  users: [
    { id: 1, email: 'admin@gmail.com', password: bcrypt.hashSync('12345', 10), role: 'admin' },
    { id: 2, email: 'teacher@gmail.com', password: bcrypt.hashSync('12345', 10), role: 'teacher' }
  ],
  teachers: [],
  students: [
    { id: 1, name: 'Emma Johnson', age: 6, classId: 1, dateOfBirth: '2018-03-15', parentContact: 'emma.parent@email.com', notes: 'Enjoys art activities, shy initially but warms up quickly' },
    { id: 2, name: 'Liam Chen', age: 5, classId: 1, dateOfBirth: '2018-11-22', parentContact: 'liam.parent@email.com', notes: 'Very curious about science, loves asking questions' },
    { id: 3, name: 'Sofia Rodriguez', age: 6, classId: 1, dateOfBirth: '2018-07-08', parentContact: 'sofia.parent@email.com', notes: 'Natural leader, great at helping classmates' },
    { id: 4, name: 'Noah Wilson', age: 7, classId: 2, dateOfBirth: '2017-12-03', parentContact: 'noah.parent@email.com', notes: 'Excellent reader, prefers quiet activities' },
    { id: 5, name: 'Ava Thompson', age: 7, classId: 2, dateOfBirth: '2017-09-18', parentContact: 'ava.parent@email.com', notes: 'Very social, enjoys group activities and games' },
    { id: 6, name: 'Mason Davis', age: 6, classId: 2, dateOfBirth: '2018-01-25', parentContact: 'mason.parent@email.com', notes: 'Creative thinker, loves building and construction' }
  ],
  classes: [
    { id: 1, name: 'Grade 1A', description: 'Morning class for 5-6 year olds', teacherId: 2, capacity: 20, currentEnrollment: 3 },
    { id: 2, name: 'Grade 1B', description: 'Afternoon class for 6-7 year olds', teacherId: 2, capacity: 20, currentEnrollment: 3 },
    { id: 3, name: 'Grade 2A', description: 'Advanced morning class', teacherId: null, capacity: 18, currentEnrollment: 0 }
  ],
  competencies: {
    'CG-1': [
      { id: 1, title: 'Follows basic safety rules', description: 'Children understand and follow basic safety rules in various environments', createdAt: new Date().toISOString() },
      { id: 2, title: 'Practices good hygiene habits', description: 'Children develop and maintain good personal hygiene practices', createdAt: new Date().toISOString() }
    ],
    'CG-2': [
      { id: 3, title: 'Distinguishes different textures', description: 'Children can identify and describe various textures through touch', createdAt: new Date().toISOString() },
      { id: 4, title: 'Recognizes different sounds', description: 'Children can identify and differentiate various sounds in their environment', createdAt: new Date().toISOString() }
    ],
    'CG-3': [
      { id: 5, title: 'Demonstrates gross motor skills', description: 'Children show coordination in running, jumping, and climbing activities', createdAt: new Date().toISOString() },
      { id: 6, title: 'Shows fine motor control', description: 'Children demonstrate precision in activities requiring hand-eye coordination', createdAt: new Date().toISOString() }
    ]
  },
  templates: {
    teacher: [
      {
        id: 1,
        name: 'Daily Lesson Plan Template',
        description: 'Standard template for daily lesson planning',
        content: 'Objective:\n\nMaterials Needed:\n\nActivities:\n1. \n2. \n3. \n\nAssessment:\n\nReflection:',
        category: 'lesson-planning',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Student Progress Report Template',
        description: 'Template for documenting student progress',
        content: 'Student Name:\nDate:\n\nAcademic Progress:\n- \n- \n\nSocial-Emotional Development:\n- \n- \n\nRecommendations:\n- ',
        category: 'assessment',
        createdAt: new Date().toISOString()
      }
    ],
    parent: [
      {
        id: 3,
        name: 'Weekly Progress Update Template',
        description: 'Template for weekly parent communication',
        content: 'Dear Parents,\n\nThis week your child:\n\nAcademic Highlights:\n- \n- \n\nSocial Activities:\n- \n- \n\nUpcoming Events:\n- \n\nBest regards,\n[Teacher Name]',
        category: 'communication',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Parent-Teacher Conference Notes',
        description: 'Template for conference documentation',
        content: 'Conference Date:\nParent(s) Present:\nTeacher(s) Present:\n\nDiscussion Points:\n1. \n2. \n3. \n\nAction Items:\n- \n- \n\nNext Steps:\n- ',
        category: 'meetings',
        createdAt: new Date().toISOString()
      }
    ],
    student: [
      {
        id: 5,
        name: 'Learning Journal Template',
        description: 'Template for student learning reflections',
        content: 'Date:\n\nWhat I Learned Today:\n\nWhat I Found Interesting:\n\nWhat I Want to Learn More About:\n\nHow I Feel About My Learning:',
        category: 'reflection',
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Goal Setting Template',
        description: 'Template for student goal setting',
        content: 'My Learning Goals\n\nThis Week I Want To:\n1. \n2. \n3. \n\nThis Month I Want To:\n1. \n2. \n\nHow I Will Achieve These Goals:\n- \n- ',
        category: 'goals',
        createdAt: new Date().toISOString()
      }
    ]
  },
  activities: [],
  domains: [
    { id: 1, name: 'Physical Development', description: 'Motor skills and physical coordination' },
    { id: 2, name: 'Cognitive Development', description: 'Thinking, reasoning, and problem-solving' },
    { id: 3, name: 'Language Development', description: 'Communication and language skills' },
    { id: 4, name: 'Social-Emotional Development', description: 'Social skills and emotional intelligence' },
    { id: 5, name: 'Creative Expression', description: 'Arts, creativity, and self-expression' }
  ],
  activityCompetencies: [
    { id: 1, name: 'Problem Solving', description: 'Ability to identify and solve problems creatively' },
    { id: 2, name: 'Teamwork', description: 'Working effectively with others towards common goals' },
    { id: 3, name: 'Critical Thinking', description: 'Analyzing information and making reasoned decisions' },
    { id: 4, name: 'Communication', description: 'Expressing ideas clearly and listening effectively' },
    { id: 5, name: 'Self-Regulation', description: 'Managing emotions and behaviors appropriately' }
  ],
  feedback: {
    general: [],
    parent: [],
    student: [],
    peer: []
  },
  observations: []
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = data.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Protected routes
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Teacher Management Routes
app.get('/api/teachers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(data.teachers);
});

app.post('/api/teachers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, email, phone, subjects, classes, isClassTeacher, classTeacherFor } = req.body;
  const newTeacher = {
    id: Date.now(),
    name,
    email,
    phone,
    subjects: subjects || [],
    classes: classes || [],
    isClassTeacher: isClassTeacher || false,
    classTeacherFor: classTeacherFor || null,
    createdAt: new Date().toISOString()
  };
  
  data.teachers.push(newTeacher);
  res.json(newTeacher);
});

app.put('/api/teachers/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const teacherId = parseInt(req.params.id);
  const teacherIndex = data.teachers.findIndex(t => t.id === teacherId);
  
  if (teacherIndex === -1) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  data.teachers[teacherIndex] = { ...data.teachers[teacherIndex], ...req.body };
  res.json(data.teachers[teacherIndex]);
});

app.delete('/api/teachers/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const teacherId = parseInt(req.params.id);
  const teacherIndex = data.teachers.findIndex(t => t.id === teacherId);
  
  if (teacherIndex === -1) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  data.teachers.splice(teacherIndex, 1);
  res.json({ message: 'Teacher deleted successfully' });
});

// Excel upload route
app.post('/api/teachers/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const teachers = XLSX.utils.sheet_to_json(worksheet);
    
    const processedTeachers = teachers.map(teacher => ({
      id: Date.now() + Math.random(),
      name: teacher.Name || teacher.name,
      email: teacher.Email || teacher.email,
      phone: teacher.Phone || teacher.phone,
      subjects: teacher.Subjects ? teacher.Subjects.split(',').map(s => s.trim()) : [],
      classes: teacher.Classes ? teacher.Classes.split(',').map(c => c.trim()) : [],
      isClassTeacher: teacher.IsClassTeacher === 'true' || teacher.IsClassTeacher === true,
      classTeacherFor: teacher.ClassTeacherFor || null,
      createdAt: new Date().toISOString()
    }));
    
    data.teachers.push(...processedTeachers);
    res.json({ message: `${processedTeachers.length} teachers uploaded successfully`, teachers: processedTeachers });
  } catch (error) {
    res.status(400).json({ error: 'Error processing Excel file: ' + error.message });
  }
});

// Competency Management Routes
app.get('/api/competencies', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(data.competencies);
});

app.get('/api/competencies/:domain', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  if (!data.competencies[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  res.json(data.competencies[domain]);
});

app.post('/api/competencies/:domain', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  if (!data.competencies[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const { title, description } = req.body;
  const newCompetency = {
    id: Date.now(),
    title,
    description,
    createdAt: new Date().toISOString()
  };
  
  data.competencies[domain].push(newCompetency);
  res.json(newCompetency);
});

app.put('/api/competencies/:domain/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const competencyId = parseInt(req.params.id);
  
  if (!data.competencies[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const competencyIndex = data.competencies[domain].findIndex(c => c.id === competencyId);
  if (competencyIndex === -1) {
    return res.status(404).json({ error: 'Competency not found' });
  }
  
  data.competencies[domain][competencyIndex] = {
    ...data.competencies[domain][competencyIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.competencies[domain][competencyIndex]);
});

app.delete('/api/competencies/:domain/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const competencyId = parseInt(req.params.id);
  
  if (!data.competencies[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const competencyIndex = data.competencies[domain].findIndex(c => c.id === competencyId);
  if (competencyIndex === -1) {
    return res.status(404).json({ error: 'Competency not found' });
  }
  
  data.competencies[domain].splice(competencyIndex, 1);
  res.json({ message: 'Competency deleted successfully' });
});

// Template Management Routes
app.get('/api/templates', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(data.templates);
});

app.get('/api/templates/:category', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const category = req.params.category;
  if (!data.templates[category]) {
    return res.status(404).json({ error: 'Template category not found' });
  }
  
  res.json(data.templates[category]);
});

app.post('/api/templates/:category', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const category = req.params.category;
  if (!data.templates[category]) {
    return res.status(404).json({ error: 'Template category not found' });
  }
  
  const { name, description, content, templateCategory } = req.body;
  const newTemplate = {
    id: Date.now(),
    name,
    description,
    content,
    category: templateCategory,
    createdAt: new Date().toISOString()
  };
  
  data.templates[category].push(newTemplate);
  res.json(newTemplate);
});

app.put('/api/templates/:category/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const category = req.params.category;
  const templateId = parseInt(req.params.id);
  
  if (!data.templates[category]) {
    return res.status(404).json({ error: 'Template category not found' });
  }
  
  const templateIndex = data.templates[category].findIndex(t => t.id === templateId);
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  data.templates[category][templateIndex] = {
    ...data.templates[category][templateIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.templates[category][templateIndex]);
});

app.delete('/api/templates/:category/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const category = req.params.category;
  const templateId = parseInt(req.params.id);
  
  if (!data.templates[category]) {
    return res.status(404).json({ error: 'Template category not found' });
  }
  
  const templateIndex = data.templates[category].findIndex(t => t.id === templateId);
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  data.templates[category].splice(templateIndex, 1);
  res.json({ message: 'Template deleted successfully' });
});

// Classes and Students Routes
app.get('/api/classes', authenticateToken, (req, res) => {
  if (req.user.role === 'teacher') {
    // Teachers can only see their assigned classes
    const teacherClasses = data.classes.filter(c => c.teacherId === req.user.id);
    res.json(teacherClasses);
  } else if (req.user.role === 'admin') {
    res.json(data.classes);
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
});

app.get('/api/students', authenticateToken, (req, res) => {
  const { classId } = req.query;
  
  if (req.user.role === 'teacher') {
    // Teachers can only see students from their classes
    const teacherClasses = data.classes.filter(c => c.teacherId === req.user.id);
    const teacherClassIds = teacherClasses.map(c => c.id);
    
    let students = data.students.filter(s => teacherClassIds.includes(s.classId));
    
    if (classId) {
      students = students.filter(s => s.classId === parseInt(classId));
    }
    
    res.json(students);
  } else if (req.user.role === 'admin') {
    let students = data.students;
    if (classId) {
      students = students.filter(s => s.classId === parseInt(classId));
    }
    res.json(students);
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = data.students.find(s => s.id === studentId);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  if (req.user.role === 'teacher') {
    // Check if teacher has access to this student's class
    const studentClass = data.classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  res.json(student);
});

// Feedback and Observation Routes
app.post('/api/feedback/:type', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const feedbackType = req.params.type;
  if (!data.feedback[feedbackType]) {
    return res.status(404).json({ error: 'Invalid feedback type' });
  }
  
  const { studentId, content, category } = req.body;
  const newFeedback = {
    id: Date.now(),
    studentId: parseInt(studentId),
    teacherId: req.user.id,
    type: feedbackType,
    content,
    category: category || 'general',
    createdAt: new Date().toISOString()
  };
  
  data.feedback[feedbackType].push(newFeedback);
  res.json(newFeedback);
});

app.post('/api/observations', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { studentId, content, domain, competency, setting, duration } = req.body;
  const newObservation = {
    id: Date.now(),
    studentId: parseInt(studentId),
    teacherId: req.user.id,
    content,
    domain: domain || null,
    competency: competency || null,
    setting: setting || 'classroom',
    duration: duration || null,
    createdAt: new Date().toISOString()
  };
  
  data.observations.push(newObservation);
  res.json(newObservation);
});

app.get('/api/feedback/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  
  if (req.user.role === 'teacher') {
    // Check if teacher has access to this student
    const student = data.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const studentClass = data.classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  const allFeedback = {
    general: data.feedback.general.filter(f => f.studentId === studentId),
    parent: data.feedback.parent.filter(f => f.studentId === studentId),
    student: data.feedback.student.filter(f => f.studentId === studentId),
    peer: data.feedback.peer.filter(f => f.studentId === studentId)
  };
  
  res.json(allFeedback);
});

app.get('/api/observations/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  
  if (req.user.role === 'teacher') {
    // Check if teacher has access to this student
    const student = data.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const studentClass = data.classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  const observations = data.observations.filter(o => o.studentId === studentId);
  res.json(observations);
});

// Activity Management Routes
app.get('/api/domains', authenticateToken, (req, res) => {
  res.json(data.domains);
});

app.get('/api/activity-competencies', authenticateToken, (req, res) => {
  res.json(data.activityCompetencies);
});

app.post('/api/activities', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { 
    studentId, 
    title, 
    domainId, 
    competencyId, 
    learningOutcomes, 
    rubric 
  } = req.body;
  
  const newActivity = {
    id: Date.now(),
    studentId: parseInt(studentId),
    teacherId: req.user.id,
    title,
    domainId: parseInt(domainId),
    competencyId: parseInt(competencyId),
    learningOutcomes,
    rubric: {
      awareness: {
        stream: rubric?.awareness?.stream || '',
        mountain: rubric?.awareness?.mountain || '',
        sky: rubric?.awareness?.sky || ''
      },
      sensitivity: {
        stream: rubric?.sensitivity?.stream || '',
        mountain: rubric?.sensitivity?.mountain || '',
        sky: rubric?.sensitivity?.sky || ''
      },
      creativity: {
        stream: rubric?.creativity?.stream || '',
        mountain: rubric?.creativity?.mountain || '',
        sky: rubric?.creativity?.sky || ''
      }
    },
    createdAt: new Date().toISOString()
  };
  
  data.activities.push(newActivity);
  res.json(newActivity);
});

app.get('/api/activities/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  
  if (req.user.role === 'teacher') {
    // Check if teacher has access to this student
    const student = data.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const studentClass = data.classes.find(c => c.id === student.classId);
    if (!studentClass || studentClass.teacherId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  const activities = data.activities.filter(a => a.studentId === studentId);
  
  // Enrich activities with domain and competency details
  const enrichedActivities = activities.map(activity => ({
    ...activity,
    domain: data.domains.find(d => d.id === activity.domainId),
    competency: data.activityCompetencies.find(c => c.id === activity.competencyId)
  }));
  
  res.json(enrichedActivities);
});

app.put('/api/activities/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const activityId = parseInt(req.params.id);
  const activityIndex = data.activities.findIndex(a => a.id === activityId);
  
  if (activityIndex === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  // Check if teacher owns this activity
  if (data.activities[activityIndex].teacherId !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own activities' });
  }
  
  const { title, domainId, competencyId, learningOutcomes, rubric } = req.body;
  
  data.activities[activityIndex] = {
    ...data.activities[activityIndex],
    title,
    domainId: parseInt(domainId),
    competencyId: parseInt(competencyId),
    learningOutcomes,
    rubric: {
      awareness: {
        stream: rubric?.awareness?.stream || '',
        mountain: rubric?.awareness?.mountain || '',
        sky: rubric?.awareness?.sky || ''
      },
      sensitivity: {
        stream: rubric?.sensitivity?.stream || '',
        mountain: rubric?.sensitivity?.mountain || '',
        sky: rubric?.sensitivity?.sky || ''
      },
      creativity: {
        stream: rubric?.creativity?.stream || '',
        mountain: rubric?.creativity?.mountain || '',
        sky: rubric?.creativity?.sky || ''
      }
    },
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.activities[activityIndex]);
});

app.delete('/api/activities/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const activityId = parseInt(req.params.id);
  const activityIndex = data.activities.findIndex(a => a.id === activityId);
  
  if (activityIndex === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  // Check if teacher owns this activity
  if (data.activities[activityIndex].teacherId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own activities' });
  }
  
  data.activities.splice(activityIndex, 1);
  res.json({ message: 'Activity deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});