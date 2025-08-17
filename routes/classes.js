const express = require('express');
const { data } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'parent') {
    const parentClasses = data.classes.filter(c => 
      data.students.some(s => 
        req.user.studentIds.includes(s.id) && s.class === c.name
      )
    );
    return res.json(parentClasses);
  }
  
  res.json(data.classes);
});

// Create class
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { grade, division, description, teacherId, classTeacher, capacity, subjects, schedule, academicYear, status } = req.body;
  
  const maxId = Math.max(...data.classes.map(c => c.id), 0, Date.now());
  const className = `Grade ${grade}${division}`;
  
  const newClass = {
    id: maxId + 1,
    name: className,
    grade,
    division,
    description,
    teacherId: teacherId || null,
    classTeacher: classTeacher || null,
    capacity: parseInt(capacity) || 25,
    currentEnrollment: 0,
    subjects: Array.isArray(subjects) ? subjects : [],
    schedule: schedule || 'Morning',
    academicYear: academicYear || '2024-25',
    status: status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.classes.push(newClass);
  res.json(newClass);
});

// Get class by ID
router.get('/:id', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.id);
  const classItem = data.classes.find(c => c.id === classId);
  
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  if (req.user.role === 'parent') {
    const hasAccess = data.students.some(s => 
      req.user.studentIds.includes(s.id) && s.class === classItem.name
    );
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  const studentsInClass = data.students.filter(s => s.class === classItem.name);
  const response = {
    ...classItem,
    students: studentsInClass
  };
  
  res.json(response);
});

// Update class
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const classId = parseInt(req.params.id);
  const classIndex = data.classes.findIndex(c => c.id === classId);
  
  if (classIndex === -1) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  const { grade, division, description, teacherId, classTeacher, capacity, subjects, schedule, academicYear, status } = req.body;
  const className = `Grade ${grade}${division}`;
  
  const updatedClass = {
    ...data.classes[classIndex],
    name: className,
    grade,
    division,
    description,
    teacherId: teacherId || null,
    classTeacher: classTeacher || null,
    capacity: parseInt(capacity) || data.classes[classIndex].capacity,
    subjects: Array.isArray(subjects) ? subjects : data.classes[classIndex].subjects,
    schedule: schedule || data.classes[classIndex].schedule,
    academicYear: academicYear || data.classes[classIndex].academicYear,
    status: status || data.classes[classIndex].status,
    updatedAt: new Date().toISOString()
  };
  
  data.classes[classIndex] = updatedClass;
  
  // Update students' class names if grade/division changed
  data.students.forEach(student => {
    if (student.class === data.classes[classIndex].name) {
      student.class = className;
      student.standard = grade;
      student.division = division;
    }
  });
  
  res.json(updatedClass);
});

// Delete class
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const classId = parseInt(req.params.id);
  const classIndex = data.classes.findIndex(c => c.id === classId);
  
  if (classIndex === -1) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  const classItem = data.classes[classIndex];
  const studentsInClass = data.students.filter(s => s.class === classItem.name);
  
  if (studentsInClass.length > 0) {
    return res.status(400).json({ 
      error: `Cannot delete class. ${studentsInClass.length} students are enrolled. Please transfer students first.`,
      studentsCount: studentsInClass.length
    });
  }
  
  data.classes.splice(classIndex, 1);
  res.json({ message: 'Class deleted successfully' });
});

// Get class statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
  const classId = parseInt(req.params.id);
  const classItem = data.classes.find(c => c.id === classId);
  
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  
  if (req.user.role === 'parent') {
    const hasAccess = data.students.some(s => 
      req.user.studentIds.includes(s.id) && s.class === classItem.name
    );
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  const stats = {
    classId: classItem.id,
    className: classItem.name,
    totalCapacity: classItem.capacity,
    currentEnrollment: classItem.currentEnrollment,
    availableSpots: classItem.capacity - classItem.currentEnrollment,
    enrollmentPercentage: Math.round((classItem.currentEnrollment / classItem.capacity) * 100),
    subjects: classItem.subjects.length,
    hasClassTeacher: !!classItem.classTeacher,
    academicYear: classItem.academicYear,
    status: classItem.status
  };
  
  res.json(stats);
});

// Bulk operations
router.post('/bulk', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { operation, classes: bulkData } = req.body;
  
  if (operation === 'create_standard_classes') {
    const { grade, academicYear } = bulkData;
    const divisions = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    let created = 0;
    let errors = [];
    
    divisions.forEach(division => {
      try {
        const className = `Grade ${grade}${division}`;
        
        // Check if class already exists
        const existingClass = data.classes.find(c => c.name === className && c.academicYear === academicYear);
        if (existingClass) {
          errors.push(`Class ${className} already exists for ${academicYear}`);
          return;
        }
        
        const maxId = Math.max(...data.classes.map(c => c.id), 0, Date.now());
        const newClass = {
          id: maxId + created + 1,
          name: className,
          grade,
          division,
          description: `${className} ${academicYear?.split('-')[0] || 'Morning'}`,
          teacherId: null,
          classTeacher: null,
          capacity: 25,
          currentEnrollment: 0,
          subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
          schedule: 'Morning',
          academicYear: academicYear || '2024-25',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.classes.push(newClass);
        created++;
        
      } catch (error) {
        errors.push(`Failed to create Grade ${grade}${division}: ${error.message}`);
      }
    });
    
    res.json({
      message: `Bulk creation completed. Created ${created} classes.`,
      created,
      errors,
      total: divisions.length
    });
  } else {
    res.status(400).json({ error: 'Unknown bulk operation' });
  }
});

module.exports = router;