const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { data } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all teachers
router.get('/', authenticateToken, (req, res) => {
  res.json(data.teachers);
});

// Create teacher
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, email, subject, phone, experience, qualification, isClassTeacher, classTeacherFor } = req.body;
  
  const maxId = Math.max(...data.teachers.map(t => t.id), 0);
  const newTeacher = {
    id: maxId + 1,
    name,
    email,
    subject,
    phone,
    experience: parseInt(experience) || 0,
    qualification,
    isClassTeacher: isClassTeacher === true || isClassTeacher === 'true',
    classTeacherFor: classTeacherFor || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.teachers.push(newTeacher);
  res.json(newTeacher);
});

// Update teacher
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const teacherId = parseInt(req.params.id);
  const teacherIndex = data.teachers.findIndex(t => t.id === teacherId);
  
  if (teacherIndex === -1) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  
  const { name, email, subject, phone, experience, qualification, isClassTeacher, classTeacherFor } = req.body;
  
  data.teachers[teacherIndex] = {
    ...data.teachers[teacherIndex],
    name,
    email,
    subject,
    phone,
    experience: parseInt(experience) || data.teachers[teacherIndex].experience,
    qualification,
    isClassTeacher: isClassTeacher === true || isClassTeacher === 'true',
    classTeacherFor: classTeacherFor || '',
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.teachers[teacherIndex]);
});

// Delete teacher
router.delete('/:id', authenticateToken, (req, res) => {
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

// Upload teachers from Excel
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
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
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    let successful = 0;
    let errors = [];
    
    jsonData.forEach((row, index) => {
      try {
        if (!row.Name || !row.Email || !row.Subject) {
          errors.push(`Row ${index + 2}: Missing required fields (Name, Email, Subject)`);
          return;
        }
        
        const maxId = Math.max(...data.teachers.map(t => t.id), 0);
        const newTeacher = {
          id: maxId + successful + 1,
          name: row.Name,
          email: row.Email,
          subject: row.Subject,
          phone: row.Phone || '',
          experience: parseInt(row.Experience) || 0,
          qualification: row.Qualification || '',
          isClassTeacher: row.IsClassTeacher === 'true' || row.IsClassTeacher === true,
          classTeacherFor: row.ClassTeacherFor || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.teachers.push(newTeacher);
        successful++;
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    });
    
    res.json({
      message: `Import completed. ${successful} teachers added.`,
      successful,
      errors,
      total: jsonData.length
    });
    
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(400).json({ error: 'Error processing file. Please check the format.' });
  }
});

// Download teacher template
router.get('/template', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const templateData = [
    {
      'Name': 'John Doe',
      'Email': 'john.doe@school.com',
      'Subject': 'Mathematics',
      'Phone': '9876543210',
      'Experience': '5',
      'Qualification': 'M.Sc Mathematics, B.Ed',
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

module.exports = router;