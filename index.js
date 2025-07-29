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
    { 
      id: 1, 
      name: 'Emma Johnson', 
      rollNumber: 'R001', 
      studentId: 'STU001', 
      dateOfBirth: '2018-03-15', 
      standard: '1',
      division: 'A',
      class: 'Grade 1A', 
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    },
    { 
      id: 2, 
      name: 'Liam Chen', 
      rollNumber: 'R002', 
      studentId: 'STU002', 
      dateOfBirth: '2018-11-22', 
      standard: '1',
      division: 'A',
      class: 'Grade 1A',
      createdAt: '2024-01-15T10:31:00.000Z',
      updatedAt: '2024-01-15T10:31:00.000Z'
    },
    { 
      id: 3, 
      name: 'Sofia Rodriguez', 
      rollNumber: 'R003', 
      studentId: 'STU003', 
      dateOfBirth: '2018-07-08', 
      standard: '1',
      division: 'A',
      class: 'Grade 1A',
      createdAt: '2024-01-15T10:32:00.000Z',
      updatedAt: '2024-01-15T10:32:00.000Z'
    },
    { 
      id: 4, 
      name: 'Noah Wilson', 
      rollNumber: 'R004', 
      studentId: 'STU004', 
      dateOfBirth: '2017-12-03', 
      standard: '1',
      division: 'B',
      class: 'Grade 1B',
      createdAt: '2024-01-15T10:33:00.000Z',
      updatedAt: '2024-01-15T10:33:00.000Z'
    },
    { 
      id: 5, 
      name: 'Ava Thompson', 
      rollNumber: 'R005', 
      studentId: 'STU005', 
      dateOfBirth: '2017-09-18', 
      standard: '1',
      division: 'B',
      class: 'Grade 1B',
      createdAt: '2024-01-15T10:34:00.000Z',
      updatedAt: '2024-01-15T10:34:00.000Z'
    }
  ],
  classes: [
    { id: 1, name: 'Grade 1A', description: 'Morning class for 5-6 year olds', teacherId: 2, capacity: 20, currentEnrollment: 3 },
    { id: 2, name: 'Grade 1B', description: 'Afternoon class for 6-7 year olds', teacherId: 2, capacity: 20, currentEnrollment: 3 },
    { id: 3, name: 'Grade 2A', description: 'Advanced morning class', teacherId: null, capacity: 18, currentEnrollment: 0 }
  ],
  curricularGoals: {
    'physical': [
      {
        id: 1,
        title: 'CG-1: Children develop habits that keep them healthy and safe',
        description: 'Focuses on health, safety, and well-being habits',
        competencies: [
          { id: 1, title: 'Practices good hygiene habits', description: 'Children develop and maintain good personal hygiene practices', createdAt: new Date().toISOString() },
          { id: 2, title: 'Follows basic safety rules', description: 'Children understand and follow basic safety rules in various environments', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'CG-2: Children develop a fit and flexible body',
        description: 'Promotes physical fitness and motor skills',
        competencies: [
          { id: 3, title: 'Demonstrates gross motor skills', description: 'Children show coordination in running, jumping, and climbing activities', createdAt: new Date().toISOString() },
          { id: 4, title: 'Shows fine motor control', description: 'Children demonstrate precision in activities requiring hand-eye coordination', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    'cognitive': [
      {
        id: 3,
        title: 'CG-3: Children develop cognitive abilities through exploration',
        description: 'Develops thinking, reasoning, and problem-solving skills',
        competencies: [
          { id: 5, title: 'Solves age-appropriate problems', description: 'Children use logical thinking to solve problems and puzzles', createdAt: new Date().toISOString() },
          { id: 6, title: 'Demonstrates memory skills', description: 'Children recall and use information from previous experiences', createdAt: new Date().toISOString() },
          { id: 7, title: 'Shows curiosity and exploration', description: 'Children ask questions and investigate their environment', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    'language': [
      {
        id: 4,
        title: 'CG-4: Children develop effective communication skills',
        description: 'Promotes language development and communication abilities',
        competencies: [
          { id: 8, title: 'Expresses ideas clearly', description: 'Children communicate thoughts and feelings effectively through speech', createdAt: new Date().toISOString() },
          { id: 9, title: 'Listens and follows instructions', description: 'Children demonstrate comprehension by following multi-step directions', createdAt: new Date().toISOString() },
          { id: 10, title: 'Shows interest in reading and writing', description: 'Children engage with books and attempt writing activities', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    'socio-emotional': [
      {
        id: 5,
        title: 'CG-5: Children develop positive relationships and emotional regulation',
        description: 'Focuses on social skills and emotional intelligence',
        competencies: [
          { id: 11, title: 'Builds positive relationships', description: 'Children form friendships and interact cooperatively with peers', createdAt: new Date().toISOString() },
          { id: 12, title: 'Manages emotions appropriately', description: 'Children express feelings in healthy ways and seek help when needed', createdAt: new Date().toISOString() },
          { id: 13, title: 'Shows empathy and kindness', description: 'Children demonstrate care and consideration for others', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    'moral': [
      {
        id: 6,
        title: 'CG-6: Children develop strong moral values and character',
        description: 'Promotes ethical development and moral reasoning',
        competencies: [
          { id: 14, title: 'Demonstrates honesty and integrity', description: 'Children tell the truth and act with moral courage', createdAt: new Date().toISOString() },
          { id: 15, title: 'Shows respect for diversity', description: 'Children appreciate differences and treat all people with respect', createdAt: new Date().toISOString() },
          { id: 16, title: 'Takes responsibility for actions', description: 'Children acknowledge their choices and learn from mistakes', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      }
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
    { id: 1, name: 'Physical Development', description: 'Motor skills, coordination, health, and physical well-being' },
    { id: 2, name: 'Cognitive Development', description: 'Thinking, reasoning, problem-solving, and intellectual growth' },
    { id: 3, name: 'Language Development', description: 'Communication, vocabulary, literacy, and expression skills' },
    { id: 4, name: 'Socio-Emotional Development', description: 'Social skills, emotional regulation, and relationship building' },
    { id: 5, name: 'Moral Development', description: 'Values, ethics, character building, and moral reasoning' }
  ],
  activityCompetencies: [
    { id: 1, name: 'Problem Solving', description: 'Ability to identify and solve problems creatively' },
    { id: 2, name: 'Teamwork', description: 'Working effectively with others towards common goals' },
    { id: 3, name: 'Critical Thinking', description: 'Analyzing information and making reasoned decisions' },
    { id: 4, name: 'Communication', description: 'Expressing ideas clearly and listening effectively' },
    { id: 5, name: 'Self-Regulation', description: 'Managing emotions and behaviors appropriately' }
  ],
  learningOutcomes: [
    {
      id: 1,
      domain: 'Physical Development',
      outcomes: [
        'Children will demonstrate improved gross motor skills through running, jumping, and climbing',
        'Children will show enhanced fine motor control in drawing and writing activities',
        'Children will practice healthy habits including proper hygiene and nutrition',
        'Children will develop body awareness and spatial orientation',
        'Children will learn basic safety rules and emergency procedures'
      ]
    },
    {
      id: 2,
      domain: 'Cognitive Development',
      outcomes: [
        'Children will solve age-appropriate puzzles and logical problems',
        'Children will demonstrate memory skills through recall activities',
        'Children will ask questions and explore their environment systematically',
        'Children will classify and categorize objects by various attributes',
        'Children will understand cause and effect relationships',
        'Children will develop pre-math concepts including counting and patterns'
      ]
    },
    {
      id: 3,
      domain: 'Language Development',
      outcomes: [
        'Children will express thoughts and feelings clearly through spoken language',
        'Children will listen attentively and follow multi-step instructions',
        'Children will demonstrate interest in books and storytelling',
        'Children will recognize letters and begin to understand print concepts',
        'Children will expand vocabulary through meaningful conversations',
        'Children will use language to solve problems and ask for help'
      ]
    },
    {
      id: 4,
      domain: 'Socio-Emotional Development',
      outcomes: [
        'Children will form positive relationships with peers and adults',
        'Children will express emotions appropriately and seek help when needed',
        'Children will show empathy and consideration for others',
        'Children will work cooperatively in group activities',
        'Children will develop self-confidence and independence',
        'Children will learn conflict resolution strategies'
      ]
    },
    {
      id: 5,
      domain: 'Moral Development',
      outcomes: [
        'Children will demonstrate honesty in their interactions',
        'Children will show respect for diversity and differences',
        'Children will take responsibility for their actions and choices',
        'Children will understand concepts of fairness and justice',
        'Children will develop caring attitudes toward environment and community',
        'Children will practice kindness and helpfulness toward others'
      ]
    }
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
  
  // Validate that classTeacherFor is one of the assigned classes
  if (isClassTeacher && classTeacherFor && (!classes || !classes.includes(classTeacherFor))) {
    return res.status(400).json({ 
      error: 'Class teacher assignment must be for one of the assigned classes' 
    });
  }
  
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
  
  const updatedTeacher = { ...data.teachers[teacherIndex], ...req.body };
  
  // Validate that classTeacherFor is one of the assigned classes
  if (updatedTeacher.isClassTeacher && updatedTeacher.classTeacherFor && 
      (!updatedTeacher.classes || !updatedTeacher.classes.includes(updatedTeacher.classTeacherFor))) {
    return res.status(400).json({ 
      error: 'Class teacher assignment must be for one of the assigned classes' 
    });
  }
  
  data.teachers[teacherIndex] = updatedTeacher;
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
  res.json(data.curricularGoals);
});

app.get('/api/competencies/:domain', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
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
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const { title, description } = req.body;
  const newGoal = {
    id: Date.now(),
    title,
    description,
    competencies: [],
    createdAt: new Date().toISOString()
  };
  
  data.curricularGoals[domain].push(newGoal);
  res.json(newGoal);
});

app.put('/api/competencies/:domain/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const goalId = parseInt(req.params.id);
  
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const goalIndex = data.curricularGoals[domain].findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Curricular goal not found' });
  }
  
  data.curricularGoals[domain][goalIndex] = {
    ...data.curricularGoals[domain][goalIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.curricularGoals[domain][goalIndex]);
});

app.delete('/api/competencies/:domain/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const goalId = parseInt(req.params.id);
  
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const goalIndex = data.curricularGoals[domain].findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Curricular goal not found' });
  }
  
  data.curricularGoals[domain].splice(goalIndex, 1);
  res.json({ message: 'Curricular goal deleted successfully' });
});

// Competency management within curricular goals
app.post('/api/competencies/:domain/:goalId/competencies', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const goalId = parseInt(req.params.goalId);
  
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const goalIndex = data.curricularGoals[domain].findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Curricular goal not found' });
  }
  
  const { title, description } = req.body;
  const goal = data.curricularGoals[domain][goalIndex];
  const maxId = Math.max(...(goal.competencies?.map(c => c.id) || [0]), 0);
  
  const newCompetency = {
    id: maxId + 1,
    title,
    description,
    createdAt: new Date().toISOString()
  };
  
  if (!goal.competencies) {
    goal.competencies = [];
  }
  goal.competencies.push(newCompetency);
  res.json(newCompetency);
});

app.put('/api/competencies/:domain/:goalId/competencies/:competencyId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const goalId = parseInt(req.params.goalId);
  const competencyId = parseInt(req.params.competencyId);
  
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const goalIndex = data.curricularGoals[domain].findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Curricular goal not found' });
  }
  
  const goal = data.curricularGoals[domain][goalIndex];
  if (!goal.competencies) {
    return res.status(404).json({ error: 'No competencies found' });
  }
  
  const competencyIndex = goal.competencies.findIndex(c => c.id === competencyId);
  if (competencyIndex === -1) {
    return res.status(404).json({ error: 'Competency not found' });
  }
  
  goal.competencies[competencyIndex] = {
    ...goal.competencies[competencyIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(goal.competencies[competencyIndex]);
});

app.delete('/api/competencies/:domain/:goalId/competencies/:competencyId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const domain = req.params.domain;
  const goalId = parseInt(req.params.goalId);
  const competencyId = parseInt(req.params.competencyId);
  
  if (!data.curricularGoals[domain]) {
    return res.status(404).json({ error: 'Domain not found' });
  }
  
  const goalIndex = data.curricularGoals[domain].findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: 'Curricular goal not found' });
  }
  
  const goal = data.curricularGoals[domain][goalIndex];
  if (!goal.competencies) {
    return res.status(404).json({ error: 'No competencies found' });
  }
  
  const competencyIndex = goal.competencies.findIndex(c => c.id === competencyId);
  if (competencyIndex === -1) {
    return res.status(404).json({ error: 'Competency not found' });
  }
  
  goal.competencies.splice(competencyIndex, 1);
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
  const { class: className, name } = req.query;
  
  if (req.user.role === 'admin') {
    let students = data.students;
    
    // Filter by class if specified
    if (className) {
      students = students.filter(s => s.class === className);
    }
    
    // Filter by name if specified (search functionality)
    if (name) {
      students = students.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    res.json(students);
  } else if (req.user.role === 'teacher') {
    // For now, teachers can see all students
    // TODO: Implement proper class-based filtering when class system is updated
    let students = data.students;
    
    if (className) {
      students = students.filter(s => s.class === className);
    }
    
    if (name) {
      students = students.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      );
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
    // For compatibility, skip class-based access control for now
    // TODO: Implement proper class-based access when class system is updated
  }
  
  res.json(student);
});

// New Student Management CRUD Routes
app.post('/api/students', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, rollNumber, studentId, dateOfBirth, standard, division } = req.body;
  
  // Validate required fields
  if (!name || !rollNumber || !studentId || !dateOfBirth || !standard || !division) {
    return res.status(400).json({ error: 'All fields are required: name, rollNumber, studentId, dateOfBirth, standard, division' });
  }
  
  // Check for duplicate roll number or student ID
  const existingStudent = data.students.find(s => 
    s.rollNumber === rollNumber || s.studentId === studentId
  );
  
  if (existingStudent) {
    return res.status(400).json({ 
      error: 'Student with this roll number or student ID already exists' 
    });
  }
  
  const newStudent = {
    id: Date.now(),
    name,
    rollNumber,
    studentId,
    dateOfBirth,
    standard,
    division,
    class: `Grade ${standard}${division}`, // Computed field
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.students.push(newStudent);
  res.json(newStudent);
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const studentId = parseInt(req.params.id);
  const studentIndex = data.students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const { name, rollNumber, studentId: newStudentId, dateOfBirth, standard, division } = req.body;
  
  
  // Check for duplicate roll number or student ID (excluding current student)
  if (rollNumber || newStudentId) {
    const existingStudent = data.students.find(s => 
      s.id !== studentId && (s.rollNumber === rollNumber || s.studentId === newStudentId)
    );
    
    if (existingStudent) {
      return res.status(400).json({ 
        error: 'Another student with this roll number or student ID already exists' 
      });
    }
  }
  
  // Create updated student object with only provided fields
  const updates = {};
  if (name !== undefined && name !== null) updates.name = name;
  if (rollNumber !== undefined && rollNumber !== null) updates.rollNumber = rollNumber;
  if (newStudentId !== undefined && newStudentId !== null) updates.studentId = newStudentId;
  if (dateOfBirth !== undefined && dateOfBirth !== null) updates.dateOfBirth = dateOfBirth;
  if (standard !== undefined && standard !== null) updates.standard = standard;
  if (division !== undefined && division !== null) updates.division = division;
  
  // Apply updates
  Object.assign(data.students[studentIndex], updates);
  
  // Update computed class field if standard or division changed
  if (updates.standard !== undefined || updates.division !== undefined) {
    data.students[studentIndex].class = `Grade ${data.students[studentIndex].standard}${data.students[studentIndex].division}`;
  }
  
  // Update timestamp
  data.students[studentIndex].updatedAt = new Date().toISOString();
  
  res.json(data.students[studentIndex]);
});

app.delete('/api/students/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const studentId = parseInt(req.params.id);
  const studentIndex = data.students.findIndex(s => s.id === studentId);
  
  if (studentIndex === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  data.students.splice(studentIndex, 1);
  res.json({ message: 'Student deleted successfully' });
});

// Student General Info endpoint
app.post('/api/students/general-info', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { studentId, generalInfo } = req.body;
  
  // Find the student
  const student = data.students.find(s => s.id === parseInt(studentId));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  // Add general info to student record
  if (!student.generalInfo) {
    student.generalInfo = {};
  }
  
  student.generalInfo = {
    ...student.generalInfo,
    ...generalInfo,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user.id
  };
  
  res.json({ message: 'General info saved successfully', generalInfo: student.generalInfo });
});

// Get student general info
app.get('/api/students/:id/general-info', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = data.students.find(s => s.id === studentId);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  res.json(student.generalInfo || {});
});

// Excel upload route for students
app.post('/api/students/upload', authenticateToken, upload.single('file'), (req, res) => {
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
    const studentsData = XLSX.utils.sheet_to_json(worksheet);
    
    const processedStudents = [];
    const errors = [];
    const duplicates = [];
    
    studentsData.forEach((studentRow, index) => {
      const rowNumber = index + 2; // Excel row number (assuming header in row 1)
      
      // Validate required fields
      const name = studentRow.Name || studentRow.name;
      const rollNumber = studentRow.RollNumber || studentRow.rollNumber || studentRow['Roll Number'];
      const studentId = studentRow.StudentId || studentRow.studentId || studentRow['Student ID'];
      const dateOfBirth = studentRow.DateOfBirth || studentRow.dateOfBirth || studentRow['Date of Birth'];
      const className = studentRow.Class || studentRow.class;
      
      if (!name || !rollNumber || !studentId || !dateOfBirth || !className) {
        errors.push(`Row ${rowNumber}: Missing required fields`);
        return;
      }
      
      // Check for duplicate in existing data
      const existingStudent = data.students.find(s => 
        s.rollNumber === rollNumber || s.studentId === studentId
      );
      
      if (existingStudent) {
        duplicates.push({
          row: rowNumber,
          name,
          rollNumber,
          studentId,
          existing: existingStudent
        });
        return;
      }
      
      // Check for duplicate within uploaded data
      const duplicateInBatch = processedStudents.find(s => 
        s.rollNumber === rollNumber || s.studentId === studentId
      );
      
      if (duplicateInBatch) {
        errors.push(`Row ${rowNumber}: Duplicate roll number or student ID within uploaded data`);
        return;
      }
      
      processedStudents.push({
        id: Date.now() + Math.random(),
        name,
        rollNumber,
        studentId,
        dateOfBirth,
        class: className,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    // Add successful students to database
    data.students.push(...processedStudents);
    
    res.json({ 
      success: true,
      studentsAdded: processedStudents.length,
      errors,
      duplicates: duplicates.map(d => ({
        row: d.row,
        name: d.name,
        rollNumber: d.rollNumber,
        studentId: d.studentId
      }))
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      studentsAdded: 0,
      errors: [`Error processing Excel file: ${error.message}`]
    });
  }
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
    
    // Find student's class by matching class name
    const studentClass = data.classes.find(c => c.name === student.class);
    if (!studentClass) {
      return res.status(404).json({ error: 'Student class not found' });
    }
    
    // For now, skip class access validation - allow all teachers to view feedback for any class
    // TODO: Implement proper class-teacher relationship validation
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
    
    // Find student's class by matching class name
    const studentClass = data.classes.find(c => c.name === student.class);
    if (!studentClass) {
      return res.status(404).json({ error: 'Student class not found' });
    }
    
    // For now, skip class access validation - allow all teachers to view observations for any class
    // TODO: Implement proper class-teacher relationship validation
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

app.get('/api/learning-outcomes', authenticateToken, (req, res) => {
  res.json(data.learningOutcomes);
});

app.post('/api/activities', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { 
    classId, 
    title, 
    domainId, 
    competencyIds, 
    learningOutcomes, 
    rubric 
  } = req.body;
  
  // Validate that teacher has access to this class
  const classItem = data.classes.find(c => c.id === parseInt(classId));
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  // For now, skip class access validation - allow all teachers to create activities for any class
  // TODO: Implement proper class-teacher relationship validation
  
  const newActivity = {
    id: Date.now(),
    classId: parseInt(classId),
    teacherId: req.user.id,
    title,
    domainId: parseInt(domainId),
    competencyIds: competencyIds || [],
    learningOutcomes: learningOutcomes || [],
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

app.get('/api/activities/class/:classId', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.classId);
  
  if (req.user.role === 'teacher') {
    // Check if class exists
    const classItem = data.classes.find(c => c.id === classId);
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // For now, skip class access validation - allow all teachers to view activities for any class
    // TODO: Implement proper class-teacher relationship validation
  }
  
  const activities = data.activities.filter(a => a.classId === classId);
  
  // Enrich activities with domain and competencies details
  const enrichedActivities = activities.map(activity => {
    // Handle both old single competency structure and new array structure
    let competencies = [];
    if (activity.competencyIds && Array.isArray(activity.competencyIds)) {
      // New array structure
      competencies = activity.competencyIds.map(id => data.activityCompetencies.find(c => c.id === id)).filter(Boolean);
    } else if (activity.competencyId) {
      // Legacy single competency structure - convert to array
      const competency = data.activityCompetencies.find(c => c.id === activity.competencyId);
      if (competency) competencies = [competency];
    }

    return {
      ...activity,
      domain: data.domains.find(d => d.id === activity.domainId),
      competencies
    };
  });
  
  res.json(enrichedActivities);
});

// Legacy endpoint for backward compatibility - now returns activities for student's class
app.get('/api/activities/:studentId', authenticateToken, (req, res) => {
  const studentId = parseInt(req.params.studentId);
  
  if (req.user.role === 'teacher') {
    // Check if teacher has access to this student
    const student = data.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Find student's class by matching class name
    const studentClass = data.classes.find(c => c.name === student.class);
    if (!studentClass) {
      return res.status(404).json({ error: 'Student class not found' });
    }
    
    // Return activities for the student's class instead of student-specific activities
    const activities = data.activities.filter(a => a.classId === studentClass.id);
    
    // Enrich activities with domain and competencies details
    const enrichedActivities = activities.map(activity => {
      // Handle both old single competency structure and new array structure
      let competencies = [];
      if (activity.competencyIds && Array.isArray(activity.competencyIds)) {
        // New array structure
        competencies = activity.competencyIds.map(id => data.activityCompetencies.find(c => c.id === id)).filter(Boolean);
      } else if (activity.competencyId) {
        // Legacy single competency structure - convert to array
        const competency = data.activityCompetencies.find(c => c.id === activity.competencyId);
        if (competency) competencies = [competency];
      }

      return {
        ...activity,
        domain: data.domains.find(d => d.id === activity.domainId),
        competencies
      };
    });
    
    res.json(enrichedActivities);
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
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