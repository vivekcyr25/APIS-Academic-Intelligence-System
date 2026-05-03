(function () {
    const firebaseConfig = {
        apiKey: "REDACTED_FIREBASE_KEY",
        authDomain: "gen-lang-client-0107179257.firebaseapp.com",
        projectId: "gen-lang-client-0107179257",
        storageBucket: "gen-lang-client-0107179257.firebasestorage.app",
        messagingSenderId: "913521921132",
        appId: "1:913521921132:web:c7cd2fbc77c7ab8957dc49"
    };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // ── VERCEL API PROXY ───────────────────────────────────────────────────
    const GEMINI_URL = 'https://apis-academic-intelligence-system.vercel.app/api/chat';

    let currentUser = null, marksData = [], editingMarkId = null;
    let barChart = null, pieChart = null, radarChart = null, dashboardChart = null;
    let selectedRowIndex = -1;

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const esc = s => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };

    // ── TOAST ─────────────────────────────────────────────────────────────
    const showToast = (msg, type = 'info') => {
        const c = $('#toastContainer'); if (!c) return;
        const t = Object.assign(document.createElement('div'), { className: `toast ${type}`, textContent: msg });
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
    };

    // ── NAVIGATE ──────────────────────────────────────────────────────────
    window.navigateTo = (page) => {
        if (!currentUser && !['login','register'].includes(page)) page = 'login';
        if (currentUser && ['login','register'].includes(page)) page = 'dashboard';
        $$('.page-section').forEach(s => s.classList.remove('active'));
        const t = $(`#page-${page}`); if (t) t.classList.add('active');
        $$('.nav-links li a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
        if (page === 'dashboard') loadDashboard();
        if (page === 'marks') loadMarks();
        if (page === 'analytics') loadAnalytics();
        if (page === 'recommendations') loadRecommendations();
        if (page === 'profile') loadProfile();
        $('#navLinks')?.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.toggleMobileMenu = () => $('#navLinks').classList.toggle('open');

    // ── FIREBASE QUERY ────────────────────────────────────────────────────
    const marksQuery = () => db.collection('marks').where('userId', '==', currentUser.id);

    // ── AUTH ──────────────────────────────────────────────────────────────
    window.handleLogin = async (e) => {
        e.preventDefault();
        const regNo = $('#loginRegNo').value.trim(), pass = $('#loginPassword').value;
        const err = $('#loginError'), btn = $('#loginBtn');
        err.classList.remove('visible'); btn.disabled = true; btn.textContent = '⏳ Signing in...';
        try {
            const snap = await db.collection('users').where('regNo','==',regNo).limit(1).get();
            if (snap.empty) throw new Error('User not found');
            const ud = snap.docs[0].data(), uid = snap.docs[0].id;
            await auth.signInWithEmailAndPassword(`${regNo}@apis.com`, pass);
            currentUser = { id: uid, name: ud.name, regNo: ud.regNo };
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNav(); showToast('Login successful! 🎉','success'); navigateTo('dashboard');
        } catch (ex) { err.textContent = ex.message; err.classList.add('visible'); }
        finally { btn.disabled = false; btn.textContent = '🔐 Sign In'; }
    };

    window.handleRegister = async (e) => {
        e.preventDefault();
        const name = $('#regName').value.trim(), regNo = $('#regRegNo').value.trim(), pass = $('#regPassword').value;
        const err = $('#registerError'), btn = $('#registerBtn');
        if (pass.length < 8) { err.textContent = 'Password must be 8+ chars'; err.classList.add('visible'); return; }
        btn.disabled = true; btn.textContent = '⏳ Creating...';
        try {
            const cred = await auth.createUserWithEmailAndPassword(`${regNo}@apis.com`, pass);
            const uid = cred.user.uid;
            await db.collection('users').doc(uid).set({ name, regNo, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            currentUser = { id: uid, name, regNo };
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNav(); showToast('Account created! 🎉','success'); navigateTo('dashboard');
        } catch (ex) { err.textContent = ex.message; err.classList.add('visible'); }
        finally { btn.disabled = false; btn.textContent = '✨ Create Account'; }
    };

    window.handleLogout = async () => {
        try { await auth.signOut(); } catch {}
        currentUser = null; localStorage.clear(); updateNav(); navigateTo('login'); showToast('Logged out','info');
    };

    const updateNav = () => {
        const loggedIn = !!currentUser;
        $('#navUserName').textContent = currentUser?.name || 'User';
        $('#navUserBadge').style.display = loggedIn ? 'flex' : 'none';
        document.querySelector('.btn-logout').style.display = loggedIn ? 'inline-block' : 'none';
        $('#navLinks').style.display = loggedIn ? 'flex' : 'none';
    };

    // ── GRADE CALCULATOR ─────────────────────────────────────────────────
    const calcGrade = t => t >= 90 ? 'O' : t >= 80 ? 'A+' : t >= 70 ? 'A' : t >= 60 ? 'B' : t >= 50 ? 'C' : 'F';

    // ── DASHBOARD ─────────────────────────────────────────────────────────
    const loadDashboard = async () => {
        if (!currentUser) return;
        const snap = await marksQuery().get();
        const marks = snap.docs.map(d => d.data());
        const n = marks.length, pass = marks.filter(m => m.grade !== 'F').length;
        const avg = n ? (marks.reduce((a,m) => a + m.total, 0) / n).toFixed(1) : 0;
        const gpa = n ? (avg / 10).toFixed(2) : '—';
        const best = n ? marks.reduce((p,c) => c.total > p.total ? c : p) : null;
        const weak = n ? marks.reduce((p,c) => c.total < p.total ? c : p) : null;
        $('#statSubjects').textContent = n;
        $('#statGPA').textContent = gpa;
        $('#statAverage').textContent = avg + '%';
        $('#statPass').textContent = pass;
        $('#statFail').textContent = n - pass;
        $('#statBest').textContent = best?.subject || '—';
        $('#statWeak').textContent = weak?.subject || '—';
        $('#dashboardEmpty').hidden = n > 0;
        const chartCard = $('#dashboardChartCard');
        if (n > 0) {
            chartCard.hidden = false;
            if (dashboardChart) dashboardChart.destroy();
            dashboardChart = new Chart($('#dashboardBarChart'), {
                type: 'bar',
                data: { labels: marks.map(m => m.subject), datasets: [{ label: 'Score', data: marks.map(m => m.total), backgroundColor: marks.map(m => m.total >= 60 ? 'rgba(34,197,94,.6)' : 'rgba(239,68,68,.6)'), borderRadius: 6 }] },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min:0, max:100, ticks:{ color:'#94a3b8' }, grid:{ color:'rgba(255,255,255,.05)' } }, x:{ ticks:{ color:'#94a3b8' } } } }
            });
        } else { chartCard.hidden = true; }
    };

    // ── MARKS ─────────────────────────────────────────────────────────────
    const loadMarks = async () => {
        if (!currentUser) return;
        const snap = await marksQuery().orderBy('createdAt','desc').get();
        marksData = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        renderTable();
    };

    const renderTable = () => {
        const table = $('#marksTable'), tbody = $('#marksTableBody'), empty = $('#marksEmpty');
        if (!marksData.length) { table.hidden = true; empty.hidden = false; return; }
        table.hidden = false; empty.hidden = true;
        tbody.innerHTML = marksData.map((m, i) => `
            <tr data-idx="${i}" tabindex="0" onclick="selectRow(${i})" class="marks-row">
                <td><strong>${esc(m.subject)}</strong></td>
                <td>${m.ca1}</td><td>${m.ca2}</td><td>${m.mte}</td><td>${m.ete}</td>
                <td><span class="score-pill ${m.total>=60?'pass':'fail'}">${m.total}</span></td>
                <td><span class="badge-grade badge-${esc(m.grade)}">${esc(m.grade)}</span></td>
                <td>
                    <button class="btn-edit-text" onclick="event.stopPropagation();window._editMark('${m._id}')">✏️</button>
                    <button class="btn-danger-text" onclick="event.stopPropagation();window._deleteMark('${m._id}')">🗑️</button>
                </td>
            </tr>`).join('');
    };

    window.selectRow = (i) => {
        selectedRowIndex = i;
        $$('.marks-row').forEach(r => r.classList.remove('row-selected'));
        const row = $(`[data-idx="${i}"]`); if (row) row.classList.add('row-selected');
    };

    window._editMark = (id) => {
        const m = marksData.find(x => x._id === id); if (!m) return;
        editingMarkId = id;
        $('#markModalTitle').textContent = '✏️ Edit Marks';
        $('#markEditId').value = id;
        $('#markSubject').value = m.subject;
        $('#markCA1').value = m.ca1; $('#markCA2').value = m.ca2;
        $('#markMTE').value = m.mte; $('#markETE').value = m.ete;
        $('#dupeWarning').hidden = true;
        $('#markModal').hidden = false;
    };

    window._deleteMark = async (id) => {
        if (!confirm('Delete this mark?')) return;
        await db.collection('marks').doc(id).delete();
        showToast('Deleted','success'); loadMarks(); loadDashboard();
    };

    // ── DUPLICATE CHECK ───────────────────────────────────────────────────
    window.checkDuplicate = (val) => {
        if (editingMarkId) { $('#dupeWarning').hidden = true; return; }
        const exists = marksData.some(m => m.subject.toLowerCase() === val.trim().toLowerCase());
        $('#dupeWarning').hidden = !exists;
    };

    window.openAddMarkModal = () => {
        editingMarkId = null;
        ['markModalTitle','markEditId','markSubject','markCA1','markCA2','markMTE','markETE'].forEach(id => {
            const el = $(`#${id}`); if (el) el.value = '';
        });
        $('#markModalTitle').textContent = '➕ Add New Marks';
        $('#dupeWarning').hidden = true;
        $('#markModal').hidden = false;
        setTimeout(() => $('#markSubject').focus(), 100);
    };

    window.closeMarkModal = () => { $('#markModal').hidden = true; editingMarkId = null; };

    window.handleMarkSubmit = async (e) => {
        e.preventDefault();
        const btn = $('#markSubmitBtn'), errEl = $('#markFormError');
        errEl.classList.remove('visible');
        const subject = $('#markSubject').value.trim();
        const ca1 = parseFloat($('#markCA1').value) || 0;
        const ca2 = parseFloat($('#markCA2').value) || 0;
        const mte = parseFloat($('#markMTE').value) || 0;
        const ete = parseFloat($('#markETE').value) || 0;
        if (!subject) { errEl.textContent = 'Subject required'; errEl.classList.add('visible'); return; }
        const total = ca1 + ca2 + mte + ete;
        const grade = calcGrade(total);
        const payload = { subject, ca1, ca2, mte, ete, total, grade, userId: currentUser.id, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        btn.disabled = true; btn.textContent = '⏳ Saving...';
        try {
            if (editingMarkId) {
                await db.collection('marks').doc(editingMarkId).update(payload);
                showToast('Updated!','success');
            } else {
                // De-dupe: check if subject exists
                const existing = marksData.find(m => m.subject.toLowerCase() === subject.toLowerCase());
                if (existing) {
                    await db.collection('marks').doc(existing._id).update(payload);
                    showToast(`"${subject}" updated (no duplicate created)!`,'success');
                } else {
                    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('marks').add(payload);
                    showToast('Mark added!','success');
                }
            }
            closeMarkModal(); loadMarks(); loadDashboard();
        } catch (ex) { errEl.textContent = ex.message; errEl.classList.add('visible'); }
        finally { btn.disabled = false; btn.textContent = editingMarkId ? '💾 Update' : '💾 Save Marks'; }
    };

    window.exportCSV = () => {
        if (!marksData.length) { showToast('No data','info'); return; }
        const rows = [['Subject','CA1','CA2','MTE','ETE','Total','Grade'], ...marksData.map(m => [m.subject,m.ca1,m.ca2,m.mte,m.ete,m.total,m.grade])];
        const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type:'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `marks_${currentUser.regNo}.csv`; a.click();
        showToast('CSV exported!','success');
    };

    // ── ANALYTICS ─────────────────────────────────────────────────────────
    const loadAnalytics = async () => {
        if (!currentUser) return;
        const snap = await marksQuery().get();
        const marks = snap.docs.map(d => d.data());
        const hasData = marks.length > 0;
        $('#analyticsEmpty').hidden = hasData;
        $$('#page-analytics .glass-card').forEach(el => el.style.display = hasData ? '' : 'none');
        if (!hasData) return;

        // KPI
        const kpi = $('#analyticsKPI');
        const sorted = [...marks].sort((a,b) => b.total - a.total);
        kpi.innerHTML = sorted.map(m => `
            <div class="kpi-card ${m.total>=60?'pass':'fail'}">
                <div class="kpi-subject">${esc(m.subject)}</div>
                <div class="kpi-score">${m.total}<span>/100</span></div>
                <div class="kpi-grade badge-grade badge-${esc(m.grade)}">${esc(m.grade)}</div>
                <div class="kpi-bar"><div class="kpi-bar-fill" style="width:${m.total}%;background:${m.total>=60?'var(--success)':'var(--danger)'}"></div></div>
            </div>`).join('');

        const labels = marks.map(m => m.subject);
        const totals = marks.map(m => m.total);
        const colors = totals.map(t => t >= 60 ? 'rgba(34,197,94,.7)' : 'rgba(239,68,68,.7)');

        if (barChart) barChart.destroy();
        barChart = new Chart($('#barChart'), {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Total Score', data: totals, backgroundColor: colors, borderRadius: 6 }] },
            options: { responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ min:0,max:100, ticks:{color:'#94a3b8'}, grid:{color:'rgba(255,255,255,.05)'} }, x:{ticks:{color:'#94a3b8'}} } }
        });

        if (pieChart) pieChart.destroy();
        const dist = marks.reduce((a,m) => { a[m.grade]=(a[m.grade]||0)+1; return a; }, {});
        const gradeColors = { O:'#fbbf24','A+':'#4ade80',A:'#2dd4bf',B:'#60a5fa',C:'#f97316',F:'#f87171' };
        const entries = Object.entries(dist);
        pieChart = new Chart($('#pieChart'), {
            type: 'doughnut',
            data: { labels: entries.map(([g]) => `Grade ${g}`), datasets: [{ data: entries.map(([,c])=>c), backgroundColor: entries.map(([g])=>gradeColors[g]||'#94a3b8'), borderColor:'rgba(13,15,20,.8)', borderWidth:2 }] },
            options: { responsive:true, plugins:{ legend:{ labels:{ color:'#94a3b8' } } } }
        });

        // Radar: normalize each component to %
        const avg = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
        const radarData = [
            (avg(marks.map(m=>m.ca1))/10)*100,
            (avg(marks.map(m=>m.ca2))/10)*100,
            (avg(marks.map(m=>m.mte))/30)*100,
            (avg(marks.map(m=>m.ete))/50)*100
        ];
        if (radarChart) radarChart.destroy();
        radarChart = new Chart($('#radarChart'), {
            type: 'radar',
            data: { labels:['CA1 (10)','CA2 (10)','MTE (30)','ETE (50)'], datasets:[{ label:'Performance %', data: radarData, backgroundColor:'rgba(249,115,22,.15)', borderColor:'rgba(249,115,22,.8)', pointBackgroundColor:'rgba(249,115,22,1)', borderWidth:2 }] },
            options: { responsive:true, scales:{ r:{ min:0,max:100, ticks:{color:'#94a3b8',backdropColor:'transparent'}, grid:{color:'rgba(255,255,255,.1)'}, pointLabels:{color:'#cbd5e1',font:{size:12}} } }, plugins:{ legend:{ labels:{color:'#94a3b8'} } } }
        });

        // Component breakdown
        $('#componentBreakdown').innerHTML = [
            { label:'Avg CA1', val: avg(marks.map(m=>m.ca1)).toFixed(1), max:10 },
            { label:'Avg CA2', val: avg(marks.map(m=>m.ca2)).toFixed(1), max:10 },
            { label:'Avg MTE', val: avg(marks.map(m=>m.mte)).toFixed(1), max:30 },
            { label:'Avg ETE', val: avg(marks.map(m=>m.ete)).toFixed(1), max:50 },
        ].map(c => `<div class="component-item"><div class="comp-value">${c.val}</div><div class="comp-label">${c.label} /${c.max}</div></div>`).join('');
    };

    // ── RECOMMENDATIONS ────────────────────────────────────────────────────
    const loadRecommendations = async () => {
        if (!currentUser) return;
        const snap = await marksQuery().get();
        const marks = snap.docs.map(d => d.data());
        const weak = marks.filter(m => m.total < 60);
        $('#overallStatusContainer').innerHTML = `<div class="overall-status ${weak.length?'needs-improvement':'good'}">${weak.length?`⚠️ ${weak.length} subject(s) need improvement`:'🎉 Excellent! All subjects passing.'}</div>`;
        const list = $('#recommendationsList');
        if (weak.length) {
            list.innerHTML = weak.map(m => `
                <div class="glass-card compact recommendation-card">
                    <div class="rec-subject">📘 ${esc(m.subject)}</div>
                    <div class="rec-meta">Score: ${m.total}/100 · Grade: ${m.grade}</div>
                    <ul class="rec-tips">
                        <li>Need ${60-m.total} more marks to pass</li>
                        <li>Focus on ETE (${m.ete}/50) — highest weight</li>
                        <li>Review past papers and weak concepts</li>
                    </ul>
                </div>`).join('');
            list.style.display = '';
            $('#recEmpty').hidden = true;
        } else { list.style.display = 'none'; $('#recEmpty').hidden = false; }
    };

    // ── PROFILE ────────────────────────────────────────────────────────────
    const loadProfile = () => {
        if (!currentUser) return;
        $('#profileName').textContent = currentUser.name || '—';
        $('#profileRegNo').textContent = currentUser.regNo || '—';
        $('#profileAvatar').textContent = (currentUser.name||'?')[0].toUpperCase();
        $('#profileNameInput').value = currentUser.name || '';
    };
    window.handleProfileUpdate = async (e) => {
        e.preventDefault();
        const n = $('#profileNameInput').value.trim(); if (!n) return;
        await db.collection('users').doc(currentUser.id).update({ name: n });
        currentUser.name = n; localStorage.setItem('user', JSON.stringify(currentUser));
        updateNav(); loadProfile(); showToast('Updated!','success');
    };

    // ── AI CHATBOT ─────────────────────────────────────────────────────────
    window.toggleChatbot = () => {
        const p = $('#chatbotPanel');
        p.hidden = !p.hidden;
        if (!p.hidden) setTimeout(() => $('#chatInput').focus(), 100);
    };

    const buildContext = () => {
        if (!marksData.length) return 'No marks data available yet.';
        const lines = marksData.map(m => `${m.subject}: CA1=${m.ca1}/10, CA2=${m.ca2}/10, MTE=${m.mte}/30, ETE=${m.ete}/50, Total=${m.total}/100, Grade=${m.grade}`);
        const avg = (marksData.reduce((a,m)=>a+m.total,0)/marksData.length).toFixed(1);
        const best = marksData.reduce((p,c)=>c.total>p.total?c:p);
        const weak = marksData.reduce((p,c)=>c.total<p.total?c:p);
        return `Student: ${currentUser.name} (${currentUser.regNo})\nAverage: ${avg}/100\nBest: ${best.subject} (${best.total})\nWeakest: ${weak.subject} (${weak.total})\n\nSubject Details:\n${lines.join('\n')}`;
    };

    const appendMsg = (text, who) => {
        const msgs = $('#chatbotMessages');
        const div = document.createElement('div');
        div.className = `chat-msg ${who}`;
        div.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g,'<br>')}</div>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    };

    const askGemini = async (question) => {
        const context = buildContext();
        const prompt = `You are an academic advisor AI. Only answer based on this student data:\n\n${context}\n\nUser question: ${question}\n\nGive a SHORT (3-5 lines max), data-driven answer. Use bullet points if listing multiple items.`;
        try {
            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (!res.ok) throw new Error(`API error ${res.status}`);
            const data = await res.json();
            return data.success ? data.text : (data.message || 'No response received.');
        } catch (ex) {
            return `⚠️ Could not connect to AI: ${ex.message}`;
        }
    };

    window.handleChatSubmit = async (e) => {
        e.preventDefault();
        const input = $('#chatInput'), btn = $('#chatSendBtn');
        const q = input.value.trim(); if (!q) return;
        appendMsg(q, 'user');
        input.value = ''; btn.disabled = true;
        appendMsg('⏳ Thinking...', 'ai');
        const reply = await askGemini(q);
        $('#chatbotMessages').lastChild.remove();
        appendMsg(reply, 'ai');
        btn.disabled = false;
        $('#chatQuickBtns').style.display = 'none';
    };

    window.sendQuickChat = async (q) => {
        const input = $('#chatInput'); input.value = q;
        await window.handleChatSubmit({ preventDefault: ()=>{} });
    };

    // ── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        const modal = $('#markModal');
        if (e.key === 'Escape' && !modal.hidden) { closeMarkModal(); return; }
        const active = document.activeElement;
        const isTyping = ['INPUT','TEXTAREA','SELECT'].includes(active.tagName);
        if (!isTyping && e.key.toLowerCase() === 'e' && !modal.hidden === false) {
            if (selectedRowIndex >= 0 && marksData[selectedRowIndex]) {
                window._editMark(marksData[selectedRowIndex]._id);
            } else if (marksData.length) {
                window._editMark(marksData[0]._id);
            }
        }
    });

    $('#markModal').addEventListener('click', e => { if (e.target === $('#markModal')) closeMarkModal(); });

    // ── INIT ────────────────────────────────────────────────────────────────
    const init = () => {
        if (window._apisInit) return; window._apisInit = true;
        try { const u = localStorage.getItem('user'); if (u) currentUser = JSON.parse(u); } catch { localStorage.clear(); }
        updateNav();
        navigateTo(currentUser ? 'dashboard' : 'login');
        window.addEventListener('scroll', () => $('#navbar')?.classList.toggle('scrolled', scrollY > 10));
        document.addEventListener('click', e => {
            const nl = $('#navLinks'), mb = $('#mobileMenuBtn');
            if (nl?.classList.contains('open') && !nl.contains(e.target) && !mb.contains(e.target)) nl.classList.remove('open');
        });
    };

    // Expose globals
    ['navigateTo','toggleMobileMenu','handleLogin','handleRegister','handleLogout',
     'openAddMarkModal','closeMarkModal','handleMarkSubmit','exportCSV','handleProfileUpdate',
     'checkDuplicate','selectRow','toggleChatbot','handleChatSubmit','sendQuickChat',
     '_editMark','_deleteMark'].forEach(fn => window[fn] = window[fn] || eval(fn));

    document.addEventListener('DOMContentLoaded', init);
})();
