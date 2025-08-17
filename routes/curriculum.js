const express = require('express');
const { data } = require('../data/mockData');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all curriculum plans
router.get('/', authenticateToken, (req, res) => {
  const { grade, subject } = req.query;
  let plans = data.curriculumPlans || [];
  
  if (grade) {
    plans = plans.filter(plan => plan.grade === grade);
  }
  
  if (subject) {
    plans = plans.filter(plan => plan.subject.toLowerCase().includes(subject.toLowerCase()));
  }
  
  res.json(plans);
});

// Get curriculum plan by ID
router.get('/:id', authenticateToken, (req, res) => {
  const planId = parseInt(req.params.id);
  const plan = data.curriculumPlans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  res.json(plan);
});

// Create curriculum plan
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const { title, grade, subject, duration, description, objectives, units } = req.body;
  
  if (!title || !grade || !subject) {
    return res.status(400).json({ error: 'Title, grade, and subject are required' });
  }
  
  const maxId = Math.max(...data.curriculumPlans.map(p => p.id), 0);
  const newPlan = {
    id: maxId + 1,
    title,
    grade,
    subject,
    duration: duration || '1 Term',
    description: description || '',
    objectives: objectives || [],
    units: units || [],
    status: 'active',
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.curriculumPlans.push(newPlan);
  res.json(newPlan);
});

// Update curriculum plan
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.curriculumPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  const { title, grade, subject, duration, description, objectives, units, status } = req.body;
  
  data.curriculumPlans[planIndex] = {
    ...data.curriculumPlans[planIndex],
    title: title || data.curriculumPlans[planIndex].title,
    grade: grade || data.curriculumPlans[planIndex].grade,
    subject: subject || data.curriculumPlans[planIndex].subject,
    duration: duration || data.curriculumPlans[planIndex].duration,
    description: description || data.curriculumPlans[planIndex].description,
    objectives: objectives || data.curriculumPlans[planIndex].objectives,
    units: units || data.curriculumPlans[planIndex].units,
    status: status || data.curriculumPlans[planIndex].status,
    updatedAt: new Date().toISOString()
  };
  
  res.json(data.curriculumPlans[planIndex]);
});

// Delete curriculum plan
router.delete('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.curriculumPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  data.curriculumPlans.splice(planIndex, 1);
  res.json({ message: 'Curriculum plan deleted successfully' });
});

// Get curriculum plan statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
  const planId = parseInt(req.params.id);
  const plan = data.curriculumPlans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  const stats = {
    planId: plan.id,
    title: plan.title,
    totalUnits: plan.units.length,
    totalTopics: plan.units.reduce((sum, unit) => sum + (unit.topics?.length || 0), 0),
    totalActivities: plan.units.reduce((sum, unit) => sum + (unit.activities?.length || 0), 0),
    totalAssessments: plan.units.reduce((sum, unit) => sum + (unit.assessments?.length || 0), 0),
    estimatedDuration: plan.duration,
    status: plan.status,
    createdBy: plan.createdBy,
    lastUpdated: plan.updatedAt
  };
  
  res.json(stats);
});

// Add unit to curriculum plan
router.post('/:id/units', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const planIndex = data.curriculumPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  const { title, duration, topics, activities, assessments } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Unit title is required' });
  }
  
  const plan = data.curriculumPlans[planIndex];
  const maxUnitId = Math.max(...(plan.units?.map(u => u.id) || [0]), 0);
  
  const newUnit = {
    id: maxUnitId + 1,
    title,
    duration: duration || '1 week',
    topics: topics || [],
    activities: activities || [],
    assessments: assessments || []
  };
  
  if (!plan.units) {
    plan.units = [];
  }
  
  plan.units.push(newUnit);
  plan.updatedAt = new Date().toISOString();
  
  res.json(newUnit);
});

// Update unit in curriculum plan
router.put('/:id/units/:unitId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const unitId = parseInt(req.params.unitId);
  const planIndex = data.curriculumPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  const plan = data.curriculumPlans[planIndex];
  const unitIndex = plan.units?.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) {
    return res.status(404).json({ error: 'Unit not found' });
  }
  
  const { title, duration, topics, activities, assessments } = req.body;
  
  plan.units[unitIndex] = {
    ...plan.units[unitIndex],
    title: title || plan.units[unitIndex].title,
    duration: duration || plan.units[unitIndex].duration,
    topics: topics || plan.units[unitIndex].topics,
    activities: activities || plan.units[unitIndex].activities,
    assessments: assessments || plan.units[unitIndex].assessments
  };
  
  plan.updatedAt = new Date().toISOString();
  
  res.json(plan.units[unitIndex]);
});

// Delete unit from curriculum plan
router.delete('/:id/units/:unitId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin or teacher access required' });
  }
  
  const planId = parseInt(req.params.id);
  const unitId = parseInt(req.params.unitId);
  const planIndex = data.curriculumPlans.findIndex(p => p.id === planId);
  
  if (planIndex === -1) {
    return res.status(404).json({ error: 'Curriculum plan not found' });
  }
  
  const plan = data.curriculumPlans[planIndex];
  const unitIndex = plan.units?.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) {
    return res.status(404).json({ error: 'Unit not found' });
  }
  
  plan.units.splice(unitIndex, 1);
  plan.updatedAt = new Date().toISOString();
  
  res.json({ message: 'Unit deleted successfully' });
});

module.exports = router;