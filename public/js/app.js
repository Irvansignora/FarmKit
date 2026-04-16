/* public/js/app.js — FarmKit app controller */
'use strict';

const App = (() => {
  // ── State ────────────────────────────────────────────────────────────────────
  const state = {
    workers: [], attendance: [], tasks: {}, payroll: [],
    harvests: [], inventory: [], finances: [], crops: [],
    harvestChart: [], dashboard: {},
  };

  // ── API client ───────────────────────────────────────────────────────────────
  const api = async (path, opts = {}) => {
    try {
      const res = await fetch('/api' + path, {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      return json.data;
    } catch (err) {
      toast(I18n.t('toastError') + ': ' + err.message);
      return null;
    }
  };

  // ── Load helpers ─────────────────────────────────────────────────────────────
  const load = {
    workers:      async () => { state.workers      = await api('/workers')      || state.workers;      Render.rWorkers(state.workers); },
    attendance:   async () => { state.attendance   = await api('/attendance')   || state.attendance;   Render.rAttendance(state.attendance); },
    tasks:        async () => { state.tasks        = await api('/tasks')        || state.tasks;        Render.rTasks(state.tasks); },
    payroll:      async () => { state.payroll      = await api('/payroll')      || state.payroll;      Render.rPayroll(state.payroll); },
    harvests:     async () => { state.harvests     = await api('/harvests')     || state.harvests;     Render.rHarvests(state.harvests); },
    inventory:    async () => { state.inventory    = await api('/inventory')    || state.inventory;    Render.rInventory(state.inventory); },
    finances:     async () => { state.finances     = await api('/finances')     || state.finances;     Render.rFinances(state.finances); },
    crops:        async () => { state.crops        = await api('/crops')        || state.crops;        },
    harvestChart: async () => { state.harvestChart = await api('/harvest-chart')|| state.harvestChart; },
    dashboard:    async () => {
      state.dashboard    = await api('/dashboard')     || state.dashboard;
      state.crops        = await api('/crops')         || state.crops;
      state.inventory    = await api('/inventory')     || state.inventory;
      state.harvestChart = await api('/harvest-chart') || state.harvestChart;
      Render.rDashboard(state.dashboard, state.crops, state.inventory, state.harvestChart);
    },
  };

  // ── Nav ──────────────────────────────────────────────────────────────────────
  const pgMap = {
    dashboard:'pgDashboard', cuaca:'pgWeather', pekerja:'pgWorkers',
    absensi:'pgAttendance', tugas:'pgTasks', gaji:'pgPayroll',
    panen:'pgHarvest', kalender:'pgCalendar', inventaris:'pgInventory',
    keuangan:'pgFinance', laporan:'pgReports',
  };
  const mMap = {
    pekerja:'mWorker', absensi:'mAbsen', tugas:'mTask',
    panen:'mHarvest', inventaris:'mInv', keuangan:'mFin',
  };
  const loaderMap = {
    dashboard: () => load.dashboard(),
    pekerja:   () => load.workers(),
    absensi:   () => load.attendance(),
    tugas:     () => load.tasks(),
    gaji:      () => load.payroll(),
    panen:     () => load.harvests(),
    kalender:  () => Promise.all([load.crops()]).then(() => Render.rCalendar(state.crops)),
    inventaris:() => load.inventory(),
    keuangan:  () => load.finances(),
    laporan:   () => { Render.rPerfChart(); Render.rReports(); },
  };

  const go = (page, btn) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    btn.classList.add('active');
    document.getElementById('ptitle').textContent = I18n.t(pgMap[page]) || page;
    if (loaderMap[page]) loaderMap[page]();
  };

  const topBtn = () => {
    const ap = document.querySelector('.page.active').id.replace('page-', '');
    if (mMap[ap]) sm(mMap[ap]);
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const sm = (id) => { document.getElementById(id).style.display = 'flex'; };
  const hm = (id, e) => {
    if (!e || e.target === document.getElementById(id))
      document.getElementById(id).style.display = 'none';
  };

  // ── Toast ────────────────────────────────────────────────────────────────────
  const toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2800);
  };

  // ── Date ─────────────────────────────────────────────────────────────────────
  const updateDate = () => {
    const now    = new Date();
    const days   = I18n.t('days');
    const months = I18n.t('months');
    if (Array.isArray(days) && Array.isArray(months)) {
      document.getElementById('curDate').textContent =
        `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
  };

  // ── Language ─────────────────────────────────────────────────────────────────
  const setLang = (lang) => {
    I18n.setLang(lang);
    // Re-render current page title
    const ap = document.querySelector('.page.active');
    if (ap) {
      const pid = ap.id.replace('page-', '');
      document.getElementById('ptitle').textContent = I18n.t(pgMap[pid]) || pid;
    }
    // Re-render all dynamic content
    Render.rWorkers(state.workers);
    Render.rAttendance(state.attendance);
    Render.rTasks(state.tasks);
    Render.rPayroll(state.payroll);
    Render.rHarvests(state.harvests);
    Render.rInventory(state.inventory);
    Render.rFinances(state.finances);
    Render.rDashboard(state.dashboard, state.crops, state.inventory, state.harvestChart);
    Render.rCalendar(state.crops);
    Render.rPerfChart();
    Render.rReports();
    updateDate();
  };

  // ── Save actions (POST to API) ────────────────────────────────────────────────
  const saveWorker = async () => {
    const body = {
      name:      document.getElementById('wName').value,
      posKey:    document.getElementById('wPos').value,
      phone:     document.getElementById('wPhone').value,
      joinDate:  document.getElementById('wJoin').value,
      dailyWage: document.getElementById('wWage').value,
      statusKey: document.getElementById('wStatus').value,
    };
    if (!body.name || !body.phone || !body.joinDate || !body.dailyWage) {
      return toast('⚠️ Lengkapi semua field');
    }
    const result = await api('/workers', { method:'POST', body });
    if (result) {
      hm('mWorker');
      toast(I18n.t('toastSaved'));
      load.workers();
    }
  };

  const saveAttendance = async () => {
    const workerEl = document.getElementById('aWorker');
    const body = {
      name:       workerEl.value,
      checkIn:    document.getElementById('aIn').value,
      checkOut:   document.getElementById('aOut').value,
      statusKey:  document.getElementById('aStatus').value,
      remark:     document.getElementById('aRemark').value,
      totalHours: 9,
    };
    const result = await api('/attendance', { method:'POST', body });
    if (result) { hm('mAbsen'); toast(I18n.t('toastSaved')); load.attendance(); }
  };

  const saveTask = async () => {
    const title = document.getElementById('tkTitle').value;
    if (!title) return toast('⚠️ Judul tugas harus diisi');
    const body = {
      titleML:     `id:${title}|en:${title}|ja:${title}`,
      assignee:    document.getElementById('tkAssignee').value,
      priorityKey: document.getElementById('tkPriority').value,
      deadline:    document.getElementById('tkDeadline').value || '-',
      col:         'todo',
    };
    const result = await api('/tasks', { method:'POST', body });
    if (result) { hm('mTask'); toast(I18n.t('toastSaved')); load.tasks(); }
  };

  const saveHarvest = async () => {
    const price  = +document.getElementById('hPrice').value;
    const weight = +document.getElementById('hWeight').value;
    const body = {
      date:     document.getElementById('hDate').value,
      crop:     document.getElementById('hCrop').value,
      field:    document.getElementById('hField').value,
      weightKg: weight,
      quality:  document.getElementById('hQuality').value,
      destKey:  document.getElementById('hDest').value,
      value:    price * weight,
    };
    if (!body.date || !body.weightKg) return toast('⚠️ Lengkapi data panen');
    const result = await api('/harvests', { method:'POST', body });
    if (result) { hm('mHarvest'); toast(I18n.t('toastSaved')); load.harvests(); }
  };

  const saveInventory = async () => {
    const body = {
      name:     document.getElementById('invName').value,
      catKey:   document.getElementById('invCat').value,
      stock:    document.getElementById('invStock').value,
      unit:     document.getElementById('invUnit').value,
      minStock: document.getElementById('invMin').value,
    };
    if (!body.name || !body.unit) return toast('⚠️ Lengkapi data stok');
    const result = await api('/inventory', { method:'POST', body });
    if (result) { hm('mInv'); toast(I18n.t('toastSaved')); load.inventory(); }
  };

  const saveFinance = async () => {
    const body = {
      type:   document.getElementById('finType').value,
      catML:  `id:${document.getElementById('finCat').value}|en:${document.getElementById('finCat').value}|ja:${document.getElementById('finCat').value}`,
      amount: document.getElementById('finAmt').value,
      date:   document.getElementById('finDate').value,
      icon:   document.getElementById('finType').value === 'income' ? '💰' : '💸',
    };
    if (!body.amount || !body.date) return toast('⚠️ Lengkapi data transaksi');
    const result = await api('/finances', { method:'POST', body });
    if (result) { hm('mFin'); toast(I18n.t('toastSaved')); load.finances(); }
  };

  // ── Payroll quick-pay ─────────────────────────────────────────────────────────
  const markPaid = async (id) => {
    const result = await api(`/payroll/${id}/status`, { method:'PATCH', body:{ statusKey:'stPaid' } });
    if (result) { toast(I18n.t('toastProcessed')); load.payroll(); }
  };

  const processPayroll = async () => {
    // Mark all pending as paid
    const pending = state.payroll.filter(p => p.statusKey === 'stPending');
    await Promise.all(pending.map(p => api(`/payroll/${p.id}/status`, { method:'PATCH', body:{ statusKey:'stPaid' } })));
    toast(I18n.t('toastProcessed'));
    load.payroll();
  };

  // ── Delete worker ─────────────────────────────────────────────────────────────
  const deleteWorker = async (id) => {
    if (!confirm('Hapus pekerja ini?')) return;
    const result = await api(`/workers/${id}`, { method:'DELETE' });
    if (result) { toast('🗑️ Pekerja dihapus'); load.workers(); }
  };

  // ── Populate worker selects ───────────────────────────────────────────────────
  const populateWorkerSelects = (workers) => {
    ['aWorker','tkAssignee'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = workers.map(w => `<option value="${w.name}">${w.name}</option>`).join('');
    });
  };

  // ── Init ──────────────────────────────────────────────────────────────────────
  const init = async () => {
    updateDate();
    // Load all data
    await Promise.all([
      load.dashboard(),
      load.workers().then(() => populateWorkerSelects(state.workers)),
      load.attendance(),
      load.tasks(),
      load.payroll(),
      load.harvests(),
      load.inventory(),
      load.finances(),
    ]);
    Render.rPerfChart();
    Render.rReports();
  };

  document.addEventListener('DOMContentLoaded', init);

  return {
    go, topBtn, sm, hm, toast, setLang,
    saveWorker, saveAttendance, saveTask, saveHarvest, saveInventory, saveFinance,
    markPaid, processPayroll, deleteWorker,
  };
})();
