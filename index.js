const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');

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
let demoPdfBuffer = null; // Store the uploaded demo PDF

const data = {
  users: [
    { id: 1, email: 'admin@gmail.com', password: bcrypt.hashSync('12345', 10), role: 'admin' },
    { id: 2, email: 'teacher@gmail.com', password: bcrypt.hashSync('12345', 10), role: 'teacher' }
  ],
  teachers: [],
  students: [
    { 
      id: 1, 
      name: 'Arjun Sharma', 
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
      name: 'Priya Patel', 
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
      name: 'Kavya Reddy', 
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
      name: 'Rohan Gupta', 
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
      name: 'Ananya Singh', 
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
  rubricEntries: [
    {
      id: 1,
      dimension: 'awareness',
      level: 'stream',
      entries: [
        'Shows basic understanding of concept',
        'Recognizes familiar patterns',
        'Identifies simple elements',
        'Demonstrates initial awareness',
        'Notices obvious features'
      ]
    },
    {
      id: 2,
      dimension: 'awareness',
      level: 'mountain',
      entries: [
        'Demonstrates clear understanding',
        'Explains concepts in own words',
        'Makes connections between ideas',
        'Shows deeper comprehension',
        'Articulates key principles'
      ]
    },
    {
      id: 3,
      dimension: 'awareness',
      level: 'sky',
      entries: [
        'Exhibits mastery of concept',
        'Teaches others effectively',
        'Synthesizes complex information',
        'Demonstrates expert understanding',
        'Creates new insights'
      ]
    },
    {
      id: 4,
      dimension: 'sensitivity',
      level: 'stream',
      entries: [
        'Shows basic emotional awareness',
        'Recognizes others\' feelings',
        'Responds to simple social cues',
        'Demonstrates beginning empathy',
        'Notices when others need help'
      ]
    },
    {
      id: 5,
      dimension: 'sensitivity',
      level: 'mountain',
      entries: [
        'Demonstrates emotional intelligence',
        'Shows genuine concern for others',
        'Adapts behavior to social context',
        'Supports peers effectively',
        'Mediates simple conflicts'
      ]
    },
    {
      id: 6,
      dimension: 'sensitivity',
      level: 'sky',
      entries: [
        'Exhibits advanced emotional maturity',
        'Leads with compassion',
        'Creates inclusive environments',
        'Advocates for others\' needs',
        'Models exemplary social behavior'
      ]
    },
    {
      id: 7,
      dimension: 'creativity',
      level: 'stream',
      entries: [
        'Tries new approaches occasionally',
        'Shows basic imaginative thinking',
        'Combines familiar ideas',
        'Demonstrates initial innovation',
        'Explores different possibilities'
      ]
    },
    {
      id: 8,
      dimension: 'creativity',
      level: 'mountain',
      entries: [
        'Consistently generates original ideas',
        'Takes creative risks confidently',
        'Adapts and improves existing solutions',
        'Shows flexible thinking patterns',
        'Inspires creativity in others'
      ]
    },
    {
      id: 9,
      dimension: 'creativity',
      level: 'sky',
      entries: [
        'Produces breakthrough innovations',
        'Transforms challenges into opportunities',
        'Creates entirely new frameworks',
        'Demonstrates visionary thinking',
        'Influences creative culture'
      ]
    }
  ],
  feedback: {
    general: [],
    parent: [],
    student: [],
    peer: []
  },
  observations: [],
  portfolio: [],
  assessments: []
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
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const teachers = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    const processedTeachers = teachers.map(teacher => {
      // Parse classes
      const classes = teacher.Classes ? teacher.Classes.split(',').map(c => c.trim()) : [];
      
      // Parse class-subject mappings
      // Expected format in Excel: "Grade 1A:Math,Science;Grade 2B:English,Hindi"
      let classSubjects = {};
      let allSubjects = [];
      
      if (teacher.ClassSubjects) {
        const mappings = teacher.ClassSubjects.split(';').map(m => m.trim());
        mappings.forEach(mapping => {
          const [className, subjectsStr] = mapping.split(':').map(s => s.trim());
          if (className && subjectsStr) {
            const subjects = subjectsStr.split(',').map(s => s.trim());
            classSubjects[className] = subjects;
            allSubjects.push(...subjects);
          }
        });
      } else if (teacher.Subjects) {
        // Fallback: If ClassSubjects not provided, use old format
        // Apply all subjects to all classes
        allSubjects = teacher.Subjects.split(',').map(s => s.trim());
        classes.forEach(className => {
          classSubjects[className] = allSubjects;
        });
      }
      
      // Remove duplicates from allSubjects
      allSubjects = [...new Set(allSubjects)];
      
      return {
        id: Date.now() + Math.random(),
        name: teacher.Name || teacher.name,
        email: teacher.Email || teacher.email,
        phone: teacher.Phone || teacher.phone,
        subjects: allSubjects,
        classes: classes,
        classSubjects: classSubjects,
        isClassTeacher: teacher.IsClassTeacher === 'true' || teacher.IsClassTeacher === true,
        classTeacherFor: teacher.ClassTeacherFor || null,
        createdAt: new Date().toISOString()
      };
    });
    
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
  const studentId = parseFloat(req.params.id);
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
  
  const studentId = parseFloat(req.params.id);
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
  
  const studentId = parseFloat(req.params.id);
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
  const studentId = parseFloat(req.params.id);
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
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const studentsData = XLSX.utils.sheet_to_json(worksheet, { dateNF: 'yyyy-mm-dd', raw: false });
    
    const processedStudents = [];
    const errors = [];
    const duplicates = [];
    
    studentsData.forEach((studentRow, index) => {
      const rowNumber = index + 2; // Excel row number (assuming header in row 1)
      
      // Validate required fields
      const name = studentRow.Name || studentRow.name;
      const rollNumber = studentRow.RollNumber || studentRow.rollNumber || studentRow['Roll Number'];
      const studentId = studentRow.StudentId || studentRow.studentId || studentRow['Student ID'];
      let dateOfBirth = studentRow.DateOfBirth || studentRow.dateOfBirth || studentRow['Date of Birth'];
      
      // Function to parse Excel dates properly
      function parseExcelDate(dateValue) {
        if (!dateValue) return null;
        
        // If it's already a string in YYYY-MM-DD format, return it
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        
        // If it's a Date object from Excel
        if (dateValue instanceof Date) {
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        // If it's an Excel serial number (number type)
        if (typeof dateValue === 'number') {
          // Excel dates start from 1900-01-01 (serial number 1)
          // But Excel incorrectly treats 1900 as a leap year, so we need to adjust
          const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
          const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        // Try to parse as string date
        try {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          // Fall through
        }
        
        return dateValue; // Return as-is if we can't parse it
      }
      
      // Parse the date of birth
      dateOfBirth = parseExcelDate(dateOfBirth);
      
      // Optional fields for extended student information
      const age = studentRow.Age || studentRow.age;
      const parentContact = studentRow.ParentContact || studentRow.parentContact || studentRow['Parent Contact'];
      const notes = studentRow.Notes || studentRow.notes || '';
      const classId = studentRow.ClassId || studentRow.classId || studentRow['Class ID'] || 1;
      
      // Handle both old format (Class) and new format (Standard + Division)
      const className = studentRow.Class || studentRow.class;
      const standard = studentRow.Standard || studentRow.standard;
      const division = studentRow.Division || studentRow.division;
      
      // Check if we have either the old format or new format
      const hasOldFormat = className;
      const hasNewFormat = standard && division;
      
      if (!name || !rollNumber || !studentId || !dateOfBirth || (!hasOldFormat && !hasNewFormat)) {
        errors.push(`Row ${rowNumber}: Missing required fields (need Name, RollNumber, StudentId, DateOfBirth, and either Class OR Standard+Division)`);
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
      
      // Create student object with proper standard/division handling
      let studentData = {
        id: Date.now() + Math.random(),
        name,
        rollNumber,
        studentId,
        dateOfBirth,
        age: age || calculateAge(dateOfBirth),
        parentContact: parentContact || '',
        notes: notes || '',
        classId: classId || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Helper function to calculate age from date of birth
      function calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }

      if (hasNewFormat) {
        // Use new format with separated standard and division
        studentData.standard = standard;
        studentData.division = division;
        studentData.class = `Grade ${standard}${division}`; // Generate class name for compatibility
      } else {
        // Use old format - try to parse standard and division from class name
        studentData.class = className;
        
        // Try to extract standard and division from class name (e.g., "Grade 1A" or "1A")
        const classMatch = className.match(/(\d+)([A-Z])/);
        if (classMatch) {
          studentData.standard = classMatch[1];
          studentData.division = classMatch[2];
        } else {
          // Fallback - couldn't parse, set defaults
          studentData.standard = '1';
          studentData.division = 'A';
        }
      }

      processedStudents.push(studentData);
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
    feedbackType: feedbackType,
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
  const studentId = parseFloat(req.params.studentId);
  
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
  const studentId = parseFloat(req.params.studentId);
  
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

app.get('/api/rubric-entries', authenticateToken, (req, res) => {
  res.json(data.rubricEntries);
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
  const studentId = parseFloat(req.params.studentId);
  
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

// Portfolio routes
app.get('/api/portfolio/:studentId', authenticateToken, (req, res) => {
  const studentId = parseFloat(req.params.studentId);
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const portfolioItems = data.portfolio.filter(item => item.studentId === studentId);
  res.json(portfolioItems);
});

app.post('/api/portfolio', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { studentId, title, description, category, imageUrl, fileName } = req.body;
  
  if (!title || !studentId || !imageUrl || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const portfolioItem = {
    id: Math.max(...data.portfolio.map(p => p.id), 0) + 1,
    studentId: parseInt(studentId),
    title,
    description: description || '',
    category,
    imageUrl,
    fileName: fileName || '',
    teacherId: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  data.portfolio.push(portfolioItem);
  res.json(portfolioItem);
});

app.delete('/api/portfolio/:id', authenticateToken, (req, res) => {
  const portfolioId = parseInt(req.params.id);
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const portfolioIndex = data.portfolio.findIndex(p => p.id === portfolioId);
  if (portfolioIndex === -1) {
    return res.status(404).json({ error: 'Portfolio item not found' });
  }
  
  // Check if teacher owns this portfolio item
  if (data.portfolio[portfolioIndex].teacherId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own portfolio items' });
  }
  
  data.portfolio.splice(portfolioIndex, 1);
  res.json({ message: 'Portfolio item deleted successfully' });
});

// Assessment routes
app.post('/api/assessments', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { studentId, term, rubric } = req.body;
  
  if (!studentId || !term || !rubric) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const assessment = {
    id: Math.max(...data.assessments.map(a => a.id), 0) + 1,
    studentId: parseInt(studentId),
    teacherId: req.user.id,
    term,
    rubric,
    createdAt: new Date().toISOString()
  };
  
  data.assessments.push(assessment);
  res.json(assessment);
});

app.get('/api/assessments/:studentId', authenticateToken, (req, res) => {
  const studentId = parseFloat(req.params.studentId);
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const assessments = data.assessments.filter(a => a.studentId === studentId);
  res.json(assessments);
});

app.put('/api/assessments/:studentId/:term', authenticateToken, (req, res) => {
  const studentId = parseFloat(req.params.studentId);
  const term = req.params.term;
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  const { rubric } = req.body;
  
  if (!rubric) {
    return res.status(400).json({ error: 'Missing rubric data' });
  }
  
  // Find existing assessment for this student and term
  const assessmentIndex = data.assessments.findIndex(a => 
    a.studentId === studentId && a.term === term
  );
  
  if (assessmentIndex !== -1) {
    // Update existing assessment
    data.assessments[assessmentIndex] = {
      ...data.assessments[assessmentIndex],
      rubric,
      updatedAt: new Date().toISOString()
    };
    res.json(data.assessments[assessmentIndex]);
  } else {
    // Create new assessment if none exists
    const assessment = {
      id: Math.max(...data.assessments.map(a => a.id), 0) + 1,
      studentId,
      teacherId: req.user.id,
      term,
      rubric,
      createdAt: new Date().toISOString()
    };
    
    data.assessments.push(assessment);
    res.json(assessment);
  }
});

// Demo PDF Upload Endpoint
app.post('/api/upload-demo-pdf', authenticateToken, upload.single('demoPdf'), (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  // Store the PDF buffer in memory
  demoPdfBuffer = req.file.buffer;
  
  res.json({ 
    message: 'Demo PDF uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size 
  });
});

// Check if demo PDF is available
app.get('/api/demo-pdf-status', authenticateToken, (req, res) => {
  res.json({ 
    available: demoPdfBuffer !== null,
    size: demoPdfBuffer ? demoPdfBuffer.length : 0
  });
});

// HPC PDF Generation Endpoint (Demo Version)
app.get('/api/generate-hpc/:studentId/:term', authenticateToken, (req, res) => {
  const studentId = parseFloat(req.params.studentId);
  const term = req.params.term;
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  // Find student data
  const student = data.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  // Check if demo PDF is available
  if (!demoPdfBuffer) {
    return res.status(404).json({ error: 'Demo PDF not uploaded yet. Please upload a demo PDF first.' });
  }
  
  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=HPC_${student.name}_${term.toUpperCase()}.pdf`);
  res.setHeader('Content-Length', demoPdfBuffer.length);
  
  // Send the demo PDF
  res.send(demoPdfBuffer);
});

// Template download endpoints
app.get('/api/templates/student', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const format = req.query.format || 'new'; // 'new' or 'legacy'
  
  let templateData;
  let filename;
  
  if (format === 'legacy') {
    templateData = [
      {
        'Name': 'John Doe',
        'RollNumber': 'R001',
        'StudentId': 'STU001',
        'DateOfBirth': '2018-03-15',
        'Age': 6,
        'ParentContact': '+1234567890',
        'Notes': 'Good at mathematics, needs help with reading',
        'ClassId': 1,
        'Class': 'Grade 1A'
      },
      {
        'Name': 'Jane Smith',
        'RollNumber': 'R002',
        'StudentId': 'STU002',
        'DateOfBirth': '2018-07-22',
        'Age': 6,
        'ParentContact': '+1234567891',
        'Notes': 'Very creative, loves art activities',
        'ClassId': 1,
        'Class': 'Grade 1B'
      }
    ];
    filename = 'student_import_template_legacy.xlsx';
  } else {
    templateData = [
      {
        'Name': 'John Doe',
        'RollNumber': 'R001',
        'StudentId': 'STU001',
        'DateOfBirth': '2018-03-15',
        'Age': 6,
        'ParentContact': '+1234567890',
        'Notes': 'Good at mathematics, needs help with reading',
        'ClassId': 1,
        'Standard': '1',
        'Division': 'A'
      },
      {
        'Name': 'Jane Smith',
        'RollNumber': 'R002',
        'StudentId': 'STU002',
        'DateOfBirth': '2018-07-22',
        'Age': 6,
        'ParentContact': '+1234567891',
        'Notes': 'Very creative, loves art activities',
        'ClassId': 1,
        'Standard': '1',
        'Division': 'B'
      }
    ];
    filename = 'student_import_template.xlsx';
  }
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

app.get('/api/templates/teacher', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const templateData = [
    {
      'Name': 'Dr. Sarah Johnson',
      'Email': 'sarah.johnson@school.edu',
      'Phone': '+1234567890',
      'Subjects': 'Math,Science',
      'Classes': 'Grade 1A,Grade 1B',
      'IsClassTeacher': 'true',
      'ClassTeacherFor': 'Grade 1A'
    },
    {
      'Name': 'Mr. David Wilson',
      'Email': 'david.wilson@school.edu',
      'Phone': '+1234567891',
      'Subjects': 'English,Hindi',
      'Classes': 'Grade 2A,Grade 2B',
      'IsClassTeacher': 'false',
      'ClassTeacherFor': ''
    }
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="teacher_import_template.xlsx"');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});