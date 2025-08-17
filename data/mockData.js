// In-memory data storage
let demoPdfBuffer = null; // Store the uploaded demo PDF

const data = {
  users: [
    { id: 1, email: 'admin@gmail.com', password: '$2b$10$Av0yhkTdXyaoVZdj2l2ElOqxeEoFfL09vmDBpF2yzNMmxrYNd/4..', role: 'admin' },
    { id: 2, email: 'teacher@gmail.com', password: '$2b$10$Av0yhkTdXyaoVZdj2l2ElOqxeEoFfL09vmDBpF2yzNMmxrYNd/4..', role: 'teacher' },
    { id: 3, email: 'parent@gmail.com', password: '$2b$10$Av0yhkTdXyaoVZdj2l2ElOqxeEoFfL09vmDBpF2yzNMmxrYNd/4..', role: 'parent', studentIds: [1, 2] }, 
    { id: 4, email: 'student@gmail.com', password: '$2b$10$Av0yhkTdXyaoVZdj2l2ElOqxeEoFfL09vmDBpF2yzNMmxrYNd/4..', role: 'student', studentId: 1 }
  ],
  teachers: [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.com',
      subject: 'Mathematics',
      phone: '9876543201',
      experience: 8,
      qualification: 'M.Sc Mathematics, B.Ed',
      isClassTeacher: true,
      classTeacherFor: 'Grade 2A',
      createdAt: '2024-01-10T09:00:00.000Z',
      updatedAt: '2024-01-10T09:00:00.000Z'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@school.com',
      subject: 'English',
      phone: '9876543202',
      experience: 5,
      qualification: 'M.A English Literature, B.Ed',
      isClassTeacher: false,
      classTeacherFor: '',
      createdAt: '2024-01-10T09:30:00.000Z',
      updatedAt: '2024-01-10T09:30:00.000Z'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      email: 'priya.sharma@school.com',
      subject: 'Science',
      phone: '9876543203',
      experience: 12,
      qualification: 'M.Sc Physics, B.Ed',
      isClassTeacher: true,
      classTeacherFor: 'Grade 3B',
      createdAt: '2024-01-10T10:00:00.000Z',
      updatedAt: '2024-01-10T10:00:00.000Z'
    },
    {
      id: 4,
      name: 'David Williams',
      email: 'david.williams@school.com',
      subject: 'Social Studies',
      phone: '9876543204',
      experience: 6,
      qualification: 'M.A History, B.Ed',
      isClassTeacher: false,
      classTeacherFor: '',
      createdAt: '2024-01-10T10:30:00.000Z',
      updatedAt: '2024-01-10T10:30:00.000Z'
    },
    {
      id: 5,
      name: 'Anita Patel',
      email: 'anita.patel@school.com',
      subject: 'Art & Craft',
      phone: '9876543205',
      experience: 10,
      qualification: 'BFA, Diploma in Education',
      isClassTeacher: false,
      classTeacherFor: '',
      createdAt: '2024-01-10T11:00:00.000Z',
      updatedAt: '2024-01-10T11:00:00.000Z'
    },
    {
      id: 6,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@school.com',
      subject: 'Physical Education',
      phone: '9876543206',
      experience: 7,
      qualification: 'B.P.Ed, M.P.Ed',
      isClassTeacher: true,
      classTeacherFor: 'Grade 4A',
      createdAt: '2024-01-10T11:30:00.000Z',
      updatedAt: '2024-01-10T11:30:00.000Z'
    },
    {
      id: 7,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@school.com',
      subject: 'Music',
      phone: '9876543207',
      experience: 4,
      qualification: 'B.Mus, Certificate in Music Education',
      isClassTeacher: false,
      classTeacherFor: '',
      createdAt: '2024-01-10T12:00:00.000Z',
      updatedAt: '2024-01-10T12:00:00.000Z'
    },
    {
      id: 8,
      name: 'Vikram Singh',
      email: 'vikram.singh@school.com',
      subject: 'Hindi',
      phone: '9876543208',
      experience: 9,
      qualification: 'M.A Hindi Literature, B.Ed',
      isClassTeacher: true,
      classTeacherFor: 'Grade 5A',
      createdAt: '2024-01-10T12:30:00.000Z',
      updatedAt: '2024-01-10T12:30:00.000Z'
    }
  ],
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
      apaarId: 'APAAR001',
      address: '123 Main Street, Mumbai',
      phone: '9876543210',
      motherName: 'Sunita Sharma',
      motherEducation: 'M.A. English',
      motherOccupation: 'Teacher',
      fatherName: 'Rajesh Sharma',
      fatherEducation: 'B.Tech',
      fatherOccupation: 'Software Engineer',
      siblings: 1,
      siblingAge: '5',
      motherTongue: 'Hindi',
      mediumOfInstruction: 'English',
      isRural: false,
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
      apaarId: 'APAAR002',
      address: '456 Park Avenue, Mumbai',
      phone: '9876543211',
      motherName: 'Kavita Patel',
      motherEducation: 'B.Com',
      motherOccupation: 'Accountant',
      fatherName: 'Mehul Patel',
      fatherEducation: 'MBA',
      fatherOccupation: 'Business Owner',
      siblings: 0,
      siblingAge: '',
      motherTongue: 'Gujarati',
      mediumOfInstruction: 'English',
      isRural: false,
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
      apaarId: 'APAAR003',
      address: '789 Lake View, Bangalore',
      phone: '9876543212',
      motherName: 'Lakshmi Reddy',
      motherEducation: 'M.Sc',
      motherOccupation: 'Doctor',
      fatherName: 'Venkat Reddy',
      fatherEducation: 'MBBS',
      fatherOccupation: 'Doctor',
      siblings: 2,
      siblingAge: '8,10',
      motherTongue: 'Telugu',
      mediumOfInstruction: 'English',
      isRural: false,
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
      apaarId: 'APAAR004',
      address: '321 Green Colony, Delhi',
      phone: '9876543213',
      motherName: 'Neeta Gupta',
      motherEducation: 'B.A.',
      motherOccupation: 'Homemaker',
      fatherName: 'Amit Gupta',
      fatherEducation: 'CA',
      fatherOccupation: 'Chartered Accountant',
      siblings: 1,
      siblingAge: '3',
      motherTongue: 'Hindi',
      mediumOfInstruction: 'English',
      isRural: false,
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
      apaarId: 'APAAR005',
      address: '654 River Side, Pune',
      phone: '9876543214',
      motherName: 'Priya Singh',
      motherEducation: 'Ph.D',
      motherOccupation: 'Professor',
      fatherName: 'Vikram Singh',
      fatherEducation: 'M.Tech',
      fatherOccupation: 'Architect',
      siblings: 0,
      siblingAge: '',
      motherTongue: 'Hindi',
      mediumOfInstruction: 'English',
      isRural: false,
      createdAt: '2024-01-15T10:34:00.000Z',
      updatedAt: '2024-01-15T10:34:00.000Z'
    }
  ],
  classes: [
    { 
      id: 1, 
      name: 'Grade 1A', 
      grade: '1', 
      division: 'A', 
      description: 'Morning class for 5-6 year olds', 
      teacherId: 2, 
      classTeacher: 'teacher@gmail.com',
      capacity: 20, 
      currentEnrollment: 3,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
      schedule: 'Morning',
      academicYear: '2024-25',
      status: 'active',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    },
    { 
      id: 2, 
      name: 'Grade 1B', 
      grade: '1', 
      division: 'B', 
      description: 'Afternoon class for 6-7 year olds', 
      teacherId: 2, 
      classTeacher: 'teacher@gmail.com',
      capacity: 20, 
      currentEnrollment: 2,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
      schedule: 'Afternoon',
      academicYear: '2024-25',
      status: 'active',
      createdAt: '2024-01-15T10:31:00.000Z',
      updatedAt: '2024-01-15T10:31:00.000Z'
    },
    { 
      id: 3, 
      name: 'Grade 2A', 
      grade: '2', 
      division: 'A', 
      description: 'Advanced morning class', 
      teacherId: null, 
      classTeacher: null,
      capacity: 18, 
      currentEnrollment: 0,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Art'],
      schedule: 'Morning',
      academicYear: '2024-25',
      status: 'active',
      createdAt: '2024-01-15T10:32:00.000Z',
      updatedAt: '2024-01-15T10:32:00.000Z'
    }
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
  attendance: [
    {
      id: 1,
      studentId: 1,
      studentName: 'Arjun Sharma',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-15',
      status: 'present',
      timeIn: '09:00:00',
      timeOut: '15:30:00',
      remarks: '',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-15T09:00:00.000Z'
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Priya Patel',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-15',
      status: 'present',
      timeIn: '09:05:00',
      timeOut: '15:30:00',
      remarks: '',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-15T09:05:00.000Z'
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Kavya Reddy',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-15',
      status: 'absent',
      timeIn: null,
      timeOut: null,
      remarks: 'Sick leave',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-15T09:00:00.000Z'
    },
    {
      id: 4,
      studentId: 4,
      studentName: 'Rohan Gupta',
      classId: 2,
      className: 'Grade 1B',
      date: '2024-01-15',
      status: 'present',
      timeIn: '13:00:00',
      timeOut: '19:30:00',
      remarks: '',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-15T13:00:00.000Z'
    },
    {
      id: 5,
      studentId: 5,
      studentName: 'Ananya Singh',
      classId: 2,
      className: 'Grade 1B',
      date: '2024-01-15',
      status: 'late',
      timeIn: '13:30:00',
      timeOut: '19:30:00',
      remarks: 'Traffic delay',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-15T13:30:00.000Z'
    },
    {
      id: 6,
      studentId: 1,
      studentName: 'Arjun Sharma',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-16',
      status: 'present',
      timeIn: '08:55:00',
      timeOut: '15:30:00',
      remarks: '',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-16T08:55:00.000Z'
    },
    {
      id: 7,
      studentId: 2,
      studentName: 'Priya Patel',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-16',
      status: 'present',
      timeIn: '09:00:00',
      timeOut: '15:30:00',
      remarks: '',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-16T09:00:00.000Z'
    },
    {
      id: 8,
      studentId: 3,
      studentName: 'Kavya Reddy',
      classId: 1,
      className: 'Grade 1A',
      date: '2024-01-16',
      status: 'present',
      timeIn: '09:10:00',
      timeOut: '15:30:00',
      remarks: 'Feeling better',
      markedBy: 'teacher@gmail.com',
      createdAt: '2024-01-16T09:10:00.000Z'
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
  assessments: [],
  tests: [
    {
      id: 1,
      title: 'Math Assessment - Numbers 1-10',
      description: 'Basic assessment on number recognition and counting skills',
      subject: 'Mathematics',
      classId: 1,
      className: 'Grade 1A',
      testType: 'quiz',
      maxMarks: 20,
      duration: 30,
      scheduledDate: '2024-01-20',
      instructions: 'Read each question carefully. Show your work where needed.',
      questions: [
        {
          id: 1,
          question: 'How many apples are there in the picture?',
          type: 'multiple_choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '5',
          marks: 2
        },
        {
          id: 2,
          question: 'Write the number that comes after 7.',
          type: 'short_answer',
          correctAnswer: '8',
          marks: 2
        },
        {
          id: 3,
          question: 'Circle the biggest number: 3, 8, 5, 2',
          type: 'multiple_choice',
          options: ['3', '8', '5', '2'],
          correctAnswer: '8',
          marks: 2
        },
        {
          id: 4,
          question: 'Count and write how many stars: ⭐⭐⭐⭐⭐⭐',
          type: 'short_answer',
          correctAnswer: '6',
          marks: 2
        },
        {
          id: 5,
          question: 'What number comes before 5?',
          type: 'short_answer',
          correctAnswer: '4',
          marks: 2
        }
      ],
      status: 'published',
      createdBy: 1,
      createdByName: 'Sarah Johnson',
      createdAt: '2024-01-18T10:00:00.000Z',
      updatedAt: '2024-01-18T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'English - Letter Recognition Test',
      description: 'Assessment on letter recognition and beginning sounds',
      subject: 'English',
      classId: 1,
      className: 'Grade 1A',
      testType: 'unit_test',
      maxMarks: 25,
      duration: 45,
      scheduledDate: '2024-01-25',
      instructions: 'Look at each letter or picture carefully before answering.',
      questions: [
        {
          id: 1,
          question: 'What letter does "Apple" start with?',
          type: 'multiple_choice',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          marks: 3
        },
        {
          id: 2,
          question: 'Write the lowercase letter for "B".',
          type: 'short_answer',
          correctAnswer: 'b',
          marks: 3
        },
        {
          id: 3,
          question: 'Which letter comes after "M" in the alphabet?',
          type: 'multiple_choice',
          options: ['L', 'N', 'O', 'P'],
          correctAnswer: 'N',
          marks: 3
        },
        {
          id: 4,
          question: 'Circle the letter that makes the /s/ sound.',
          type: 'multiple_choice',
          options: ['R', 'S', 'T', 'U'],
          correctAnswer: 'S',
          marks: 3
        },
        {
          id: 5,
          question: 'Name three things that start with the letter "C".',
          type: 'long_answer',
          correctAnswer: 'Cat, Car, Cake (or any valid answers)',
          marks: 4
        }
      ],
      status: 'draft',
      createdBy: 2,
      createdByName: 'Michael Chen',
      createdAt: '2024-01-19T14:30:00.000Z',
      updatedAt: '2024-01-19T14:30:00.000Z'
    },
    {
      id: 3,
      title: 'Science Exploration Quiz',
      description: 'Simple science concepts for early learners',
      subject: 'Science',
      classId: 2,
      className: 'Grade 1B',
      testType: 'quiz',
      maxMarks: 15,
      duration: 25,
      scheduledDate: '2024-01-22',
      instructions: 'Choose the best answer for each question.',
      questions: [
        {
          id: 1,
          question: 'What do plants need to grow?',
          type: 'multiple_choice',
          options: ['Water and sunlight', 'Only water', 'Only sunlight', 'Nothing'],
          correctAnswer: 'Water and sunlight',
          marks: 3
        },
        {
          id: 2,
          question: 'Which animal lives in water?',
          type: 'multiple_choice',
          options: ['Cat', 'Dog', 'Fish', 'Bird'],
          correctAnswer: 'Fish',
          marks: 3
        },
        {
          id: 3,
          question: 'What happens to ice when it gets warm?',
          type: 'multiple_choice',
          options: ['It gets harder', 'It melts', 'It stays the same', 'It becomes snow'],
          correctAnswer: 'It melts',
          marks: 3
        },
        {
          id: 4,
          question: 'How many legs does a spider have?',
          type: 'short_answer',
          correctAnswer: '8',
          marks: 3
        },
        {
          id: 5,
          question: 'Name one way we can take care of our environment.',
          type: 'short_answer',
          correctAnswer: 'Pick up trash, plant trees, save water (any valid answer)',
          marks: 3
        }
      ],
      status: 'published',
      createdBy: 3,
      createdByName: 'Priya Sharma',
      createdAt: '2024-01-17T11:00:00.000Z',
      updatedAt: '2024-01-17T11:00:00.000Z'
    }
  ],
  testResults: [
    {
      id: 1,
      testId: 1,
      studentId: 1,
      studentName: 'Arjun Sharma',
      answers: ['5', '8', '8', '6', '4'],
      score: 20,
      maxMarks: 20,
      percentage: '100.00',
      timeSpent: 25,
      submittedAt: '2024-01-20T10:30:00.000Z',
      status: 'graded',
      feedback: 'Excellent work! Perfect score on all questions.',
      gradedBy: 1,
      gradedAt: '2024-01-20T15:00:00.000Z'
    },
    {
      id: 2,
      testId: 1,
      studentId: 2,
      studentName: 'Priya Patel',
      answers: ['5', '8', '8', '7', '4'],
      score: 18,
      maxMarks: 20,
      percentage: '90.00',
      timeSpent: 28,
      submittedAt: '2024-01-20T10:35:00.000Z',
      status: 'graded',
      feedback: 'Very good work! Small mistake on question 4.',
      gradedBy: 1,
      gradedAt: '2024-01-20T15:05:00.000Z'
    },
    {
      id: 3,
      testId: 3,
      studentId: 4,
      studentName: 'Rohan Gupta',
      answers: ['Water and sunlight', 'Fish', 'It melts', '8', 'Plant trees'],
      score: 15,
      maxMarks: 15,
      percentage: '100.00',
      timeSpent: 22,
      submittedAt: '2024-01-22T14:20:00.000Z',
      status: 'graded',
      feedback: 'Perfect score! Shows excellent understanding of basic science concepts.',
      gradedBy: 3,
      gradedAt: '2024-01-22T16:00:00.000Z'
    }
  ],
  lessonPlans: [
    {
      id: 1,
      teacher: 'Sarah Johnson',
      teacherId: 1,
      class: 'Grade 1A',
      classId: 1,
      subject: 'Mathematics',
      title: 'Mathematics Foundation Program - Grade 1A',
      academicYear: '2024-25',
      createdBy: 'admin@gmail.com',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      lessons: [
        {
          id: 1,
          name: 'Counting 1-10',
          estimatedPeriods: 5,
          learningOutcomes: [
            'Count objects from 1 to 10 accurately',
            'Recognize and name number symbols 1-10',
            'Demonstrate one-to-one correspondence'
          ],
          activities: [
            {
              id: 1,
              name: 'Counting Bears Activity',
              activityType: 'Individual',
              gradingType: 'Rubric',
              description: 'Students count colored bears and match to number cards',
              materials: ['Counting bears', 'Number cards', 'Recording sheet']
            },
            {
              id: 2,
              name: 'Number Recognition Game',
              activityType: 'Group',
              gradingType: 'Marks',
              description: 'Interactive game where students identify numbers called out',
              materials: ['Number cards', 'Timer', 'Score sheet']
            },
            {
              id: 3,
              name: 'Number Writing Practice',
              activityType: 'Homework',
              gradingType: 'Rubric',
              description: 'Practice writing numbers 1-10 with proper formation',
              materials: ['Writing worksheets', 'Pencils', 'Number formation guide']
            }
          ]
        },
        {
          id: 2,
          name: 'Counting 11-20',
          estimatedPeriods: 4,
          learningOutcomes: [
            'Count objects from 11 to 20 accurately',
            'Understand the structure of teen numbers',
            'Recognize number patterns in teen numbers'
          ],
          activities: [
            {
              id: 4,
              name: 'Teen Number Exploration',
              activityType: 'Individual',
              gradingType: 'Marks',
              description: 'Explore teen numbers using tens and ones blocks',
              materials: ['Base-10 blocks', 'Teen number cards', 'Recording sheets']
            },
            {
              id: 5,
              name: 'Number Line Walk',
              activityType: 'Group',
              gradingType: 'Rubric',
              description: 'Physical number line activity for understanding sequence',
              materials: ['Floor number line', 'Number cards', 'Movement instructions']
            }
          ]
        },
        {
          id: 3,
          name: 'Basic Addition Concepts',
          estimatedPeriods: 6,
          learningOutcomes: [
            'Understand addition as combining groups',
            'Use addition vocabulary correctly',
            'Solve simple addition problems using objects'
          ],
          activities: [
            {
              id: 6,
              name: 'Addition Stories',
              activityType: 'Individual',
              gradingType: 'Rubric',
              description: 'Create and solve addition word problems',
              materials: ['Story mats', 'Counting objects', 'Writing materials']
            },
            {
              id: 7,
              name: 'Addition with Manipulatives',
              activityType: 'Group',
              gradingType: 'Marks',
              description: 'Hands-on addition using various objects',
              materials: ['Various manipulatives', 'Addition boards', 'Recording sheets']
            },
            {
              id: 8,
              name: 'Family Addition Practice',
              activityType: 'Homework',
              gradingType: 'Rubric',
              description: 'Practice addition at home with family members',
              materials: ['Home practice sheets', 'Parent guide', 'Household objects']
            }
          ]
        },
        {
          id: 4,
          name: 'Number Comparison and Ordering',
          estimatedPeriods: 3,
          learningOutcomes: [
            'Compare quantities using more, less, and equal',
            'Order numbers from 1-20',
            'Use comparison symbols appropriately'
          ],
          activities: [
            {
              id: 9,
              name: 'Greater Than Less Than Game',
              activityType: 'Group',
              gradingType: 'Marks',
              description: 'Interactive game comparing numbers using symbols',
              materials: ['Number cards', 'Comparison symbols', 'Game boards']
            },
            {
              id: 10,
              name: 'Number Ordering Challenge',
              activityType: 'Individual',
              gradingType: 'Rubric',
              description: 'Arrange numbers in ascending and descending order',
              materials: ['Number cards', 'Sorting mats', 'Recording sheets']
            }
          ]
        }
      ]
    },
    {
      id: 2,
      teacher: 'Michael Chen',
      teacherId: 2,
      class: 'Grade 1A',
      classId: 1,
      subject: 'English',
      title: 'Language Arts Foundation - Grade 1A',
      academicYear: '2024-25',
      createdBy: 'admin@gmail.com',
      createdAt: '2024-01-15T11:00:00.000Z',
      updatedAt: '2024-01-15T11:00:00.000Z',
      lessons: [
        {
          id: 5,
          name: 'Letter Recognition A-M',
          estimatedPeriods: 8,
          learningOutcomes: [
            'Identify uppercase and lowercase letters A-M',
            'Associate letters with beginning sounds',
            'Write letters A-M with proper formation'
          ],
          activities: [
            {
              id: 11,
              name: 'Letter Scavenger Hunt',
              activityType: 'Group',
              gradingType: 'Rubric',
              description: 'Find objects around classroom that begin with letters A-M',
              materials: ['Letter cards', 'Collection bags', 'Recording sheets']
            },
            {
              id: 12,
              name: 'Alphabet Book Creation',
              activityType: 'Individual',
              gradingType: 'Rubric',
              description: 'Create personal alphabet book with drawings and letters',
              materials: ['Blank books', 'Crayons', 'Letter stamps', 'Stickers']
            },
            {
              id: 13,
              name: 'Letter Formation Practice',
              activityType: 'Homework',
              gradingType: 'Marks',
              description: 'Practice writing letters with family support',
              materials: ['Practice sheets', 'Parent guide', 'Writing tools']
            }
          ]
        },
        {
          id: 6,
          name: 'Letter Recognition N-Z',
          estimatedPeriods: 8,
          learningOutcomes: [
            'Identify uppercase and lowercase letters N-Z',
            'Complete full alphabet recognition',
            'Understand alphabetical order'
          ],
          activities: [
            {
              id: 14,
              name: 'Alphabet Song and Dance',
              activityType: 'Group',
              gradingType: 'Rubric',
              description: 'Learn alphabet through songs and movement',
              materials: ['Music player', 'Alphabet song', 'Movement cards']
            },
            {
              id: 15,
              name: 'Letter Puzzle Challenge',
              activityType: 'Individual',
              gradingType: 'Marks',
              description: 'Complete alphabet puzzles and sequence activities',
              materials: ['Alphabet puzzles', 'Letter tiles', 'Sequence cards']
            }
          ]
        },
        {
          id: 7,
          name: 'Beginning Sounds and Phonics',
          estimatedPeriods: 6,
          learningOutcomes: [
            'Identify beginning sounds in words',
            'Match sounds to corresponding letters',
            'Demonstrate phonemic awareness skills'
          ],
          activities: [
            {
              id: 16,
              name: 'Sound Sorting Games',
              activityType: 'Group',
              gradingType: 'Marks',
              description: 'Sort objects and pictures by beginning sounds',
              materials: ['Picture cards', 'Sorting mats', 'Sound boxes']
            },
            {
              id: 17,
              name: 'Phonics Detective',
              activityType: 'Individual',
              gradingType: 'Rubric',
              description: 'Find and identify beginning sounds in books',
              materials: ['Simple books', 'Magnifying glasses', 'Sound charts']
            },
            {
              id: 18,
              name: 'Family Sound Hunt',
              activityType: 'Homework',
              gradingType: 'Rubric',
              description: 'Search for objects at home with specific beginning sounds',
              materials: ['Sound hunt sheets', 'Parent instructions', 'Collection bags']
            }
          ]
        }
      ]
    }
  ]
};

module.exports = { data, demoPdfBuffer: { get: () => demoPdfBuffer, set: (value) => demoPdfBuffer = value } };