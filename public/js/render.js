/* public/js/render.js — FarmKit rendering */
'use strict';

const Render = (() => {
  // ── Badge helpers ────────────────────────────────────────────────────────────
  const stCls = { stActive:'bg', stLeave:'bo', stPresent:'bg', stAbsent:'br',
    stSick:'br', stPermission:'bo', stOvertime:'bb',
    stSafe:'bg', stLow:'bo', stEmpty:'br', stPaid:'bg', stPending:'bo' };

  const badge = (key, extra = '') =>
    `<span class="badge ${stCls[key] || 'bgy'} ${extra}">${I18n.t(key)}</span>`;

  const prCls = { prHigh:'br', prMed:'bo', prLow:'bgy' };
  const prBadge = (key) =>
    `<span class="badge ${prCls[key] || 'bgy'}">${I18n.t(key)}</span>`;

  const qCls = { 'Grade A':'bg', 'Grade B':'bo', 'Grade C':'bgy' };
  const qBadge = (q) =>
    `<span class="badge ${qCls[q] || 'bgy'}">${q}</span>`;

  const el = (id) => document.getElementById(id);

  // ── Workers ──────────────────────────────────────────────────────────────────
  const rWorkers = (workers) => {
    if (!workers) return;
    el('wrkTotalVal').textContent  = workers.length;
    el('wrkActiveVal').textContent = workers.filter(w => w.statusKey === 'stActive').length;
    el('wrkLeaveVal').textContent  = workers.filter(w => w.statusKey !== 'stActive').length;
    const total = workers.reduce((s, w) => s + (w.dailyWage || 0) * 22, 0);
    el('wrkSalaryVal').textContent = `¥${Math.round(total/1000)}K`;

    el('tWorker').innerHTML = workers.map(w => `
      <tr>
        <td><div class="avname">
          <div class="av" style="background:${w.bg||'#e8f5e9'};color:${w.fg||'#2d5016'}">${w.initials||w.name.slice(0,2).toUpperCase()}</div>
          <strong>${w.name}</strong>
        </div></td>
        <td>${I18n.t(w.posKey)}</td>
        <td style="color:var(--t2)">${w.phone}</td>
        <td style="color:var(--t2)">${w.joinDate}</td>
        <td>¥${(w.dailyWage||0).toLocaleString()}</td>
        <td>${badge(w.statusKey)}</td>
        <td style="display:flex;gap:5px">
          <button class="btn btns btnsm" onclick="App.toast(I18n.t('toastSaved'))">${I18n.t('btnEdit')}</button>
          <button class="btn btns btnsm" style="color:#c0392b" onclick="App.deleteWorker(${w.id})">${I18n.t('btnDelete')}</button>
        </td>
      </tr>`).join('');
  };

  // ── Attendance ───────────────────────────────────────────────────────────────
  const rAttendance = (records) => {
    if (!records) return;
    const present  = records.filter(r => r.statusKey === 'stPresent' || r.statusKey === 'stOvertime').length;
    const absent   = records.filter(r => r.statusKey === 'stAbsent').length;
    const sickOff  = records.filter(r => r.statusKey === 'stSick' || r.statusKey === 'stPermission').length;
    const hours    = records.reduce((s, r) => s + (r.totalHours || 0), 0);
    el('attPresentVal').textContent = present;
    el('attAbsentVal').textContent  = absent;
    el('attSickVal').textContent    = sickOff;
    el('attHoursVal').innerHTML     = `${hours}<span style="font-size:13px;color:var(--t3);font-weight:400"> ${I18n.t('hrs')}</span>`;

    el('tAbsen').innerHTML = records.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.checkIn}</td><td>${r.checkOut}</td>
        <td>${r.totalHours > 0 ? r.totalHours + ' ' + I18n.t('hrs') : '-'}</td>
        <td>${badge(r.statusKey)}</td>
        <td style="color:var(--t3)">${r.remark || '-'}</td>
      </tr>`).join('');
  };

  // ── Tasks (Kanban) ───────────────────────────────────────────────────────────
  const rTasks = (grouped) => {
    if (!grouped) return;
    const fw = el('filterWorker')?.value || '';
    const fp = el('filterPriority')?.value || '';

    ['todo','doing','done'].forEach(col => {
      let tasks = grouped[col] || [];
      if (fw) tasks = tasks.filter(t => t.assignee.includes(fw));
      if (fp) tasks = tasks.filter(t => t.priorityKey === fp);

      el('k'+col).innerHTML = tasks.map(tk => `
        <div class="kcard">
          <div class="kctit">${I18n.tl(tk.titleML)}</div>
          <div style="font-size:11px;color:var(--t3);margin-bottom:7px">👤 ${tk.assignee}</div>
          <div class="kcmeta">${prBadge(tk.priorityKey)}<span>📅 ${tk.deadline}</span></div>
        </div>`).join('');

      const cnt = { todo:'cntTodo', doing:'cntDoing', done:'cntDone' };
      el(cnt[col]).textContent = tasks.length;
    });

    // Populate worker filter dropdown
    const fw_el = el('filterWorker');
    if (fw_el && fw_el.options.length <= 1) {
      const all = [...new Set(Object.values(grouped).flat().map(t => t.assignee))];
      all.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name;
        fw_el.appendChild(o);
      });
    }
  };

  // ── Payroll ──────────────────────────────────────────────────────────────────
  const rPayroll = (records) => {
    if (!records) return;
    const total   = records.reduce((s, r) => s + r.total, 0);
    const paid    = records.filter(r => r.statusKey === 'stPaid').reduce((s, r) => s + r.total, 0);
    const unpaid  = total - paid;
    el('payTotalVal').textContent  = `¥${Math.round(total/1000)}K`;
    el('payPaidVal').textContent   = `¥${Math.round(paid/1000)}K`;
    el('payUnpaidVal').textContent = `¥${Math.round(unpaid/1000)}K`;
    el('payActiveVal').textContent = records.length;

    const lang = I18n.getLang();
    el('tGaji').innerHTML = records.map(g => `
      <tr>
        <td><strong>${g.name}</strong></td>
        <td>${g.workDays} ${lang==='ja'?'日':lang==='en'?'days':'hari'}</td>
        <td>${g.overtime} ${I18n.t('hrs')}</td>
        <td>¥${g.base.toLocaleString()}</td>
        <td>¥${g.overtimePay.toLocaleString()}</td>
        <td><strong>¥${g.total.toLocaleString()}</strong></td>
        <td>${badge(g.statusKey)}</td>
        <td>
          <button class="btn btnsm ${g.statusKey==='stPending'?'btnp':'btns'}"
            onclick="App.markPaid(${g.id})">
            ${g.statusKey==='stPending' ? I18n.t('btnProcessPayroll') : '✓'}
          </button>
        </td>
      </tr>`).join('');
  };

  // ── Harvests ─────────────────────────────────────────────────────────────────
  const rHarvests = (records) => {
    if (!records) return;
    const today = records[0]?.weightKg || 0;
    const week  = records.slice(0,7).reduce((s, r) => s + r.weightKg, 0);
    const month = records.reduce((s, r) => s + r.weightKg, 0);
    const value = records.reduce((s, r) => s + r.value, 0);
    el('hvTodayVal').innerHTML  = `${today}<span style="font-size:13px;font-weight:400;color:var(--t3)"> kg</span>`;
    el('hvWeekVal').innerHTML   = `${week}<span style="font-size:13px;font-weight:400;color:var(--t3)"> kg</span>`;
    el('hvMonthVal').innerHTML  = `${(month/1000).toFixed(1)}<span style="font-size:13px;font-weight:400;color:var(--t3)"> ton</span>`;
    el('hvValueVal').textContent = `¥${Math.round(value/1000)}K`;

    el('tHarvest').innerHTML = records.map(h => `
      <tr>
        <td>${h.date}</td>
        <td><strong>${h.crop}</strong></td>
        <td>${h.field}</td>
        <td><strong>${h.weightKg}</strong></td>
        <td>${qBadge(h.quality)}</td>
        <td>${I18n.t(h.destKey)}</td>
        <td>¥${h.value.toLocaleString()}</td>
      </tr>`).join('');
  };

  // ── Inventory ────────────────────────────────────────────────────────────────
  const rInventory = (items) => {
    if (!items) return;
    el('invTotalVal').textContent = items.length;
    el('invSafeVal').textContent  = items.filter(i => i.statusKey === 'stSafe').length;
    el('invLowVal').textContent   = items.filter(i => i.statusKey === 'stLow').length;
    el('invEmptyVal').textContent = items.filter(i => i.statusKey === 'stEmpty').length;

    el('tInv').innerHTML = items.map(i => `
      <tr>
        <td><strong>${i.name}</strong></td>
        <td>${badge(i.catKey, 'bgy')}</td>
        <td><strong>${i.stock}</strong></td>
        <td>${i.unit}</td>
        <td>${i.minStock}</td>
        <td>${badge(i.statusKey)}</td>
        <td style="color:var(--t3)">2 Jun 2025</td>
      </tr>`).join('');
  };

  // ── Finances ─────────────────────────────────────────────────────────────────
  const rFinances = (records) => {
    if (!records) return;
    const revenue = records.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
    const expense = records.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
    const profit  = revenue - expense;
    const margin  = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    el('finRevenueVal').textContent = `¥${Math.round(revenue/1000)}K`;
    el('finExpenseVal').textContent = `¥${Math.round(expense/1000)}K`;
    el('finProfitVal').textContent  = `¥${Math.round(profit/1000)}K`;
    el('finMarginVal').textContent  = `${margin}%`;

    el('finList').innerHTML = records.map(f => `
      <div class="frow">
        <div class="fico" style="background:${f.type==='income'?'#e8f5e9':'#fde8e8'}">${f.icon}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600">${I18n.tl(f.catML)}</div>
          <div style="font-size:11px;color:var(--t3)">${f.date}</div>
        </div>
        <div class="famt ${f.type==='income'?'inc':'exp'}">${f.type==='income'?'+':'-'}¥${f.amount.toLocaleString()}</div>
      </div>`).join('');

    const cats = [
      { k:'expCatWage', pct:55, col:'var(--g600)' },
      { k:'expCatFert', pct:22, col:'var(--au500)' },
      { k:'expCatMachine', pct:13, col:'#e67e22' },
      { k:'expCatOther', pct:10, col:'var(--cr500)' },
    ];
    el('expBreak').innerHTML = cats.map(e => `
      <div style="margin-bottom:11px">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px">
          <span>${I18n.t(e.k)}</span><span style="font-weight:700">${e.pct}%</span>
        </div>
        <div class="pb"><div class="pf" style="width:${e.pct}%;background:${e.col}"></div></div>
      </div>`).join('');
  };

  // ── Harvest Chart ────────────────────────────────────────────────────────────
  const rHarvestChart = (data) => {
    if (!data) return;
    const max = Math.max(...data.map(d => d.value));
    el('harvestChart').innerHTML = data.map(d => `
      <div class="bgroup">
        <div class="bval">${d.value}</div>
        <div class="bar" style="height:${Math.round(d.value/max*90)}px"></div>
        <div class="blabel">${I18n.t(d.dayKey)}</div>
      </div>`).join('');
  };

  // ── Calendar ─────────────────────────────────────────────────────────────────
  const rCalendar = (crops) => {
    const evts = [2,5,10,15,20,25,28];
    let html = '';
    for (let d=1; d<=30; d++) {
      const isT = d===2, hasE = evts.includes(d);
      html += `<div class="cday ${isT?'today':''} ${hasE&&!isT?'evt':''}">${d}</div>`;
    }
    el('calGrid').innerHTML = html;

    if (crops) {
      el('cropSched').innerHTML = crops.map(c => `
        <div class="cropcard">
          <div class="cropico">${c.icon}</div>
          <div style="flex:1">
            <div class="cropname">${I18n.t(c.nameKey)} · ${c.field}</div>
            <div class="cropinfo">${I18n.t('calPlant')}: ${c.plantDate} → ${I18n.t('calHarvest')}: ${c.harvestDate}</div>
            <div class="pb"><div class="pf" style="width:${c.progress}%"></div></div>
            <div style="font-size:10px;color:var(--t3);margin-top:3px">${c.progress}% · ${I18n.t(c.stateKey)}</div>
          </div>
        </div>`).join('');
    }
  };

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const rDashboard = (summary, crops, inventory, harvestChart) => {
    if (summary) {
      el('dashPresent').textContent  = summary.present;
      el('dashHarvest').innerHTML    = `${summary.weekHarvest}<span style="font-size:14px;color:var(--t3);font-weight:400"> kg</span>`;
      el('dashPending').textContent  = summary.pending;
      el('dashRevenue').textContent  = `¥${Math.round(summary.revenue/1000)}K`;
    }

    if (crops) {
      el('dashCrops').innerHTML = crops.map(c => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bdr)">
          <span style="font-size:13px">${c.icon} ${I18n.t(c.nameKey)} · ${c.field}</span>
          <span style="font-size:11px;color:var(--t3)">${I18n.t('calHarvest')} ${c.harvestDate}</span>
        </div>`).join('');
    }

    if (inventory) {
      el('dashInv').innerHTML = inventory.slice(0,8).map(i => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--bdr)">
          <div>
            <div style="font-size:13px;font-weight:600">${i.name}</div>
            <div style="font-size:11px;color:var(--t3)">${i.stock} ${i.unit}</div>
          </div>
          <span class="badge ${stCls[i.statusKey]||'bgy'}">${I18n.t(i.statusKey)}</span>
        </div>`).join('');
    }

    if (harvestChart) rHarvestChart(harvestChart);

    const acts = [
      { ico:'🍅', tk:'actHarvest', agoK:'actAgo1' },
      { ico:'🔧', tk:'actRepair',  agoK:'actAgo2' },
      { ico:'⚠️', tk:'actStock',   agoK:'actAgo3' },
      { ico:'✅', tk:'actTask',    agoK:'actAgo4' },
      { ico:'💴', tk:'actSale',    agoK:'actAgo5' },
    ];
    el('recentAct').innerHTML = acts.map(a => `
      <div style="display:flex;gap:9px;padding:9px 0;border-bottom:1px solid var(--bdr)">
        <span style="font-size:15px">${a.ico}</span>
        <div style="flex:1">
          <div style="font-size:12.5px">${I18n.t(a.tk)}</div>
          <div style="font-size:10.5px;color:var(--t3);margin-top:1px">${I18n.t(a.agoK)}</div>
        </div>
      </div>`).join('');
  };

  // ── Performance Chart ────────────────────────────────────────────────────────
  const rPerfChart = () => {
    const data = [
      {m:'Jan',inc:380,exp:260},{m:'Feb',inc:320,exp:240},{m:'Mar',inc:420,exp:280},
      {m:'Apr',inc:460,exp:300},{m:'Mei',inc:440,exp:290},{m:'Jun',inc:480,exp:312}
    ];
    const mx = 500;
    el('perfChart').innerHTML = `
      <div style="display:flex;gap:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:5px;font-size:11px"><div style="width:10px;height:10px;border-radius:2px;background:var(--g400)"></div>${I18n.t('rptIncome')}</div>
        <div style="display:flex;align-items:center;gap:5px;font-size:11px"><div style="width:10px;height:10px;border-radius:2px;background:#ef9a9a"></div>${I18n.t('rptExpense')}</div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:10px;height:130px">
        ${data.map(d=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;justify-content:flex-end">
            <div style="width:100%;display:flex;gap:3px;justify-content:center;align-items:flex-end">
              <div style="flex:1;height:${Math.round(d.inc/mx*118)}px;background:var(--g400);border-radius:3px 3px 0 0"></div>
              <div style="flex:1;height:${Math.round(d.exp/mx*118)}px;background:#ef9a9a;border-radius:3px 3px 0 0"></div>
            </div>
            <div style="font-size:10px;color:var(--t3)">${d.m}</div>
          </div>`).join('')}
      </div>`;
  };

  // ── Reports ──────────────────────────────────────────────────────────────────
  const rReports = () => {
    const rpts = [
      { k:'rptMonthlyFin', s:'June 2025' },
      { k:'rptHarvest',    s:'June 2025' },
      { k:'rptPayroll',    s:'June 2025' },
      { k:'rptInventory',  s:'June 2025' },
      { k:'rptFieldPerf',  s:'Q2 2025'   },
      { k:'rptAnnual',     s:'2025'       },
    ];
    el('reportList').innerHTML = rpts.map(r => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 12px;border:1px solid var(--bdr);border-radius:8px">
        <div>
          <div style="font-size:13px;font-weight:600">📄 ${I18n.t(r.k)}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:2px">${r.s}</div>
        </div>
        <button class="btn btns btnsm" onclick="App.toast(I18n.t('toastPDF'))">${I18n.t('btnDownloadPDF')}</button>
      </div>`).join('');
  };

  return {
    rWorkers, rAttendance, rTasks, rPayroll, rHarvests,
    rInventory, rFinances, rHarvestChart, rCalendar,
    rDashboard, rPerfChart, rReports,
  };
})();
