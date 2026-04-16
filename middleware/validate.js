'use strict';

/**
 * Simple, dependency-free input validators.
 * Returns 422 if validation fails, otherwise calls next().
 */

function required(fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => {
      const v = req.body[f];
      return v === undefined || v === null || v === '';
    });
    if (missing.length) {
      return res.status(422).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

function sanitizeString(str, max = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max)
    .replace(/[<>]/g, ''); // strip basic XSS vectors
}

function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
}

function validateWorker(req, res, next) {
  const { name, posKey, phone, joinDate, dailyWage } = req.body;
  if (!name || name.length < 2)         return res.status(422).json({ error: 'Name too short (min 2 chars)' });
  if (!phone || !/^[\d\-+\s]{6,20}$/.test(phone)) return res.status(422).json({ error: 'Invalid phone number' });
  if (!joinDate || isNaN(Date.parse(joinDate)))    return res.status(422).json({ error: 'Invalid join date' });
  if (isNaN(+dailyWage) || +dailyWage < 0)        return res.status(422).json({ error: 'Daily wage must be >= 0' });
  const validPos = ['posGeneral','posSupervisor','posMachine','posWarehouse','posDriver'];
  if (!validPos.includes(posKey)) return res.status(422).json({ error: 'Invalid position key' });
  next();
}

function validateHarvest(req, res, next) {
  const { weightKg, value } = req.body;
  if (isNaN(+weightKg) || +weightKg <= 0) return res.status(422).json({ error: 'Weight must be > 0' });
  if (isNaN(+value)    || +value < 0)     return res.status(422).json({ error: 'Value must be >= 0' });
  next();
}

function validateInventory(req, res, next) {
  const { stock, minStock } = req.body;
  if (isNaN(+stock)    || +stock < 0)    return res.status(422).json({ error: 'Stock must be >= 0' });
  if (isNaN(+minStock) || +minStock < 0) return res.status(422).json({ error: 'Min stock must be >= 0' });
  next();
}

function validateFinance(req, res, next) {
  const { amount, type } = req.body;
  if (!['income','expense'].includes(type)) return res.status(422).json({ error: 'type must be income or expense' });
  if (isNaN(+amount) || +amount <= 0)       return res.status(422).json({ error: 'Amount must be > 0' });
  next();
}

function parseId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  req.params.id = id;
  next();
}

module.exports = {
  required,
  sanitizeBody,
  validateWorker,
  validateHarvest,
  validateInventory,
  validateFinance,
  parseId,
};
