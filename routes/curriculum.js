const express = require('express');
const { data } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all lesson plans
router.get('/', authenticateToken, (req, res) => {
  const { grade, subject, teacher, class: className } = req.query;
  let plans = data.lessonPlans || [];
  
  if (teacher) {
    plans = plans.filter(plan => plan.teacher.toLowerCase().includes(teacher.toLowerCase()));
  }
  
  if (className) {
    plans = plans.filter(plan => plan.class === className);
  }
  
  if (subject) {
    plans = plans.filter(plan => plan.subject.toLowerCase().includes(subject.toLowerCase()));
  }
  
  res.json(plans);
});

// Get lesson plan by ID
router.get('/:id', authenticateToken, (req, res) => {
  const planId = parseInt(req.params.id);
  const plan = data.lessonPlans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  res.json(plan);
});

// Create lesson plan
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { title, teacher, teacherId, class: className, classId, subject, lessons } = req.body;
  
  if (!title || !teacher || !className || !subject) {
    return res.status(400).json({ error: 'Title, teacher, class, and subject are required' });
  }
  
  const maxId = Math.max(...data.lessonPlans.map(p => p.id), 0);
  const newPlan = {
    id: maxId + 1,
    title,
    teacher,
    teacherId: teacherId || null,
    class: className,
    classId: classId || null,
    subject,
    academicYear: '2024-25',
    lessons: lessons || [],
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.lessonPlans.push(newPlan);
  res.json(newPlan);
});

// Update lesson plan
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.lessonPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  const { title, teacher, teacherId, class: className, classId, subject, lessons, academicYear } = req.body;
  
  data.lessonPlans[planIndex] = {
    ...data.lessonPlans[planIndex],
    title: title || data.lessonPlans[planIndex].title,
    teacher: teacher || data.lessonPlans[planIndex].teacher,
    teacherId: teacherId || data.lessonPlans[planIndex].teacherId,
    class: className || data.lessonPlans[planIndex].class,
    classId: classId || data.lessonPlans[planIndex].classId,
    subject: subject || data.lessonPlans[planIndex].subject,
    lessons: lessons || data.lessonPlans[planIndex].lessons,
    academicYear: academicYear || data.lessonPlans[planIndex].academicYear,
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.lessonPlans[planIndex]);
});

// Delete lesson plan
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.lessonPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  data.lessonPlans.splice(planIndex, 1);
  res.json({ message: 'Lesson plan deleted successfully' });
});

// Get lesson plan statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
  const planId = parseInt(req.params.id);
  const plan = data.lessonPlans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  const stats = {
    planId: plan.id,
    title: plan.title,
    totalLessons: plan.lessons.length,
    totalActivities: plan.lessons.reduce((sum, lesson) => sum + (lesson.activities?.length || 0), 0),
    totalPeriods: plan.lessons.reduce((sum, lesson) => sum + (lesson.estimatedPeriods || 0), 0),
    teacher: plan.teacher,
    class: plan.class,
    subject: plan.subject,
    createdBy: plan.createdBy,
    lastUpdated: plan.updatedAt
  };
  
  res.json(stats);
});

// Add lesson to lesson plan
router.post('/:id/lessons', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.lessonPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  const { name, estimatedPeriods, learningOutcomes, activities } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Lesson name is required' });
  }
  
  const plan = data.lessonPlans[planIndex];
  const maxLessonId = Math.max(...(plan.lessons?.map(l => l.id) || [0]), 0);
  
  const newLesson = {
    id: maxLessonId + 1,
    name,
    estimatedPeriods: estimatedPeriods || 1,
    learningOutcomes: learningOutcomes || [],
    activities: activities || []
  };
  
  if (!plan.lessons) {
    plan.lessons = [];
  }
  
  plan.lessons.push(newLesson);
  plan.updatedAt = new Date().toISOString();
  
  res.json(newLesson);
});

// Update lesson in lesson plan
router.put('/:id/lessons/:lessonId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const lessonId = parseInt(req.params.lessonId);
  const planIndex = data.lessonPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  const plan = data.lessonPlans[planIndex];
  const lessonIndex = plan.lessons?.findIndex(l => l.id === lessonId);
  
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  
  const { name, estimatedPeriods, learningOutcomes, activities } = req.body;
  
  plan.lessons[lessonIndex] = {
    ...plan.lessons[lessonIndex],
    name: name || plan.lessons[lessonIndex].name,
    estimatedPeriods: estimatedPeriods || plan.lessons[lessonIndex].estimatedPeriods,
    learningOutcomes: learningOutcomes || plan.lessons[lessonIndex].learningOutcomes,
    activities: activities || plan.lessons[lessonIndex].activities
  };
  
  plan.updatedAt = new Date().toISOString();
  
  res.json(plan.lessons[lessonIndex]);
});

// Delete lesson from lesson plan
router.delete('/:id/lessons/:lessonId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const lessonId = parseInt(req.params.lessonId);
  const planIndex = data.lessonPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Lesson plan not found' });
  }
  
  const plan = data.lessonPlans[planIndex];
  const lessonIndex = plan.lessons?.findIndex(l => l.id === lessonId);
  
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  
  plan.lessons.splice(lessonIndex, 1);
  plan.updatedAt = new Date().toISOString();
  
  res.json({ message: 'Lesson deleted successfully' });
});

module.exports = router;