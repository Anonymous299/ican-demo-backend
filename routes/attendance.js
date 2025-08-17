const express = require('express');
const router = express.Router();
const { data } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');

// GET /api/attendance - Get attendance records with filtering
router.get('/', authenticateToken, (req, res) => {
  try {
    const { date, classId, studentId, status, startDate, endDate } = req.query;
    let filteredAttendance = [...data.attendance];

    // Filter by specific date
    if (date) {
      filteredAttendance = filteredAttendance.filter(record => record.date === date);
    }

    // Filter by date range
    if (startDate && endDate) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }

    // Filter by class
    if (classId) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.classId === parseInt(classId)
      );
    }

    // Filter by student
    if (studentId) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.studentId === parseInt(studentId)
      );
    }

    // Filter by status
    if (status) {
      filteredAttendance = filteredAttendance.filter(record => record.status === status);
    }

    // Sort by date and student name
    filteredAttendance.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return a.studentName.localeCompare(b.studentName);
    });

    res.json(filteredAttendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// GET /api/attendance/summary - Get attendance summary statistics
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const { date, classId, startDate, endDate } = req.query;
    let filteredAttendance = [...data.attendance];

    // Apply filters
    if (date) {
      filteredAttendance = filteredAttendance.filter(record => record.date === date);
    }

    if (startDate && endDate) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }

    if (classId) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.classId === parseInt(classId)
      );
    }

    // Calculate statistics
    const totalRecords = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(r => r.status === 'present').length;
    const absentCount = filteredAttendance.filter(r => r.status === 'absent').length;
    const lateCount = filteredAttendance.filter(r => r.status === 'late').length;

    const summary = {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100).toFixed(2) : 0,
      absenteeRate: totalRecords > 0 ? (absentCount / totalRecords * 100).toFixed(2) : 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
});

// GET /api/attendance/student/:studentId - Get attendance for specific student
router.get('/student/:studentId', authenticateToken, (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { startDate, endDate } = req.query;
    
    let studentAttendance = data.attendance.filter(record => 
      record.studentId === studentId
    );

    if (startDate && endDate) {
      studentAttendance = studentAttendance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }

    // Sort by date descending
    studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(studentAttendance);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Failed to fetch student attendance' });
  }
});

// GET /api/attendance/class/:classId - Get attendance for specific class
router.get('/class/:classId', authenticateToken, (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { date, startDate, endDate } = req.query;
    
    let classAttendance = data.attendance.filter(record => 
      record.classId === classId
    );

    if (date) {
      classAttendance = classAttendance.filter(record => record.date === date);
    }

    if (startDate && endDate) {
      classAttendance = classAttendance.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }

    // Sort by date and student name
    classAttendance.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return a.studentName.localeCompare(b.studentName);
    });

    res.json(classAttendance);
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    res.status(500).json({ message: 'Failed to fetch class attendance' });
  }
});

// POST /api/attendance - Mark attendance for a student
router.post('/', authenticateToken, (req, res) => {
  try {
    const { studentId, classId, date, status, timeIn, timeOut, remarks } = req.body;

    // Validate required fields
    if (!studentId || !classId || !date || !status) {
      return res.status(400).json({ 
        message: 'Student ID, Class ID, date, and status are required' 
      });
    }

    // Validate status
    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be one of: present, absent, late' 
      });
    }

    // Get student and class information
    const student = data.students.find(s => s.id === parseInt(studentId));
    const classInfo = data.classes.find(c => c.id === parseInt(classId));

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if attendance already exists for this student on this date
    const existingAttendance = data.attendance.find(record => 
      record.studentId === parseInt(studentId) && record.date === date
    );

    if (existingAttendance) {
      return res.status(409).json({ 
        message: 'Attendance already marked for this student on this date' 
      });
    }

    // Create new attendance record
    const newAttendance = {
      id: data.attendance.length > 0 ? Math.max(...data.attendance.map(a => a.id)) + 1 : 1,
      studentId: parseInt(studentId),
      studentName: student.name,
      classId: parseInt(classId),
      className: classInfo.name,
      date,
      status,
      timeIn: status === 'absent' ? null : timeIn || null,
      timeOut: status === 'absent' ? null : timeOut || null,
      remarks: remarks || '',
      markedBy: req.user.email,
      createdAt: new Date().toISOString()
    };

    data.attendance.push(newAttendance);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: newAttendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const { status, timeIn, timeOut, remarks } = req.body;

    const attendanceIndex = data.attendance.findIndex(record => record.id === attendanceId);

    if (attendanceIndex === -1) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['present', 'absent', 'late'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Status must be one of: present, absent, late' 
        });
      }
    }

    // Update the record
    const updatedAttendance = { ...data.attendance[attendanceIndex] };
    
    if (status !== undefined) {
      updatedAttendance.status = status;
      // Clear time data if marking as absent
      if (status === 'absent') {
        updatedAttendance.timeIn = null;
        updatedAttendance.timeOut = null;
      }
    }
    
    if (timeIn !== undefined) updatedAttendance.timeIn = timeIn;
    if (timeOut !== undefined) updatedAttendance.timeOut = timeOut;
    if (remarks !== undefined) updatedAttendance.remarks = remarks;

    data.attendance[attendanceIndex] = updatedAttendance;

    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

// POST /api/attendance/bulk - Mark attendance for multiple students
router.post('/bulk', authenticateToken, (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ 
        message: 'attendanceRecords array is required and cannot be empty' 
      });
    }

    const results = [];
    const errors = [];

    attendanceRecords.forEach((record, index) => {
      const { studentId, classId, date, status, timeIn, timeOut, remarks } = record;

      // Validate required fields
      if (!studentId || !classId || !date || !status) {
        errors.push({
          index,
          error: 'Student ID, Class ID, date, and status are required'
        });
        return;
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late'];
      if (!validStatuses.includes(status)) {
        errors.push({
          index,
          error: 'Status must be one of: present, absent, late'
        });
        return;
      }

      // Get student and class information
      const student = data.students.find(s => s.id === parseInt(studentId));
      const classInfo = data.classes.find(c => c.id === parseInt(classId));

      if (!student) {
        errors.push({
          index,
          error: 'Student not found'
        });
        return;
      }

      if (!classInfo) {
        errors.push({
          index,
          error: 'Class not found'
        });
        return;
      }

      // Check if attendance already exists
      const existingAttendance = data.attendance.find(existing => 
        existing.studentId === parseInt(studentId) && existing.date === date
      );

      if (existingAttendance) {
        errors.push({
          index,
          error: 'Attendance already marked for this student on this date'
        });
        return;
      }

      // Create new attendance record
      const newAttendance = {
        id: data.attendance.length > 0 ? Math.max(...data.attendance.map(a => a.id)) + 1 : 1,
        studentId: parseInt(studentId),
        studentName: student.name,
        classId: parseInt(classId),
        className: classInfo.name,
        date,
        status,
        timeIn: status === 'absent' ? null : timeIn || null,
        timeOut: status === 'absent' ? null : timeOut || null,
        remarks: remarks || '',
        markedBy: req.user.email,
        createdAt: new Date().toISOString()
      };

      data.attendance.push(newAttendance);
      results.push(newAttendance);
    });

    res.status(201).json({
      message: `Bulk attendance operation completed. ${results.length} records created.`,
      created: results,
      errors: errors
    });
  } catch (error) {
    console.error('Error bulk marking attendance:', error);
    res.status(500).json({ message: 'Failed to bulk mark attendance' });
  }
});

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const attendanceIndex = data.attendance.findIndex(record => record.id === attendanceId);

    if (attendanceIndex === -1) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const deletedAttendance = data.attendance.splice(attendanceIndex, 1)[0];

    res.json({
      message: 'Attendance record deleted successfully',
      attendance: deletedAttendance
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Failed to delete attendance record' });
  }
});

module.exports = router;