'use strict';

const router = require('express').Router();
const db     = require('../data/store');
const v      = require('../middleware/validate');

// ─── Helper ───────────────────────────────────────────────────────────────────
const ok  = (res, data, status = 200) => res.status(status).json({ ok: true,  data });
const err = (res, msg,  status = 400) => res.status(status).json({ ok: false, error: msg });

// Apply sanitizer to all routes
router.use(v.sanitizeBody);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard', (_req, res) => {
  ok(res, db.getDashboardSummary());
});

// ─── WORKERS ──────────────────────────────────────────────────────────────────
router.get('/workers', (_req, res) => {
  ok(res, db.getWorkers());
});

router.post('/workers',
  v.required(['name', 'posKey', 'phone', 'joinDate', 'dailyWage']),
  v.validateWorker,
  (req, res) => {
    const { name, posKey, phone, joinDate, dailyWage, statusKey = 'stActive', initials, bg, fg } = req.body;
    const worker = db.addWorker({ name, posKey, phone, joinDate, dailyWage: +dailyWage, statusKey, initials: initials || name.slice(0,2).toUpperCase(), bg: bg||'#e8f5e9', fg: fg||'#2d5016' });
    ok(res, worker, 201);
  }
);

router.put('/workers/:id', v.parseId, v.validateWorker, (req, res) => {
  const updated = db.updateWorker(req.params.id, req.body);
  if (!updated) return err(res, 'Worker not found', 404);
  ok(res, updated);
});

router.delete('/workers/:id', v.parseId, (req, res) => {
  const deleted = db.deleteWorker(req.params.id);
  if (!deleted) return err(res, 'Worker not found', 404);
  ok(res, { deleted: true });
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
router.get('/attendance', (_req, res) => {
  ok(res, db.getAttendance());
});

router.post('/attendance',
  v.required(['name', 'statusKey']),
  (req, res) => {
    const { workerId = 0, name, checkIn = '-', checkOut = '-', totalHours = 0, statusKey, remark = '' } = req.body;
    const rec = db.addAttendance({ workerId: +workerId, name, checkIn, checkOut, totalHours: +totalHours, statusKey, remark });
    ok(res, rec, 201);
  }
);

// ─── TASKS ────────────────────────────────────────────────────────────────────
router.get('/tasks', (_req, res) => {
  const tasks = db.getTasks();
  // group by column
  const grouped = { todo: [], doing: [], done: [] };
  tasks.forEach(t => { if (grouped[t.col]) grouped[t.col].push(t); });
  ok(res, grouped);
});

router.post('/tasks',
  v.required(['titleML', 'assignee', 'priorityKey', 'deadline']),
  (req, res) => {
    const { titleML, assignee, priorityKey, deadline, col = 'todo' } = req.body;
    const validPri = ['prHigh','prMed','prLow'];
    const validCol = ['todo','doing','done'];
    if (!validPri.includes(priorityKey)) return err(res, 'Invalid priority');
    if (!validCol.includes(col))         return err(res, 'Invalid column');
    ok(res, db.addTask({ titleML, assignee, priorityKey, deadline, col }), 201);
  }
);

router.patch('/tasks/:id/move', v.parseId, (req, res) => {
  const { col } = req.body;
  if (!['todo','doing','done'].includes(col)) return err(res, 'Invalid column');
  const task = db.updateTaskCol(req.params.id, col);
  if (!task) return err(res, 'Task not found', 404);
  ok(res, task);
});

router.delete('/tasks/:id', v.parseId, (req, res) => {
  if (!db.deleteTask(req.params.id)) return err(res, 'Task not found', 404);
  ok(res, { deleted: true });
});

// ─── PAYROLL ──────────────────────────────────────────────────────────────────
router.get('/payroll', (_req, res) => {
  ok(res, db.getPayroll());
});

router.patch('/payroll/:id/status', v.parseId, (req, res) => {
  const { statusKey } = req.body;
  if (!['stPaid','stPending'].includes(statusKey)) return err(res, 'Invalid status');
  const rec = db.updatePayrollStatus(req.params.id, statusKey);
  if (!rec) return err(res, 'Record not found', 404);
  ok(res, rec);
});

// ─── HARVESTS ─────────────────────────────────────────────────────────────────
router.get('/harvests', (_req, res) => {
  ok(res, db.getHarvests());
});

router.post('/harvests',
  v.required(['date','crop','field','weightKg','quality','destKey','value']),
  v.validateHarvest,
  (req, res) => {
    const { date, crop, field, weightKg, quality, destKey, value } = req.body;
    ok(res, db.addHarvest({ date, crop, field, weightKg:+weightKg, quality, destKey, value:+value }), 201);
  }
);

// ─── INVENTORY ────────────────────────────────────────────────────────────────
router.get('/inventory', (_req, res) => {
  ok(res, db.getInventory());
});

router.post('/inventory',
  v.required(['name','catKey','stock','unit','minStock']),
  v.validateInventory,
  (req, res) => {
    const { name, catKey, stock, unit, minStock } = req.body;
    ok(res, db.addInventoryItem({ name, catKey, stock:+stock, unit, minStock:+minStock }), 201);
  }
);

router.put('/inventory/:id',
  v.parseId,
  v.validateInventory,
  (req, res) => {
    const updated = db.updateInventoryItem(req.params.id, req.body);
    if (!updated) return err(res, 'Item not found', 404);
    ok(res, updated);
  }
);

// ─── FINANCES ─────────────────────────────────────────────────────────────────
router.get('/finances', (_req, res) => {
  ok(res, db.getFinances());
});

router.post('/finances',
  v.required(['type','catML','amount','date']),
  v.validateFinance,
  (req, res) => {
    const { type, catML, amount, date, icon = '💰' } = req.body;
    ok(res, db.addFinance({ type, catML, amount:+amount, date, icon }), 201);
  }
);

// ─── MISC ────────────────────────────────────────────────────────────────────
router.get('/crops',          (_req, res) => ok(res, db.getCrops()));
router.get('/harvest-chart',  (_req, res) => ok(res, db.getHarvestChart()));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

module.exports = router;
