const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { data } = require('../data/mockData');

// Get all students with optional filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { classId, grade, division } = req.query;
    let filteredStudents = [...(data.students || [])];

    // Apply filters
    if (classId) {
      const targetClass = data.classes.find(c => c.id === parseInt(classId));
      if (targetClass) {
        filteredStudents = filteredStudents.filter(student => student.class === targetClass.name);
      }
    }
    
    if (grade) {
      filteredStudents = filteredStudents.filter(student => student.standard === grade);
    }
    
    if (division) {
      filteredStudents = filteredStudents.filter(student => student.division === division);
    }

    // Role-based filtering
    if (req.user.role === 'teacher') {
      // Teachers can see students in their classes
      const teacherClasses = data.classes.filter(cls => cls.teacherId === req.user.id);
      const teacherClassNames = teacherClasses.map(cls => cls.name);
      filteredStudents = filteredStudents.filter(student => 
        teacherClassNames.includes(student.class)
      );
    } else if (req.user.role === 'parent') {
      // Parents can only see their own children
      filteredStudents = filteredStudents.filter(student => 
        req.user.studentIds && req.user.studentIds.includes(student.id)
      );
    } else if (req.user.role === 'student') {
      // Students can only see themselves
      filteredStudents = filteredStudents.filter(student => 
        student.id === req.user.studentId
      );
    }
    // Admin can see all students (no additional filtering)

    res.json(filteredStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get a specific student by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = (data.students || []).find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Role-based access control
    if (req.user.role === 'teacher') {
      // Teachers can access students in their classes
      const teacherClasses = data.classes.filter(cls => cls.teacherId === req.user.id);
      const teacherClassNames = teacherClasses.map(cls => cls.name);
      if (!teacherClassNames.includes(student.class)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'parent') {
      // Parents can only access their own children
      if (!req.user.studentIds || !req.user.studentIds.includes(studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'student') {
      // Students can only access themselves
      if (req.user.studentId !== studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    // Admin can access all students

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create a new student (admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    // Only admin can create students
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create students' });
    }

    const {
      name,
      rollNumber,
      studentId,
      dateOfBirth,
      standard,
      division,
      apaarId,
      address,
      phone,
      motherName,
      motherEducation,
      motherOccupation,
      fatherName,
      fatherEducation,
      fatherOccupation,
      siblings,
      siblingAge,
      motherTongue,
      mediumOfInstruction,
      isRural
    } = req.body;

    // Validation
    if (!name || !rollNumber || !standard || !division) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, rollNumber, standard, division' 
      });
    }

    // Initialize students array if it doesn't exist
    if (!data.students) {
      data.students = [];
    }

    const maxId = data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) : 0;
    const newStudent = {
      id: maxId + 1,
      name,
      rollNumber,
      studentId: studentId || `STU${(maxId + 1).toString().padStart(3, '0')}`,
      dateOfBirth,
      standard,
      division,
      class: `Grade ${standard}${division}`,
      apaarId,
      address,
      phone,
      motherName,
      motherEducation,
      motherOccupation,
      fatherName,
      fatherEducation,
      fatherOccupation,
      siblings: siblings || 0,
      siblingAge,
      motherTongue,
      mediumOfInstruction,
      isRural: isRural || false,
      age: dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.students.push(newStudent);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update a student (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    // Only admin can update students
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update students' });
    }

    const studentId = parseInt(req.params.id);
    const studentIndex = (data.students || []).findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const existingStudent = data.students[studentIndex];
    const updates = {};
    
    // Build updates object
    const allowedFields = [
      'name', 'rollNumber', 'studentId', 'dateOfBirth', 'standard', 'division',
      'apaarId', 'address', 'phone', 'motherName', 'motherEducation', 'motherOccupation',
      'fatherName', 'fatherEducation', 'fatherOccupation', 'siblings', 'siblingAge',
      'motherTongue', 'mediumOfInstruction', 'isRural'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates[field] = req.body[field];
      }
    });

    // Update computed fields
    if (updates.standard !== undefined || updates.division !== undefined) {
      updates.class = `Grade ${updates.standard || existingStudent.standard}${updates.division || existingStudent.division}`;
    }

    if (updates.dateOfBirth !== undefined) {
      updates.age = new Date().getFullYear() - new Date(updates.dateOfBirth).getFullYear();
    }

    updates.updatedAt = new Date().toISOString();

    // Apply updates
    Object.assign(data.students[studentIndex], updates);

    res.json(data.students[studentIndex]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete a student (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    // Only admin can delete students
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete students' });
    }

    const studentId = parseInt(req.params.id);
    const studentIndex = (data.students || []).findIndex(s => s.id === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    data.students.splice(studentIndex, 1);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Get student's test results
router.get('/:id/results', authenticateToken, (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = (data.students || []).find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Role-based access control
    if (req.user.role === 'parent') {
      if (!req.user.studentIds || !req.user.studentIds.includes(studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'student') {
      if (req.user.studentId !== studentId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      const teacherClasses = data.classes.filter(cls => cls.teacherId === req.user.id);
      const teacherClassNames = teacherClasses.map(cls => cls.name);
      if (!teacherClassNames.includes(student.class)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get all test results for this student
    const testResults = (data.testResults || []).filter(r => r.studentId === studentId);
    res.json(testResults);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ error: 'Failed to fetch student results' });
  }
});

module.exports = router;