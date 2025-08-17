const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { data } = require('../data/mockData');

// Get all tests with optional filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { classId, subject, testType, status, teacherId } = req.query;
    let filteredTests = [...(data.tests || [])];

    // Apply filters
    if (classId) {
      filteredTests = filteredTests.filter(test => test.classId === parseInt(classId));
    }
    
    if (subject) {
      filteredTests = filteredTests.filter(test => 
        test.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }
    
    if (testType) {
      filteredTests = filteredTests.filter(test => test.testType === testType);
    }
    
    if (status) {
      filteredTests = filteredTests.filter(test => test.status === status);
    }
    
    if (teacherId) {
      filteredTests = filteredTests.filter(test => test.createdBy === parseInt(teacherId));
    }

    // Role-based filtering
    if (req.user.role === 'teacher') {
      // Teachers can see tests they created or tests for their classes
      filteredTests = filteredTests.filter(test => 
        test.createdBy === req.user.id || 
        (data.classes || []).some(cls => 
          cls.teacherId === req.user.id && cls.id === test.classId
        )
      );
    } else if (req.user.role === 'student') {
      // Students can only see tests for their class
      const student = data.students.find(s => s.id === req.user.studentId);
      if (student) {
        const studentClass = data.classes.find(c => c.name === student.class);
        if (studentClass) {
          filteredTests = filteredTests.filter(test => test.classId === studentClass.id);
        }
      }
    } else if (req.user.role === 'parent') {
      // Parents can see tests for their children's classes
      const childrenClasses = req.user.studentIds.map(studentId => {
        const student = data.students.find(s => s.id === studentId);
        return student ? data.classes.find(c => c.name === student.class) : null;
      }).filter(Boolean);
      
      filteredTests = filteredTests.filter(test => 
        childrenClasses.some(cls => cls.id === test.classId)
      );
    }

    res.json(filteredTests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Get a specific test by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const test = (data.tests || []).find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Role-based access control
    if (req.user.role === 'teacher') {
      // Teachers can access tests they created or tests for their classes
      const hasAccess = test.createdBy === req.user.id || 
        (data.classes || []).some(cls => 
          cls.teacherId === req.user.id && cls.id === test.classId
        );
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'student') {
      // Students can only access tests for their class
      const student = data.students.find(s => s.id === req.user.studentId);
      if (student) {
        const studentClass = data.classes.find(c => c.name === student.class);
        if (!studentClass || test.classId !== studentClass.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
    } else if (req.user.role === 'parent') {
      // Parents can access tests for their children's classes
      const childrenClasses = req.user.studentIds.map(studentId => {
        const student = data.students.find(s => s.id === studentId);
        return student ? data.classes.find(c => c.name === student.class) : null;
      }).filter(Boolean);
      
      const hasAccess = childrenClasses.some(cls => cls.id === test.classId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// Create a new test
router.post('/', authenticateToken, (req, res) => {
  try {
    // Only admin and teachers can create tests
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only admins and teachers can create tests' });
    }

    const {
      title,
      description,
      subject,
      classId,
      testType,
      maxMarks,
      duration,
      scheduledDate,
      instructions,
      questions
    } = req.body;

    // Validation
    if (!title || !subject || !classId || !testType || !maxMarks || !scheduledDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, subject, classId, testType, maxMarks, scheduledDate' 
      });
    }

    // Validate classId exists
    const classExists = (data.classes || []).find(c => c.id === parseInt(classId));
    if (!classExists) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    // For teachers, ensure they have access to the class
    if (req.user.role === 'teacher') {
      const hasAccess = classExists.teacherId === req.user.id;
      if (!hasAccess) {
        return res.status(403).json({ error: 'You can only create tests for classes you teach' });
      }
    }

    // Initialize tests array if it doesn't exist
    if (!data.tests) {
      data.tests = [];
    }

    const maxId = data.tests.length > 0 ? Math.max(...data.tests.map(t => t.id)) : 0;
    const newTest = {
      id: maxId + 1,
      title,
      description: description || '',
      subject,
      classId: parseInt(classId),
      className: classExists.name,
      testType, // 'quiz', 'unit_test', 'midterm', 'final', 'assignment'
      maxMarks: parseInt(maxMarks),
      duration: duration || 60, // Duration in minutes
      scheduledDate,
      instructions: instructions || '',
      questions: questions || [],
      status: 'draft', // 'draft', 'published', 'completed', 'graded'
      createdBy: req.user.id,
      createdByName: req.user.name || req.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.tests.push(newTest);
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Update a test
router.put('/:id', authenticateToken, (req, res) => {
  try {
    // Only admin and teachers can update tests
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only admins and teachers can update tests' });
    }

    const testId = parseInt(req.params.id);
    const testIndex = (data.tests || []).findIndex(t => t.id === testId);
    
    if (testIndex === -1) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const existingTest = data.tests[testIndex];

    // For teachers, ensure they can only update their own tests
    if (req.user.role === 'teacher' && existingTest.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update tests you created' });
    }

    const updatedTest = {
      ...existingTest,
      ...req.body,
      id: testId, // Prevent ID from being changed
      createdBy: existingTest.createdBy, // Prevent creator from being changed
      createdAt: existingTest.createdAt, // Prevent creation date from being changed
      updatedAt: new Date().toISOString()
    };

    // If classId is being updated, validate it
    if (req.body.classId && req.body.classId !== existingTest.classId) {
      const classExists = (data.classes || []).find(c => c.id === parseInt(req.body.classId));
      if (!classExists) {
        return res.status(400).json({ error: 'Invalid class ID' });
      }
      updatedTest.className = classExists.name;
    }

    data.tests[testIndex] = updatedTest;
    res.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Delete a test
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    // Only admin and teachers can delete tests
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only admins and teachers can delete tests' });
    }

    const testId = parseInt(req.params.id);
    const testIndex = (data.tests || []).findIndex(t => t.id === testId);
    
    if (testIndex === -1) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const existingTest = data.tests[testIndex];

    // For teachers, ensure they can only delete their own tests
    if (req.user.role === 'teacher' && existingTest.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete tests you created' });
    }

    // Don't allow deletion of published tests with submissions
    if (existingTest.status === 'completed' || existingTest.status === 'graded') {
      return res.status(400).json({ 
        error: 'Cannot delete tests that have been completed or graded' 
      });
    }

    data.tests.splice(testIndex, 1);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// Get test results/submissions for a specific test
router.get('/:id/results', authenticateToken, (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const test = (data.tests || []).find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Role-based access control
    if (req.user.role === 'teacher' && test.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only view results for tests you created' });
    } else if (req.user.role === 'student') {
      // Students can only see their own results
      const student = data.students.find(s => s.id === req.user.studentId);
      if (!student) {
        return res.status(403).json({ error: 'Student not found' });
      }
    } else if (req.user.role === 'parent') {
      // Parents can see results for their children
      const hasAccess = req.user.studentIds.some(studentId => {
        const student = data.students.find(s => s.id === studentId);
        if (student) {
          const studentClass = data.classes.find(c => c.name === student.class);
          return studentClass && test.classId === studentClass.id;
        }
        return false;
      });
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Initialize test results if not exists
    if (!data.testResults) {
      data.testResults = [];
    }

    let results = data.testResults.filter(r => r.testId === testId);

    // Filter results based on user role
    if (req.user.role === 'student') {
      results = results.filter(r => r.studentId === req.user.studentId);
    } else if (req.user.role === 'parent') {
      results = results.filter(r => req.user.studentIds.includes(r.studentId));
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

// Submit test answers (for students)
router.post('/:id/submit', authenticateToken, (req, res) => {
  try {
    console.log('=== Test Submission Debug ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    console.log('Test ID:', req.params.id);

    // Only students can submit test answers
    if (req.user.role !== 'student') {
      console.log('Error: User is not a student, role:', req.user.role);
      return res.status(403).json({ error: 'Only students can submit test answers' });
    }

    const testId = parseInt(req.params.id);
    const test = (data.tests || []).find(t => t.id === testId);
    
    if (!test) {
      console.log('Error: Test not found, testId:', testId);
      return res.status(404).json({ error: 'Test not found' });
    }

    console.log('Found test:', test.title, 'Status:', test.status);

    // Check if test is published and available
    if (test.status !== 'published') {
      console.log('Error: Test not published, status:', test.status);
      return res.status(400).json({ error: 'Test is not available for submission' });
    }

    const student = data.students.find(s => s.id === req.user.studentId);
    if (!student) {
      console.log('Error: Student not found, studentId:', req.user.studentId);
      console.log('Available students:', data.students.map(s => ({ id: s.id, name: s.name })));
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log('Found student:', student.name, 'Class:', student.class);

    // Verify student belongs to the test's class
    const studentClass = data.classes.find(c => c.name === student.class);
    console.log('Student class:', studentClass);
    console.log('Test classId:', test.classId);
    
    if (!studentClass || test.classId !== studentClass.id) {
      console.log('Error: Class mismatch. Student class ID:', studentClass?.id, 'Test class ID:', test.classId);
      return res.status(403).json({ error: 'You are not enrolled in this test\'s class' });
    }

    // Initialize test results if not exists
    if (!data.testResults) {
      data.testResults = [];
    }

    // Check if student has already submitted
    const existingSubmission = data.testResults.find(r => 
      r.testId === testId && r.studentId === req.user.studentId
    );
    
    if (existingSubmission) {
      console.log('Error: Student already submitted this test');
      return res.status(400).json({ error: 'You have already submitted this test' });
    }

    const { answers, timeSpent } = req.body;
    console.log('Received answers:', answers);
    console.log('Time spent:', timeSpent);

    // Calculate score (basic implementation)
    let score = 0;
    const totalQuestions = test.questions.length;
    if (totalQuestions > 0) {
      test.questions.forEach((question, index) => {
        if (answers[index] && question.correctAnswer && 
            answers[index].toString() === question.correctAnswer.toString()) {
          score += question.marks || 1;
        }
      });
    }

    const submission = {
      id: Date.now(),
      testId,
      studentId: req.user.studentId,
      studentName: student.name,
      answers: answers || [],
      score,
      maxMarks: test.maxMarks,
      percentage: test.maxMarks > 0 ? ((score / test.maxMarks) * 100).toFixed(2) : 0,
      timeSpent: timeSpent || 0,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    data.testResults.push(submission);
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// Grade a test submission (for teachers)
router.put('/:testId/results/:resultId/grade', authenticateToken, (req, res) => {
  try {
    // Only teachers and admins can grade tests
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins can grade tests' });
    }

    const testId = parseInt(req.params.testId);
    const resultId = parseInt(req.params.resultId);

    const test = (data.tests || []).find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // For teachers, ensure they created the test
    if (req.user.role === 'teacher' && test.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only grade tests you created' });
    }

    if (!data.testResults) {
      data.testResults = [];
    }

    const resultIndex = data.testResults.findIndex(r => r.id === resultId && r.testId === testId);
    if (resultIndex === -1) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    const { score, feedback, manualGrading } = req.body;

    const updatedResult = {
      ...data.testResults[resultIndex],
      score: score !== undefined ? score : data.testResults[resultIndex].score,
      feedback: feedback || data.testResults[resultIndex].feedback,
      manualGrading: manualGrading || {},
      percentage: test.maxMarks > 0 ? (((score !== undefined ? score : data.testResults[resultIndex].score) / test.maxMarks) * 100).toFixed(2) : 0,
      gradedBy: req.user.id,
      gradedAt: new Date().toISOString(),
      status: 'graded'
    };

    data.testResults[resultIndex] = updatedResult;
    res.json(updatedResult);
  } catch (error) {
    console.error('Error grading test:', error);
    res.status(500).json({ error: 'Failed to grade test' });
  }
});

// Get test statistics
router.get('/:id/statistics', authenticateToken, (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const test = (data.tests || []).find(t => t.id === testId);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Only teachers who created the test or admins can view statistics
    if (req.user.role === 'teacher' && test.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only view statistics for tests you created' });
    } else if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!data.testResults) {
      data.testResults = [];
    }

    const results = data.testResults.filter(r => r.testId === testId);
    
    if (results.length === 0) {
      return res.json({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        submissionRate: 0
      });
    }

    const scores = results.map(r => r.score);
    const totalSubmissions = results.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalSubmissions;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = (results.filter(r => r.percentage >= 60).length / totalSubmissions) * 100;

    // Calculate submission rate (total students in class vs submissions)
    const classStudents = data.students.filter(s => {
      const studentClass = data.classes.find(c => c.name === s.class);
      return studentClass && studentClass.id === test.classId;
    });
    const submissionRate = classStudents.length > 0 ? (totalSubmissions / classStudents.length) * 100 : 0;

    res.json({
      totalSubmissions,
      averageScore: parseFloat(averageScore.toFixed(2)),
      highestScore,
      lowestScore,
      passRate: parseFloat(passRate.toFixed(2)),
      submissionRate: parseFloat(submissionRate.toFixed(2)),
      averagePercentage: parseFloat(((averageScore / test.maxMarks) * 100).toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching test statistics:', error);
    res.status(500).json({ error: 'Failed to fetch test statistics' });
  }
});

module.exports = router;