/* Sri Lanka Business Brain — MVP demo. Vanilla JS + localStorage. All data is fictional. */
'use strict';
const KEY = 'slbb.v1';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LKR = n => 'LKR ' + Math.round(n || 0).toLocaleString('en-US');
const day = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const uid = p => p + Math.random().toString(36).slice(2, 7).toUpperCase();

/* ---------- i18n (small sample set) ---------- */
const NAV = [['dashboard', '▦'], ['inbox', '✉'], ['customers', '☺'], ['products', '▣'], ['orders', '☰'], ['quotations', '✎'], ['invoices', '₨'], ['analytics', '▤'], ['assistant', '✦'], ['settings', '⚙']];
const T = {
  en: { dashboard: 'Dashboard', inbox: 'AI Inbox', customers: 'Customers', products: 'Products', orders: 'Orders', quotations: 'Quotations', invoices: 'Invoices', analytics: 'Analytics', assistant: 'AI Assistant', settings: 'Settings', hi: 'Good day', sales: "Today's sales", insights: 'AI Business Insights' },
  si: { dashboard: 'උපකරණ පුවරුව', inbox: 'AI ඉන්බොක්ස්', customers: 'ගනුදෙනුකරුවන්', products: 'නිෂ්පාදන', orders: 'ඇණවුම්', quotations: 'මිල ගණන්', invoices: 'ඉන්වොයිස්', analytics: 'විශ්ලේෂණ', assistant: 'AI සහායක', settings: 'සැකසුම්', hi: 'ආයුබෝවන්', sales: 'අද විකුණුම්', insights: 'AI ව්‍යාපාර අවබෝධ' },
  ta: { dashboard: 'முகப்பு', inbox: 'AI இன்பாக்ஸ்', customers: 'வாடிக்கையாளர்கள்', products: 'பொருட்கள்', orders: 'ஆர்டர்கள்', quotations: 'விலைப்புள்ளிகள்', invoices: 'விலைப்பட்டியல்', analytics: 'பகுப்பாய்வு', assistant: 'AI உதவியாளர்', settings: 'அமைப்புகள்', hi: 'வணக்கம்', sales: 'இன்றைய விற்பனை', insights: 'AI வணிக நுண்ணறிவு' }
};
const t = k => (T[db.lang] || T.en)[k] || T.en[k] || k;

/* ---------- Seed data ---------- */
function seed() {
  const C = (id, name, phone, email, lang, status, last) => ({ id, name, phone, email, lang, status, last });
  const P = (id, name, sku, price, stock, cat) => ({ id, name, sku, price, stock, cat });
  return {
    biz: 'Lanka Home & Office Supplies', lang: 'en', theme: 'dark', taxPct: 0, nextOrder: 1009, nextInv: 5004,
    customers: [C('c1', 'Kasun Perera', '077 123 4567', 'kasun@example.lk', 'English', 'Active', day(0)), C('c2', 'Nimali Fernando', '071 234 5678', 'nimali@example.lk', 'සිංහල', 'Active', day(1)), C('c3', 'Tharindu Silva', '070 345 6789', 'tharindu@example.lk', 'English', 'Active', day(3)), C('c4', 'Priya Selvarajah', '076 456 7890', 'priya@example.lk', 'தமிழ்', 'Active', day(2)), C('c5', 'Ruwan Jayasuriya', '075 567 8901', 'ruwan@example.lk', 'සිංහල', 'Lead', day(40)), C('c6', 'Fathima Rizna', '072 678 9012', 'rizna@example.lk', 'English', 'Active', day(35)), C('c7', 'Dilshan Wickramasinghe', '078 789 0123', 'dilshan@example.lk', 'English', 'Inactive', day(70)), C('c8', 'Anjali Kumar', '074 890 1234', 'anjali@example.lk', 'தமிழ்', 'Lead', day(0))],
    products: [P('p1', 'Blue Cotton Shirt', 'SHT-BLU-01', 4500, 42, 'Apparel'), P('p2', 'Ergonomic Office Chair', 'CHR-ERG-10', 18500, 14, 'Furniture'), P('p3', 'Standing Desk', 'DSK-STD-02', 45000, 6, 'Furniture'), P('p4', 'A4 Paper (Ream)', 'PAP-A4-05', 1450, 220, 'Stationery'), P('p5', 'Ceylon Tea Gift Box', 'TEA-GFT-03', 3200, 3, 'Gifts'), P('p6', 'Wireless Mouse', 'MOU-WL-07', 2900, 35, 'Electronics'), P('p7', 'LED Desk Lamp', 'LMP-LED-04', 5200, 19, 'Electronics'), P('p8', 'Batik Table Runner', 'BAT-RUN-09', 3800, 12, 'Gifts')],
    orders: [
      { id: 'ORD-1001', cid: 'c1', items: [{ pid: 'p2', name: 'Ergonomic Office Chair', qty: 2, price: 18500 }], pay: 'Paid', status: 'Delivered', date: day(6) },
      { id: 'ORD-1002', cid: 'c2', items: [{ pid: 'p1', name: 'Blue Cotton Shirt', qty: 4, price: 4500 }], pay: 'Paid', status: 'Shipped', date: day(5) },
      { id: 'ORD-1003', cid: 'c3', items: [{ pid: 'p3', name: 'Standing Desk', qty: 1, price: 45000 }], pay: 'Unpaid', status: 'Processing', date: day(4) },
      { id: 'ORD-1004', cid: 'c4', items: [{ pid: 'p5', name: 'Ceylon Tea Gift Box', qty: 6, price: 3200 }], pay: 'Paid', status: 'Confirmed', date: day(3) },
      { id: 'ORD-1005', cid: 'c6', items: [{ pid: 'p4', name: 'A4 Paper (Ream)', qty: 40, price: 1450 }], pay: 'Unpaid', status: 'Delivered', date: day(2) },
      { id: 'ORD-1006', cid: 'c1', items: [{ pid: 'p1', name: 'Blue Cotton Shirt', qty: 10, price: 4500 }, { pid: 'p6', name: 'Wireless Mouse', qty: 3, price: 2900 }], pay: 'Paid', status: 'Confirmed', date: day(1) },
      { id: 'ORD-1007', cid: 'c2', items: [{ pid: 'p1', name: 'Blue Cotton Shirt', qty: 8, price: 4500 }], pay: 'Paid', status: 'Pending', date: day(0) },
      { id: 'ORD-1008', cid: 'c4', items: [{ pid: 'p7', name: 'LED Desk Lamp', qty: 5, price: 5200 }], pay: 'Unpaid', status: 'Pending', date: day(0) }],
    quotes: [{ id: 'QUO-2001', cid: 'c1', items: [{ pid: 'p2', name: 'Ergonomic Office Chair', qty: 10, price: 18500 }], delivery: 3500, discount: 5, status: 'Draft', date: day(0) }],
    invoices: [{ id: 'INV-5001', cid: 'c1', items: [{ name: 'Ergonomic Office Chair', qty: 2, price: 18500 }], delivery: 1500, discount: 0, tax: 0, pay: 'Paid', date: day(6), sent: true }, { id: 'INV-5002', cid: 'c3', items: [{ name: 'Standing Desk', qty: 1, price: 45000 }], delivery: 2500, discount: 0, tax: 0, pay: 'Unpaid', date: day(4), sent: true }, { id: 'INV-5003', cid: 'c6', items: [{ name: 'A4 Paper (Ream)', qty: 40, price: 1450 }], delivery: 0, discount: 2, tax: 0, pay: 'Unpaid', date: day(2), sent: false }],
    convs: [
      { id: 'v1', cid: 'c1', ch: 'WhatsApp', status: 'Open', assignee: 'Unassigned', msgs: [{ f: 'c', t: 'Hi, do you have 10 office chairs in stock? Need a quotation and delivery to Kandy.', at: '09:12' }] },
      { id: 'v2', cid: 'c2', ch: 'Facebook', status: 'Open', assignee: 'Sahan', msgs: [{ f: 'c', t: 'ඇණවුම කවදාද ලැබෙන්නේ? Where is my order?', at: '10:05' }] },
      { id: 'v3', cid: 'c8', ch: 'Instagram', status: 'Open', assignee: 'Unassigned', msgs: [{ f: 'c', t: 'What is the price of the batik table runner? Any discount for 5 pieces?', at: '11:40' }] },
      { id: 'v4', cid: 'c4', ch: 'WhatsApp', status: 'Resolved', assignee: 'Sahan', msgs: [{ f: 'c', t: 'Payment done via bank transfer. Please confirm.', at: 'Yesterday' }, { f: 'me', t: 'Thank you Priya, payment received. Your order is confirmed.', at: 'Yesterday' }] }]
  };
}
let db = load();
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { return seed(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Storage full or blocked — changes will not persist', 'bad'); } }
const cust = id => db.customers.find(c => c.id === id) || { name: 'Unknown' };
const total = (o) => o.items.reduce((s, i) => s + i.qty * i.price, 0);
const grand = o => { const sub = total(o), d = sub * (o.discount || 0) / 100; return sub - d + (sub - d) * (o.tax || 0) / 100 + (+o.delivery || 0); };
const ordTotal = o => total(o);
const stat = s => `<span class="tag ${/Paid|Delivered|Active|Resolved|Shipped/.test(s) ? 'ok' : /Unpaid|Cancelled|Inactive|Pending|Draft/.test(s) ? 'warn' : ''}">${esc(s)}</span>`;

/* ---------- UI helpers ---------- */
function toast(msg, kind, undo) {
  const el = document.createElement('div'); el.className = 'toast ' + (kind || '');
  el.innerHTML = `<span>${kind === 'bad' ? '✕' : '✓'} ${esc(msg)}</span>`;
  if (undo) { const b = document.createElement('button'); b.className = 'sm'; b.textContent = 'Undo'; b.onclick = () => { undo(); el.remove(); }; el.append(b); }
  $('#toasts').append(el); setTimeout(() => el.remove(), undo ? 7000 : 3000);
}
const dlg = $('#dlg');
function openDlg(html) { dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); }
function closeDlg() { if (dlg.open) dlg.close(); }
dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });
function confirmBox(msg, ok) {
  openDlg(`<h2>Please confirm</h2><p>${esc(msg)}</p><div class="acts"><button id="no">Cancel</button><button class="pri" id="yes">Confirm</button></div>`);
  $('#no').onclick = closeDlg; $('#yes').onclick = () => { closeDlg(); ok(); };
}
/* Generic validated form. fields: {k,l,t,opts,req,min} */
function form(title, fields, vals, onOk) {
  vals = vals || {};
  const f = x => x.t === 'select' ? `<select name="${x.k}" id="f_${x.k}">${x.opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(vals[x.k]) === String(v) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>` : `<input id="f_${x.k}" type="${x.t || 'text'}" value="${esc(vals[x.k] ?? '')}" ${x.min != null ? `min="${x.min}"` : ''}>`;
  openDlg(`<form novalidate><h2>${esc(title)}</h2>${fields.map(x => `<label for="f_${x.k}">${esc(x.l)}${x.req ? ' *' : ''}</label>${f(x)}<div class="fe" id="e_${x.k}" aria-live="polite"></div>`).join('')}<div class="acts"><button type="button" id="cx">Cancel</button><button class="pri">Save</button></div></form>`);
  $('#cx').onclick = closeDlg;
  $('form', dlg).onsubmit = e => {
    e.preventDefault(); const out = {}; let ok = true;
    fields.forEach(x => {
      let v = $('#f_' + x.k).value.trim(), err = '';
      if (x.req && !v) err = 'Required';
      else if (x.t === 'number' && v !== '' && (isNaN(v) || (x.min != null && +v < x.min))) err = 'Enter a valid number' + (x.min != null ? ' ≥ ' + x.min : '');
      else if (x.t === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) err = 'Enter a valid email';
      $('#e_' + x.k).textContent = err; if (err) ok = false; out[x.k] = x.t === 'number' ? +v : v;
    });
    if (ok) { closeDlg(); onOk(out); }
  };
  $('#f_' + fields[0].k).focus();
}
function table(cols, rows, empty) {
  if (!rows.length) return `<div class="empty card">${esc(empty || 'Nothing here yet.')}</div>`;
  return `<div class="tw"><table><thead><tr>${cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
/* Delete with undo */
function removeWithUndo(list, id, label) {
  const i = db[list].findIndex(x => x.id === id), item = db[list][i];
  db[list].splice(i, 1); save(); go(cur);
  toast(label + ' deleted', '', () => { db[list].splice(i, 0, item); save(); go(cur); });
}

/* ---------- Routing ---------- */
let cur = 'dashboard', q = '', activeConv = null;
function go(v) {
  cur = v; location.hash = v; buildNav();
  const el = $('#view'); el.innerHTML = '<div class="skel"></div><div class="skel"></div>';
  setTimeout(() => {
    try { el.innerHTML = VIEWS[v](); (BIND[v] || (() => 0))(); }
    catch (e) { el.innerHTML = `<div class="err card"><p>Something went wrong showing this page.</p><button id="rst">Reset demo data</button></div>`; $('#rst').onclick = () => { localStorage.removeItem(KEY); db = seed(); go('dashboard'); }; console.error(e); }
    $('#side').classList.remove('show');
  }, 150);
}
function buildNav() {
  $('#nav').innerHTML = NAV.map(([k, i]) => `<a role="link" tabindex="0" data-v="${k}" ${k === cur ? 'aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${esc(t(k))}</a>`).join('');
  $('#bottomNav').innerHTML = ['dashboard', 'inbox', 'orders', 'assistant', 'settings'].map(k => `<a role="link" tabindex="0" data-v="${k}" ${k === cur ? 'aria-current="page"' : ''}>${NAV.find(n => n[0] === k)[1]}<br>${esc(t(k))}</a>`).join('');
}
document.addEventListener('click', e => { const a = e.target.closest('[data-v]'); if (a) go(a.dataset.v); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('[data-v]')) go(e.target.dataset.v); });

/* ---------- Views ---------- */
const head = (title, addLabel, addId) => `<div class="bar"><h1>${esc(title)}</h1><span class="sp"></span>${addLabel ? `<button class="pri" id="${addId}">+ ${esc(addLabel)}</button>` : ''}</div>`;
const todayStr = day(0);
function insights() {
  const todays = db.orders.filter(o => o.date === todayStr), y = db.orders.filter(o => o.date === day(1));
  const ts = todays.reduce((s, o) => s + ordTotal(o), 0), ys = y.reduce((s, o) => s + ordTotal(o), 0);
  const pct = ys ? Math.round((ts - ys) / ys * 100) : 18, best = bestSellers()[0];
  const fu = db.customers.filter(c => daysSince(c.last) >= 30 && c.status !== 'Inactive').length + db.convs.filter(v => v.status === 'Open').length;
  const low = db.products.filter(p => p.stock <= 5);
  return [`Sales are ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}% compared with yesterday.`, `${fu} customers need follow-up.`, best ? `${best[0]} is the best-selling product (${best[1]} units).` : 'No sales yet.', low.length ? `Low stock: ${low.map(p => p.name).join(', ')}.` : 'Stock levels look healthy.', `${db.invoices.filter(i => i.pay === 'Unpaid').length} invoices are unpaid (${LKR(db.invoices.filter(i => i.pay === 'Unpaid').reduce((s, i) => s + grand(i), 0))}).`];
}
const daysSince = d => Math.floor((Date.now() - new Date(d)) / 864e5);
function bestSellers() { const m = {}; db.orders.filter(o => o.status !== 'Cancelled').forEach(o => o.items.forEach(i => m[i.name] = (m[i.name] || 0) + i.qty)); return Object.entries(m).sort((a, b) => b[1] - a[1]); }

const VIEWS = {
  dashboard() {
    const to = db.orders.filter(o => o.date === todayStr), sales = to.reduce((s, o) => s + ordTotal(o), 0);
    const pend = db.convs.filter(v => v.status === 'Open').length, unpaid = db.orders.filter(o => o.pay === 'Unpaid').reduce((s, o) => s + ordTotal(o), 0);
    const kpi = (l, v) => `<div class="card kpi"><span>${esc(l)}</span><b>${v}</b></div>`;
    return `<h1>${esc(t('hi'))}, Aslim 👋</h1><p style="color:var(--mut)">${esc(db.biz)}</p>
    <div class="grid" style="margin-top:12px">${kpi(t('sales'), LKR(sales))}${kpi('Orders today', to.length)}${kpi('Pending customer replies', pend)}${kpi('Pending payments', LKR(unpaid))}${kpi('New customers', db.customers.filter(c => daysSince(c.last) <= 1 && c.status === 'Lead').length)}</div>
    <div class="two"><section class="card"><h2>✦ ${esc(t('insights'))}</h2>${insights().map(i => `<div class="insight">${esc(i)}</div>`).join('')}</section>
    <section class="card"><h2>Recent customer conversations</h2>${db.convs.slice(0, 4).map(v => `<div class="insight"><a href="#inbox" data-v="inbox" style="color:var(--tx)"><b>${esc(cust(v.cid).name)}</b> · ${esc(v.ch)}</a><br><small style="color:var(--mut)">${esc(v.msgs.at(-1).t)}</small></div>`).join('')}</section></div>
    <h2 style="margin-top:16px">Recent orders</h2>${table(['Order', 'Customer', 'Total', 'Status'], db.orders.slice(-5).reverse().map(o => [esc(o.id), esc(cust(o.cid).name), LKR(ordTotal(o)), stat(o.status)]))}`;
  },
  inbox() {
    const list = db.convs.filter(v => !q || (cust(v.cid).name + v.msgs.map(m => m.t).join()).toLowerCase().includes(q));
    if (!list.length) return head('AI Inbox') + '<div class="empty card">No conversations match.</div>';
    const v = db.convs.find(x => x.id === activeConv) || list[0];
    return head(t('inbox')) + `<div class="inbox" id="ib"><div class="card convs" style="padding:0" role="list">${list.map(c => `<button class="conv" data-c="${c.id}" ${c.id === v.id ? 'aria-current="true"' : ''}><b>${esc(cust(c.cid).name)}</b> ${stat(c.status)}<small>${esc(c.ch)} · ${esc(c.msgs.at(-1).t)}</small></button>`).join('')}</div>
    <div class="card panel" id="pn"><div class="bar" style="margin:0"><button class="back sm" id="bk">← Back</button><b>${esc(cust(v.cid).name)}</b><span class="tag">${esc(v.ch)}</span>${stat(v.status)}<span class="sp"></span><select id="asg" aria-label="Assign conversation" style="width:auto">${['Unassigned', 'Sahan', 'Dilini'].map(a => `<option ${a === v.assignee ? 'selected' : ''}>${a}</option>`).join('')}</select><button id="rs">${v.status === 'Resolved' ? 'Reopen' : 'Mark resolved'}</button></div>
    <div class="msgs">${v.msgs.map(m => `<div class="m ${m.f}"><small>${m.f === 'me' ? 'You' : esc(cust(v.cid).name)} · ${esc(m.at)}</small>${esc(m.t)}</div>`).join('')}</div>
    <div class="ai"><div class="bar" style="margin:0 0 6px"><b>✦ AI suggested response</b><span class="sp"></span><button id="gen" class="sm">Generate AI Reply</button></div><textarea id="rep" rows="4" aria-label="Edit reply">${esc(v.draft || aiReply(v))}</textarea><div class="acts"><button class="pri" id="snd">Send</button></div></div></div></div>`;
  },
  customers() {
    const st = $('#fs')?.value || '';
    const rows = db.customers.filter(c => (!q || (c.name + c.phone + c.email).toLowerCase().includes(q)) && (!window._cf || c.status === window._cf));
    return head(t('customers'), 'Add customer', 'add') + `<div class="bar"><select id="fs" aria-label="Filter by status"><option value="">All statuses</option>${['Active', 'Lead', 'Inactive'].map(s => `<option ${window._cf === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` +
      table(['Name', 'Phone', 'Email', 'Language', 'Orders', 'Spending', 'Last contact', 'Status', ''], rows.map(c => { const os = db.orders.filter(o => o.cid === c.id); return [esc(c.name), esc(c.phone), esc(c.email), esc(c.lang), os.length, LKR(os.reduce((s, o) => s + ordTotal(o), 0)), esc(c.last), stat(c.status), `<button class="sm" data-e="${c.id}">Edit</button> <button class="sm dng" data-d="${c.id}" aria-label="Delete ${esc(c.name)}">Delete</button>`]; }), 'No customers found. Add your first customer.');
  },
  products() {
    const rows = db.products.filter(p => !q || (p.name + p.sku + p.cat).toLowerCase().includes(q));
    return head(t('products'), 'Add product', 'add') + table(['Product', 'SKU', 'Price', 'Stock', 'Category', ''], rows.map(p => [esc(p.name), esc(p.sku), LKR(p.price), p.stock <= 5 ? `<span class="tag bad">${p.stock} low</span>` : p.stock, esc(p.cat), `<button class="sm" data-e="${p.id}">Edit</button> <button class="sm dng" data-d="${p.id}" aria-label="Delete ${esc(p.name)}">Delete</button>`]), 'No products yet.');
  },
  orders() {
    const rows = db.orders.filter(o => !q || (o.id + cust(o.cid).name).toLowerCase().includes(q)).slice().reverse();
    return head(t('orders'), 'New order', 'add') + table(['Order', 'Customer', 'Products', 'Total', 'Payment', 'Status', 'Date', ''], rows.map(o => [esc(o.id), esc(cust(o.cid).name), esc(o.items.map(i => i.qty + '× ' + i.name).join(', ')), LKR(ordTotal(o)), stat(o.pay), `<select data-s="${o.id}" aria-label="Status for ${o.id}" style="width:auto">${['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>`, esc(o.date), `<button class="sm" data-inv="${o.id}">Create invoice</button>`]), 'No orders yet.');
  },
  quotations() {
    return head(t('quotations'), 'New quotation', 'add') + table(['Quote', 'Customer', 'Items', 'Grand total', 'Status', 'Date', ''], db.quotes.filter(x => !q || (x.id + cust(x.cid).name).toLowerCase().includes(q)).map(x => [esc(x.id), esc(cust(x.cid).name), esc(x.items.map(i => i.qty + '× ' + i.name).join(', ')), LKR(grand(x)), stat(x.status), esc(x.date), `<button class="sm" data-qv="${x.id}">View</button> <button class="sm" data-qs="${x.id}">Send</button> <button class="sm" data-qc="${x.id}">Convert to invoice</button>`]), 'No quotations yet. Create one for a customer.');
  },
  invoices() {
    return head(t('invoices'), '', '') + table(['Invoice', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Delivery', 'Total', 'Payment', 'Date', ''], db.invoices.filter(x => !q || (x.id + cust(x.cid).name).toLowerCase().includes(q)).map(x => { const s = total(x), d = s * (x.discount || 0) / 100; return [esc(x.id), esc(cust(x.cid).name), esc(x.items.map(i => i.qty + '× ' + i.name).join(', ')), LKR(s), '−' + LKR(d), LKR((s - d) * (x.tax || 0) / 100), LKR(x.delivery), `<b>${LKR(grand(x))}</b>`, stat(x.pay), esc(x.date), `${x.pay !== 'Paid' ? `<button class="sm" data-pd="${x.id}">Mark paid</button> ` : ''}<button class="sm" data-dl="${x.id}">Download</button> <button class="sm" data-sn="${x.id}">${x.sent ? 'Resend' : 'Send'}</button>`]; }), 'No invoices yet. Create one from an order or quotation.');
  },
  analytics() {
    const days = [...Array(7)].map((_, i) => day(6 - i)), vals = days.map(d => db.orders.filter(o => o.date === d).reduce((s, o) => s + ordTotal(o), 0)), cnt = days.map(d => db.orders.filter(o => o.date === d).length), mx = Math.max(...vals, 1);
    const bs = bestSellers().slice(0, 5), bm = bs[0]?.[1] || 1, paid = db.orders.filter(o => o.pay === 'Paid').length, un = db.orders.length - paid;
    const bars = a => `<div class="bars" style="margin-bottom:22px">${a.map((v, i) => `<div style="height:${Math.max(2, v / Math.max(...a, 1) * 100)}%" title="${days[i]}: ${v}"><span>${days[i].slice(8)}</span></div>`).join('')}</div>`;
    return `<h1>${esc(t('analytics'))}</h1><div class="two"><section class="card"><h2>Daily sales (7 days) — peak ${LKR(mx)}</h2>${bars(vals)}</section><section class="card"><h2>Orders per day</h2>${bars(cnt)}</section>
    <section class="card"><h2>Best-selling products</h2>${bs.map(([n, c]) => `<div class="hb">${esc(n)} — ${c}<i style="width:${c / bm * 100}%"></i></div>`).join('')}</section>
    <section class="card"><h2>Customer growth</h2><div class="grid"><div class="kpi"><span>Total</span><b>${db.customers.length}</b></div><div class="kpi"><span>Active</span><b>${db.customers.filter(c => c.status === 'Active').length}</b></div><div class="kpi"><span>Leads</span><b>${db.customers.filter(c => c.status === 'Lead').length}</b></div></div></section>
    <section class="card"><h2>Payment status</h2><div class="stack" role="img" aria-label="${paid} paid, ${un} unpaid"><div style="width:${paid / db.orders.length * 100}%;background:var(--ok)"></div><div style="flex:1;background:var(--warn)"></div></div><p style="margin-top:8px">✔ Paid: ${paid} · ⚠ Unpaid: ${un}</p></section></div>`;
  },
  assistant() {
    const log = db.chat || [{ f: 'ai', t: 'Ayubowan! I am Business Brain. Ask me about sales, customers, invoices or quotations.' }];
    return `<div class="chat"><h1>✦ Business Brain</h1><div class="chips">${['What happened in my business today?', 'Who should I follow up with?', 'What are my best-selling products?', 'Show unpaid invoices.', 'Create a quotation for Kasun for 10 office chairs.', "Which customers haven't ordered in 30 days?"].map(p => `<button class="sm" data-p="${esc(p)}">${esc(p)}</button>`).join('')}</div><div class="card msgs" id="log">${log.map(m => `<div class="m ${m.f === 'u' ? 'me' : ''}">${m.t}</div>`).join('')}</div><form id="cf"><input id="ci" aria-label="Ask Business Brain" placeholder="Ask anything about your business…" autocomplete="off"><button class="pri">Ask</button></form></div>`;
  },
  settings() {
    return `<h1>${esc(t('settings'))}</h1><div class="card" style="max-width:480px"><label for="sb">Business name</label><input id="sb" value="${esc(db.biz)}"><label for="stx" style="margin-top:8px">Invoice tax (%)</label><input id="stx" type="number" min="0" value="${db.taxPct}"><div class="acts"><button class="pri" id="ss">Save settings</button></div></div><div class="card" style="max-width:480px;margin-top:12px"><h2>Demo data</h2><p style="color:var(--mut)">All records are fictional and stored only in this browser.</p><div class="acts"><button class="dng" id="rd">Reset demo data</button></div></div>`;
  }
};

/* AI mock reply: picks a template from keywords in the latest customer message */
function aiReply(v) {
  const m = v.msgs.filter(x => x.f === 'c').at(-1)?.t.toLowerCase() || '', n = cust(v.cid).name.split(' ')[0];
  if (/chair|quot|stock/.test(m)) return `Hi ${n}, thank you for contacting us! Yes, we have Ergonomic Office Chairs in stock at LKR 18,500 each. For 10 units we can offer a 5% discount, with delivery quoted separately. Shall I prepare a formal quotation for you?`;
  if (/order|where|ඇණවුම/.test(m)) return `Hi ${n}, thanks for your patience. Your order is on its way and should reach you within 1–2 working days. I'll share the tracking details shortly.`;
  if (/price|discount|batik/.test(m)) return `Hi ${n}, the Batik Table Runner is LKR 3,800 each. For 5 pieces we can offer 5% off — LKR 18,050 in total. Would you like me to confirm the order?`;
  if (/pay|bank|transfer/.test(m)) return `Hi ${n}, we have received your payment — thank you! Your order is confirmed and will be processed today.`;
  return `Hi ${n}, thank you for your message. How can we help you today?`;
}
function convFromDom() { return db.convs.find(x => x.id === (activeConv || $('.conv')?.dataset.c)); }

const BIND = {
  inbox() {
    const v = convFromDom(); if (!v) return;
    document.querySelectorAll('.conv').forEach(b => b.onclick = () => { activeConv = b.dataset.c; go('inbox'); setTimeout(() => $('#ib')?.classList.add('open'), 200); });
    $('#bk').onclick = () => $('#ib').classList.remove('open');
    $('#rep').oninput = e => v.draft = e.target.value;
    $('#gen').onclick = () => { const b = $('#gen'); b.textContent = 'Thinking…'; setTimeout(() => { v.draft = aiReply(v); $('#rep').value = v.draft; b.textContent = 'Generate AI Reply'; toast('AI reply generated'); }, 600); };
    $('#asg').onchange = e => { v.assignee = e.target.value; save(); toast('Assigned to ' + v.assignee); };
    $('#rs').onclick = () => { v.status = v.status === 'Resolved' ? 'Open' : 'Resolved'; save(); go('inbox'); toast('Conversation ' + v.status.toLowerCase()); };
    $('#snd').onclick = () => { const txt = $('#rep').value.trim(); if (!txt) return toast('Write a reply first', 'bad'); v.msgs.push({ f: 'me', t: txt, at: new Date().toTimeString().slice(0, 5) }); v.draft = ''; v.status = 'Resolved'; save(); go('inbox'); toast('Reply sent via ' + v.ch); };
  },
  customers() {
    $('#add').onclick = () => custForm(); $('#fs').onchange = e => { window._cf = e.target.value; go('customers'); };
    rowActs('customers', custForm, 'Customer');
  },
  products() { $('#add').onclick = () => prodForm(); rowActs('products', prodForm, 'Product'); },
  orders() {
    $('#add').onclick = orderForm;
    document.querySelectorAll('[data-s]').forEach(s => s.onchange = () => { db.orders.find(o => o.id === s.dataset.s).status = s.value; save(); toast('Order marked ' + s.value); });
    document.querySelectorAll('[data-inv]').forEach(b => b.onclick = () => { const o = db.orders.find(x => x.id === b.dataset.inv); makeInvoice(o, o.cid, 0, 0, o.pay); go('invoices'); });
  },
  quotations() {
    $('#add').onclick = quoteForm;
    document.querySelectorAll('[data-qv]').forEach(b => b.onclick = () => { const x = db.quotes.find(y => y.id === b.dataset.qv), s = total(x), d = s * x.discount / 100; openDlg(`<h2>${esc(x.id)} — ${esc(cust(x.cid).name)}</h2>${table(['Item', 'Qty', 'Unit', 'Line'], x.items.map(i => [esc(i.name), i.qty, LKR(i.price), LKR(i.qty * i.price)]))}<p>Subtotal: ${LKR(s)}<br>Discount (${x.discount}%): −${LKR(d)}<br>Delivery: ${LKR(x.delivery)}<br><b>Grand total: ${LKR(grand(x))}</b></p><div class="acts"><button class="pri" id="cl">Close</button></div>`); $('#cl').onclick = closeDlg; });
    document.querySelectorAll('[data-qs]').forEach(b => b.onclick = () => { const x = db.quotes.find(y => y.id === b.dataset.qs); x.status = 'Sent'; save(); go('quotations'); toast('Quotation sent to ' + cust(x.cid).name); });
    document.querySelectorAll('[data-qc]').forEach(b => b.onclick = () => { const x = db.quotes.find(y => y.id === b.dataset.qc); makeInvoice(x, x.cid, x.delivery, x.discount, 'Unpaid'); x.status = 'Converted'; save(); go('invoices'); });
  },
  invoices() {
    document.querySelectorAll('[data-pd]').forEach(b => b.onclick = () => { db.invoices.find(x => x.id === b.dataset.pd).pay = 'Paid'; save(); go('invoices'); toast('Invoice marked as paid'); });
    document.querySelectorAll('[data-sn]').forEach(b => b.onclick = () => { const x = db.invoices.find(y => y.id === b.dataset.sn); x.sent = true; save(); go('invoices'); toast('Invoice sent to ' + cust(x.cid).name); });
    document.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => downloadInv(db.invoices.find(y => y.id === b.dataset.dl)));
  },
  assistant() {
    const ask = txt => { if (!txt.trim()) return; db.chat = db.chat || VIEWS.assistant && [{ f: 'ai', t: 'Ayubowan! I am Business Brain. Ask me about sales, customers, invoices or quotations.' }]; db.chat.push({ f: 'u', t: esc(txt) }); db.chat.push({ f: 'ai', t: assist(txt) }); save(); go('assistant'); setTimeout(() => { const l = $('#log'); if (l) l.scrollTop = 1e6; $('#ci')?.focus(); }, 200); };
    $('#cf').onsubmit = e => { e.preventDefault(); ask($('#ci').value); };
    document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => ask(b.dataset.p));
    $('#log').scrollTop = 1e6;
  },
  settings() {
    $('#ss').onclick = () => { const n = $('#sb').value.trim(); if (!n) return toast('Business name is required', 'bad'); db.biz = n; db.taxPct = +$('#stx').value || 0; save(); $('#bizName').textContent = n; toast('Settings saved'); };
    $('#rd').onclick = () => confirmBox('Reset all data to the original demo?', () => { db = seed(); save(); init(); toast('Demo data restored'); });
  }
};

/* ---------- Forms & actions ---------- */
function rowActs(list, formFn, label) {
  document.querySelectorAll('[data-e]').forEach(b => b.onclick = () => formFn(db[list].find(x => x.id === b.dataset.e)));
  document.querySelectorAll('[data-d]').forEach(b => b.onclick = () => confirmBox('Delete this ' + label.toLowerCase() + '?', () => removeWithUndo(list, b.dataset.d, label)));
}
function custForm(c) {
  form(c ? 'Edit customer' : 'Add customer', [{ k: 'name', l: 'Name', req: 1 }, { k: 'phone', l: 'Phone', req: 1 }, { k: 'email', l: 'Email', t: 'email' }, { k: 'lang', l: 'Language', t: 'select', opts: ['English', 'සිංහල', 'தமிழ்'] }, { k: 'status', l: 'Status', t: 'select', opts: ['Active', 'Lead', 'Inactive'] }], c, v => {
    if (c) Object.assign(c, v); else db.customers.push({ id: uid('c'), last: todayStr, ...v }); save(); go('customers'); toast(c ? 'Customer updated' : 'Customer added');
  });
}
function prodForm(p) {
  form(p ? 'Edit product' : 'Add product', [{ k: 'name', l: 'Product name', req: 1 }, { k: 'sku', l: 'SKU', req: 1 }, { k: 'price', l: 'Price (LKR)', t: 'number', req: 1, min: 1 }, { k: 'stock', l: 'Stock', t: 'number', req: 1, min: 0 }, { k: 'cat', l: 'Category', req: 1 }], p, v => {
    if (p) Object.assign(p, v); else db.products.push({ id: uid('p'), ...v }); save(); go('products'); toast(p ? 'Product updated' : 'Product added');
  });
}
const custOpts = () => db.customers.map(c => [c.id, c.name]), prodOpts = () => db.products.map(p => [p.id, p.name + ' — ' + LKR(p.price)]);
function orderForm() {
  if (!db.products.length || !db.customers.length) return toast('Add a customer and a product first', 'bad');
  form('New order', [{ k: 'cid', l: 'Customer', t: 'select', opts: custOpts() }, { k: 'pid', l: 'Product', t: 'select', opts: prodOpts() }, { k: 'qty', l: 'Quantity', t: 'number', req: 1, min: 1 }, { k: 'pay', l: 'Payment', t: 'select', opts: ['Unpaid', 'Paid'] }], { qty: 1 }, v => {
    const p = db.products.find(x => x.id === v.pid); db.orders.push({ id: 'ORD-' + db.nextOrder++, cid: v.cid, items: [{ pid: p.id, name: p.name, qty: v.qty, price: p.price }], pay: v.pay, status: 'Pending', date: todayStr });
    p.stock = Math.max(0, p.stock - v.qty); save(); go('orders'); toast('Order created');
  });
}
function quoteForm(pre) {
  if (!db.products.length || !db.customers.length) return toast('Add a customer and a product first', 'bad');
  pre = pre || {};
  form('New quotation', [{ k: 'cid', l: 'Customer', t: 'select', opts: custOpts() }, { k: 'pid', l: 'Product', t: 'select', opts: prodOpts() }, { k: 'qty', l: 'Quantity', t: 'number', req: 1, min: 1 }, { k: 'price', l: 'Unit price (LKR) — leave 0 to use list price', t: 'number', min: 0 }, { k: 'delivery', l: 'Delivery fee (LKR)', t: 'number', min: 0 }, { k: 'discount', l: 'Discount (%)', t: 'number', min: 0 }], { qty: 1, price: 0, delivery: 0, discount: 0, ...pre }, v => {
    const p = db.products.find(x => x.id === v.pid);
    db.quotes.push({ id: 'QUO-' + (2001 + db.quotes.length), cid: v.cid, items: [{ pid: p.id, name: p.name, qty: v.qty, price: v.price || p.price }], delivery: v.delivery, discount: Math.min(v.discount, 100), status: 'Draft', date: todayStr });
    save(); go('quotations'); toast('Quotation generated');
  });
}
function makeInvoice(src, cid, delivery, discount, pay) {
  db.invoices.push({ id: 'INV-' + db.nextInv++, cid, items: src.items.map(i => ({ name: i.name, qty: i.qty, price: i.price })), delivery, discount, tax: db.taxPct, pay, date: todayStr, sent: false });
  save(); toast('Invoice created');
}
function downloadInv(x) {
  const s = total(x), d = s * (x.discount || 0) / 100;
  const txt = `${db.biz}\nINVOICE ${x.id}   Date: ${x.date}\nCustomer: ${cust(x.cid).name}\n\n${x.items.map(i => `${i.qty} x ${i.name} @ ${LKR(i.price)} = ${LKR(i.qty * i.price)}`).join('\n')}\n\nSubtotal: ${LKR(s)}\nDiscount: -${LKR(d)}\nTax: ${LKR((s - d) * (x.tax || 0) / 100)}\nDelivery: ${LKR(x.delivery)}\nTOTAL: ${LKR(grand(x))}\nStatus: ${x.pay}\n`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = x.id + '.txt'; a.click(); URL.revokeObjectURL(a.href); toast('Invoice downloaded');
}

/* ---------- Business Brain: answers from real stored data ---------- */
function assist(raw) {
  const s = raw.toLowerCase();
  if (/quotation|quote/.test(s) && /create|make/.test(s)) {
    const c = db.customers.find(c => s.includes(c.name.split(' ')[0].toLowerCase())), p = db.products.find(p => s.split(/\W+/).some(w => w.length > 3 && p.name.toLowerCase().includes(w.replace(/s$/, '')) && !/quotation|create|office/.test(w))) || db.products.find(p => /chair/.test(s) && /Chair/.test(p.name)), n = +(s.match(/\d+/) || [1])[0];
    if (!c || !p) return 'I could not match the customer or product. Try: "Create a quotation for Kasun for 10 office chairs."';
    db.quotes.push({ id: 'QUO-' + (2001 + db.quotes.length), cid: c.id, items: [{ pid: p.id, name: p.name, qty: n, price: p.price }], delivery: 3500, discount: n >= 10 ? 5 : 0, status: 'Draft', date: todayStr });
    const q = db.quotes.at(-1); return `Done. Draft <b>${q.id}</b> for ${esc(c.name)}: ${n} × ${esc(p.name)}, ${q.discount}% discount, delivery LKR 3,500. Grand total <b>${LKR(grand(q))}</b>. Review it in Quotations.`;
  }
  if (/unpaid|payment|owe/.test(s)) { const u = db.invoices.filter(i => i.pay === 'Unpaid'); return u.length ? `${u.length} unpaid invoices totalling <b>${LKR(u.reduce((a, i) => a + grand(i), 0))}</b>:<br>${u.map(i => `• ${i.id} — ${esc(cust(i.cid).name)} — ${LKR(grand(i))}`).join('<br>')}` : 'All invoices are paid. 🎉'; }
  if (/30 days|haven't ordered|not ordered|inactive/.test(s)) { const l = db.customers.filter(c => !db.orders.some(o => o.cid === c.id && daysSince(o.date) < 30)); return l.length ? `${l.length} customers have not ordered in 30 days:<br>${l.map(c => '• ' + esc(c.name) + ' (' + esc(c.lang) + ')').join('<br>')}<br>Suggestion: send a friendly WhatsApp offer.` : 'Every customer has ordered recently.'; }
  if (/follow/.test(s)) { const o = db.convs.filter(v => v.status === 'Open'); return `Follow up with:<br>${o.map(v => `• ${esc(cust(v.cid).name)} on ${v.ch} — waiting for a reply`).join('<br>') || 'No open conversations.'}<br>${db.orders.filter(x => x.pay === 'Unpaid').map(x => `• ${esc(cust(x.cid).name)} — ${x.id} unpaid`).join('<br>')}`; }
  if (/best|top|sell/.test(s)) return 'Best-selling products:<br>' + bestSellers().slice(0, 5).map(([n, c], i) => `${i + 1}. ${esc(n)} — ${c} units`).join('<br>');
  if (/today|happen|summary/.test(s)) { const to = db.orders.filter(o => o.date === todayStr); return `Today: <b>${to.length}</b> orders worth <b>${LKR(to.reduce((a, o) => a + ordTotal(o), 0))}</b>, ${db.convs.filter(v => v.status === 'Open').length} open conversations.<br>` + insights().map(i => '• ' + esc(i)).join('<br>'); }
  return 'I can help with sales, follow-ups, unpaid invoices, best sellers, inactive customers and quotations. Try one of the suggested prompts.';
}

/* ---------- Global wiring ---------- */
function init() {
  document.documentElement.dataset.theme = db.theme; $('#bizName').textContent = db.biz; $('#lang').value = db.lang;
  $('#notifN').textContent = db.convs.filter(v => v.status === 'Open').length;
  go(location.hash.slice(1) in VIEWS ? location.hash.slice(1) : 'dashboard');
}
$('#themeBtn').onclick = () => { db.theme = db.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = db.theme; save(); };
$('#lang').onchange = e => { db.lang = e.target.value; save(); go(cur); };
$('#menuBtn').onclick = () => { const s = $('#side'); innerWidth > 900 ? s.classList.toggle('hide') : s.classList.toggle('show'); };
$('#notifBtn').onclick = () => toast(`${db.convs.filter(v => v.status === 'Open').length} conversations need a reply`);
$('#profBtn').onclick = () => toast('Signed in as Aslim (demo owner)');
$('#search').oninput = e => { q = e.target.value.toLowerCase(); clearTimeout(window._st); window._st = setTimeout(() => { if (['dashboard', 'assistant', 'settings', 'analytics'].includes(cur)) cur = 'customers'; go(cur); setTimeout(() => $('#search').focus(), 200); }, 250); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') return closeDlg();
  if (e.target.matches('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === '/') { e.preventDefault(); $('#search').focus(); }
  else if (k === 'd') go('dashboard'); else if (k === 'i') go('inbox'); else if (k === 'a') go('assistant');
  else if (k === 'n') { const b = $('#add'); b ? b.click() : toast('Nothing to add on this page'); }
});
init();
