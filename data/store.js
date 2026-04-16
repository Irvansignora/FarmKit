'use strict';

/**
 * In-memory data store.
 * Easy to swap to a real DB (PostgreSQL / MongoDB / SQLite)
 * by replacing the CRUD functions below.
 */

let store = {
  workers: [
    { id:1, name:'Andi Saputra',   posKey:'posSupervisor', phone:'0812-3456-7890', joinDate:'2024-01-15', dailyWage:3200, statusKey:'stActive',  initials:'AS', bg:'#e8f5e9', fg:'#2d5016' },
    { id:2, name:'Budi Santoso',   posKey:'posGeneral',    phone:'0812-3456-7891', joinDate:'2024-02-01', dailyWage:2500, statusKey:'stActive',  initials:'BS', bg:'#e3f2fd', fg:'#1a56db' },
    { id:3, name:'Citra Dewi',     posKey:'posGeneral',    phone:'0812-3456-7892', joinDate:'2024-02-15', dailyWage:2500, statusKey:'stActive',  initials:'CD', bg:'#fce4ec', fg:'#c62828' },
    { id:4, name:'Dedi Prasetyo',  posKey:'posMachine',    phone:'0812-3456-7893', joinDate:'2024-03-01', dailyWage:3000, statusKey:'stActive',  initials:'DP', bg:'#fff8e1', fg:'#b8860b' },
    { id:5, name:'Eka Putri',      posKey:'posGeneral',    phone:'0812-3456-7894', joinDate:'2024-03-10', dailyWage:2500, statusKey:'stActive',  initials:'EP', bg:'#f3e5f5', fg:'#6a1b9a' },
    { id:6, name:'Fajar Nugroho',  posKey:'posWarehouse',  phone:'0812-3456-7895', joinDate:'2024-04-01', dailyWage:2800, statusKey:'stActive',  initials:'FN', bg:'#e8f5e9', fg:'#2d5016' },
    { id:7, name:'Gita Rahma',     posKey:'posGeneral',    phone:'0812-3456-7896', joinDate:'2024-04-15', dailyWage:2500, statusKey:'stLeave',   initials:'GR', bg:'#e0f7fa', fg:'#006064' },
    { id:8, name:'Hendra Wijaya',  posKey:'posDriver',     phone:'0812-3456-7897', joinDate:'2024-05-01', dailyWage:2600, statusKey:'stActive',  initials:'HW', bg:'#fff8e1', fg:'#b8860b' },
  ],

  attendance: [
    { id:1, workerId:1, name:'Andi Saputra',  checkIn:'07:00', checkOut:'16:00', totalHours:9,    statusKey:'stPresent',  remark:'-' },
    { id:2, workerId:2, name:'Budi Santoso',  checkIn:'07:15', checkOut:'16:00', totalHours:8.75, statusKey:'stPresent',  remark:'-' },
    { id:3, workerId:3, name:'Citra Dewi',    checkIn:'-',     checkOut:'-',     totalHours:0,    statusKey:'stSick',     remark:'Demam' },
    { id:4, workerId:4, name:'Dedi Prasetyo', checkIn:'07:00', checkOut:'17:30', totalHours:10.5, statusKey:'stOvertime', remark:'Traktor #2' },
    { id:5, workerId:5, name:'Eka Putri',     checkIn:'07:00', checkOut:'16:00', totalHours:9,    statusKey:'stPresent',  remark:'-' },
    { id:6, workerId:6, name:'Fajar Nugroho', checkIn:'07:00', checkOut:'16:00', totalHours:9,    statusKey:'stPresent',  remark:'-' },
    { id:7, workerId:7, name:'Gita Rahma',    checkIn:'-',     checkOut:'-',     totalHours:0,    statusKey:'stPermission', remark:'Keperluan keluarga' },
    { id:8, workerId:8, name:'Hendra Wijaya', checkIn:'06:30', checkOut:'15:30', totalHours:9,    statusKey:'stPresent',  remark:'' },
  ],

  tasks: [
    { id:1, col:'todo',  titleML:'id:Pemupukan Lahan C blok 2|en:Fertilize Field C block 2|ja:農地Cブロック2の施肥',           assignee:'Budi Santoso',  priorityKey:'prHigh', deadline:'5 Jun' },
    { id:2, col:'todo',  titleML:'id:Cek sistem irigasi blok 3|en:Check irrigation system block 3|ja:灌漑システムブロック3点検', assignee:'Andi Saputra',  priorityKey:'prMed',  deadline:'6 Jun' },
    { id:3, col:'todo',  titleML:'id:Sortir bibit tomat F2|en:Sort tomato F2 seeds|ja:トマトF2種子の選別',                      assignee:'Citra Dewi',    priorityKey:'prLow',  deadline:'8 Jun' },
    { id:4, col:'todo',  titleML:'id:Bersihkan gudang alat barat|en:Clean west tool warehouse|ja:西部農具倉庫の清掃',            assignee:'Fajar Nugroho', priorityKey:'prLow',  deadline:'10 Jun' },
    { id:5, col:'doing', titleML:'id:Penyiraman Lahan A & B pagi|en:Irrigate Fields A & B morning|ja:農地A・B朝の灌漑',         assignee:'Tim Pagi',      priorityKey:'prHigh', deadline:'2 Jun' },
    { id:6, col:'doing', titleML:'id:Perbaikan traktor unit #2|en:Repair tractor unit #2|ja:トラクター#2修理',                   assignee:'Dedi Prasetyo', priorityKey:'prHigh', deadline:'3 Jun' },
    { id:7, col:'doing', titleML:'id:Panen tomat blok 2 Lahan B|en:Harvest tomatoes block 2 Field B|ja:農地Bブロック2トマト収穫', assignee:'Eka Putri',     priorityKey:'prMed',  deadline:'2 Jun' },
    { id:8, col:'doing', titleML:'id:Pengangkutan hasil panen ke gudang|en:Transport harvest to warehouse|ja:収穫物の倉庫への搬送', assignee:'Hendra Wijaya', priorityKey:'prMed', deadline:'2 Jun' },
    { id:9, col:'doing', titleML:'id:Update log monitoring harian|en:Update daily monitoring log|ja:日次モニタリングログ更新',   assignee:'Andi Saputra',  priorityKey:'prLow',  deadline:'2 Jun' },
    { id:10, col:'done', titleML:'id:Pemasangan jaring pelindung L.A|en:Install protective net Field A|ja:農地A防護ネット設置',  assignee:'Tim A',         priorityKey:'prHigh', deadline:'30 Mei' },
    { id:11, col:'done', titleML:'id:Pemeriksaan hama mingguan|en:Weekly pest inspection|ja:週次害虫点検',                       assignee:'Andi Saputra',  priorityKey:'prHigh', deadline:'1 Jun' },
    { id:12, col:'done', titleML:'id:Pengiriman kubis ke koperasi|en:Deliver cabbage to cooperative|ja:農協へのキャベツ出荷',    assignee:'Hendra Wijaya', priorityKey:'prMed',  deadline:'1 Jun' },
  ],

  payroll: [
    { id:1, name:'Andi Saputra',  workDays:22, overtime:5,  base:70400, overtimePay:4000, total:74400, statusKey:'stPaid' },
    { id:2, name:'Budi Santoso',  workDays:20, overtime:0,  base:50000, overtimePay:0,    total:50000, statusKey:'stPaid' },
    { id:3, name:'Citra Dewi',    workDays:18, overtime:2,  base:45000, overtimePay:1600, total:46600, statusKey:'stPending' },
    { id:4, name:'Dedi Prasetyo', workDays:22, overtime:12, base:66000, overtimePay:9600, total:75600, statusKey:'stPaid' },
    { id:5, name:'Eka Putri',     workDays:20, overtime:0,  base:50000, overtimePay:0,    total:50000, statusKey:'stPending' },
    { id:6, name:'Fajar Nugroho', workDays:21, overtime:3,  base:58800, overtimePay:2400, total:61200, statusKey:'stPending' },
    { id:7, name:'Hendra Wijaya', workDays:22, overtime:6,  base:57200, overtimePay:4800, total:62000, statusKey:'stPaid' },
  ],

  harvests: [
    { id:1, date:'02 Jun', crop:'🍅 Tomat',  field:'Lahan B', weightKg:142, quality:'Grade A', destKey:'destExport', value:18460 },
    { id:2, date:'01 Jun', crop:'🥬 Kubis',  field:'Lahan A', weightKg:98,  quality:'Grade B', destKey:'destLocal',  value:9800  },
    { id:3, date:'31 Mei', crop:'🌾 Padi',   field:'Lahan C', weightKg:320, quality:'Grade A', destKey:'destCoop',   value:38400 },
    { id:4, date:'30 Mei', crop:'🍅 Tomat',  field:'Lahan B', weightKg:115, quality:'Grade A', destKey:'destExport', value:14950 },
    { id:5, date:'29 Mei', crop:'🥕 Wortel', field:'Lahan A', weightKg:87,  quality:'Grade B', destKey:'destLocal',  value:7830  },
    { id:6, date:'28 Mei', crop:'🥬 Kubis',  field:'Lahan A', weightKg:76,  quality:'Grade A', destKey:'destExport', value:9880  },
    { id:7, date:'27 Mei', crop:'🌾 Padi',   field:'Lahan C', weightKg:280, quality:'Grade A', destKey:'destCoop',   value:33600 },
  ],

  inventory: [
    { id:1,  name:'NPK 15-15-15',          catKey:'catFertilizer', stock:120, unit:'kg',     minStock:50,  statusKey:'stSafe'  },
    { id:2,  name:'Urea 46%',              catKey:'catFertilizer', stock:35,  unit:'kg',     minStock:40,  statusKey:'stLow'   },
    { id:3,  name:'Pupuk Organik Kompos',  catKey:'catFertilizer', stock:200, unit:'kg',     minStock:80,  statusKey:'stSafe'  },
    { id:4,  name:'Pestisida Cair (Decis)',catKey:'catPesticide',  stock:8,   unit:'liter',  minStock:10,  statusKey:'stLow'   },
    { id:5,  name:'Fungisida Mancozeb',    catKey:'catPesticide',  stock:15,  unit:'kg',     minStock:10,  statusKey:'stSafe'  },
    { id:6,  name:'Bibit Tomat F1',        catKey:'catSeed',       stock:500, unit:'butir',  minStock:200, statusKey:'stSafe'  },
    { id:7,  name:'Bibit Kubis Hybrida',   catKey:'catSeed',       stock:0,   unit:'butir',  minStock:100, statusKey:'stEmpty' },
    { id:8,  name:'Solar / BBM',           catKey:'catFuel',       stock:45,  unit:'liter',  minStock:20,  statusKey:'stSafe'  },
    { id:9,  name:'Cangkul Besi',          catKey:'catTool',       stock:12,  unit:'unit',   minStock:5,   statusKey:'stSafe'  },
    { id:10, name:'Selang Irigasi 2"',     catKey:'catTool',       stock:0,   unit:'roll',   minStock:2,   statusKey:'stEmpty' },
    { id:11, name:'Sarung Tangan Karet',   catKey:'catTool',       stock:18,  unit:'pasang', minStock:10,  statusKey:'stSafe'  },
    { id:12, name:'Karung Goni 50kg',      catKey:'catTool',       stock:3,   unit:'unit',   minStock:20,  statusKey:'stLow'   },
  ],

  finances: [
    { id:1, type:'income',  catML:'id:Penjualan Tomat — Ekspor|en:Tomato Sales — Export|ja:トマト販売 — 輸出',           amount:120000, date:'1 Jun',  icon:'🍅' },
    { id:2, type:'expense', catML:'id:Gaji Pekerja — Pembayaran 1|en:Worker Wages — Payment 1|ja:作業員給与 — 支払1',    amount:74400,  date:'30 Mei', icon:'💴' },
    { id:3, type:'income',  catML:'id:Penjualan Kubis — Koperasi|en:Cabbage Sales — Cooperative|ja:キャベツ販売 — 農協', amount:48000,  date:'28 Mei', icon:'🥬' },
    { id:4, type:'expense', catML:'id:Pupuk NPK & Pestisida|en:NPK Fertilizer & Pesticides|ja:NPK肥料・農薬',            amount:32000,  date:'27 Mei', icon:'🌿' },
    { id:5, type:'expense', catML:'id:Perbaikan Traktor #2|en:Tractor #2 Repair|ja:トラクター#2修理',                    amount:15000,  date:'26 Mei', icon:'🔧' },
    { id:6, type:'income',  catML:'id:Penjualan Padi — Koperasi|en:Rice Sales — Cooperative|ja:稲販売 — 農協',           amount:96000,  date:'25 Mei', icon:'🌾' },
    { id:7, type:'expense', catML:'id:BBM & Transportasi|en:Fuel & Transportation|ja:燃料・輸送',                        amount:8500,   date:'24 Mei', icon:'⛽' },
    { id:8, type:'income',  catML:'id:Penjualan Wortel — Pasar|en:Carrot Sales — Market|ja:人参販売 — 市場',             amount:22000,  date:'23 Mei', icon:'🥕' },
  ],

  crops: [
    { id:1, icon:'🌾', nameKey:'cropRice',    field:'Lahan C', plantDate:'15 Apr', harvestDate:'15 Jul', progress:55, stateKey:'cropGrowing' },
    { id:2, icon:'🍅', nameKey:'cropTomato',  field:'Lahan B', plantDate:'1 Mei',  harvestDate:'30 Jun', progress:80, stateKey:'cropPartial' },
    { id:3, icon:'🥬', nameKey:'cropCabbage', field:'Lahan A', plantDate:'10 Mei', harvestDate:'10 Jul', progress:65, stateKey:'cropGrowing' },
    { id:4, icon:'🥕', nameKey:'cropCarrot',  field:'Lahan A', plantDate:'20 Mei', harvestDate:'20 Agu', progress:30, stateKey:'cropEarly'   },
  ],

  harvestChart: [
    { dayKey:'daySen', value:95  },
    { dayKey:'daySel', value:128 },
    { dayKey:'dayRab', value:115 },
    { dayKey:'dayKam', value:142 },
    { dayKey:'dayJum', value:88  },
    { dayKey:'daySab', value:162 },
    { dayKey:'dayMin', value:110 },
  ],
};

// Auto-increment helper
let nextId = {};
function genId(collection) {
  if (!nextId[collection]) {
    nextId[collection] = Math.max(0, ...store[collection].map(r => r.id)) + 1;
  }
  return nextId[collection]++;
}

// Recalculate inventory status based on stock vs minStock
function calcInvStatus(item) {
  if (item.stock <= 0)              return 'stEmpty';
  if (item.stock <= item.minStock)  return 'stLow';
  return 'stSafe';
}

// ─── CRUD Exports ─────────────────────────────────────────────────────────────
module.exports = {
  // ── WORKERS ──────────────────────────────────────────────────────────────
  getWorkers: () => store.workers,

  addWorker: (data) => {
    const worker = { id: genId('workers'), ...data };
    store.workers.push(worker);
    return worker;
  },

  updateWorker: (id, data) => {
    const idx = store.workers.findIndex(w => w.id === id);
    if (idx === -1) return null;
    store.workers[idx] = { ...store.workers[idx], ...data, id };
    return store.workers[idx];
  },

  deleteWorker: (id) => {
    const idx = store.workers.findIndex(w => w.id === id);
    if (idx === -1) return false;
    store.workers.splice(idx, 1);
    return true;
  },

  // ── ATTENDANCE ───────────────────────────────────────────────────────────
  getAttendance: () => store.attendance,

  addAttendance: (data) => {
    const rec = { id: genId('attendance'), ...data };
    store.attendance.push(rec);
    return rec;
  },

  // ── TASKS ────────────────────────────────────────────────────────────────
  getTasks: () => store.tasks,

  addTask: (data) => {
    const task = { id: genId('tasks'), ...data };
    store.tasks.push(task);
    return task;
  },

  updateTaskCol: (id, col) => {
    const task = store.tasks.find(t => t.id === id);
    if (!task) return null;
    task.col = col;
    return task;
  },

  deleteTask: (id) => {
    const idx = store.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    store.tasks.splice(idx, 1);
    return true;
  },

  // ── PAYROLL ──────────────────────────────────────────────────────────────
  getPayroll: () => store.payroll,

  updatePayrollStatus: (id, statusKey) => {
    const rec = store.payroll.find(p => p.id === id);
    if (!rec) return null;
    rec.statusKey = statusKey;
    return rec;
  },

  // ── HARVESTS ─────────────────────────────────────────────────────────────
  getHarvests: () => store.harvests,

  addHarvest: (data) => {
    const rec = { id: genId('harvests'), ...data };
    store.harvests.unshift(rec);
    return rec;
  },

  // ── INVENTORY ────────────────────────────────────────────────────────────
  getInventory: () => store.inventory,

  addInventoryItem: (data) => {
    const item = { id: genId('inventory'), ...data };
    item.statusKey = calcInvStatus(item);
    store.inventory.push(item);
    return item;
  },

  updateInventoryItem: (id, data) => {
    const idx = store.inventory.findIndex(i => i.id === id);
    if (idx === -1) return null;
    store.inventory[idx] = { ...store.inventory[idx], ...data, id };
    store.inventory[idx].statusKey = calcInvStatus(store.inventory[idx]);
    return store.inventory[idx];
  },

  // ── FINANCES ─────────────────────────────────────────────────────────────
  getFinances: () => store.finances,

  addFinance: (data) => {
    const rec = { id: genId('finances'), ...data };
    store.finances.unshift(rec);
    return rec;
  },

  // ── MISC ─────────────────────────────────────────────────────────────────
  getCrops:        () => store.crops,
  getHarvestChart: () => store.harvestChart,

  // ── DASHBOARD SUMMARY ────────────────────────────────────────────────────
  getDashboardSummary: () => {
    const present  = store.attendance.filter(a => a.statusKey === 'stPresent' || a.statusKey === 'stOvertime').length;
    const weekHarvest = store.harvestChart.reduce((s, d) => s + d.value, 0);
    const pending  = store.tasks.filter(t => t.col !== 'done').length;
    const revenue  = store.finances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
    const lowItems = store.inventory.filter(i => i.statusKey === 'stLow' || i.statusKey === 'stEmpty');
    return { present, weekHarvest, pending, revenue, lowItems };
  },
};
