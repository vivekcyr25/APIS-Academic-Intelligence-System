(function () {
    // ============ FIREBASE CONFIG ============
    const firebaseConfig = {
        apiKey: "REDACTED_FIREBASE_KEY",
        authDomain: "gen-lang-client-0107179257.firebaseapp.com",
        projectId: "gen-lang-client-0107179257",
        storageBucket: "gen-lang-client-0107179257.firebasestorage.app",
        messagingSenderId: "515714777174",
        appId: "1:515714777174:web:866292364c676df479c45d",
        measurementId: "G-FKEB3JNV6Y"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth();

    // ============ CONFIG ============
    const CONFIG = {
        API_BASE_URL: '/api',
        ENCRYPTION_SECRET: 'your-32-byte-hex-encryption-secret-change-this-in-production',
        ITERATIONS: 100000,
        SALT: new TextEncoder().encode('apis-salt-v1'),
    };

    // ============ STATE ============
    let currentUser = null;
    let currentPage = 'login';
    let marksData = [];
    let barChartInstance = null;
    let pieChartInstance = null;
    let editingMarkId = null;

    // ============ DOM REFS ============
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============ TOAST ============
    const showToast = (message, type = 'info') => {
        const container = $('#toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    // ============ NAVIGATION ============
    const navigateTo = (page) => {
        if (!currentUser && page !== 'login' && page !== 'register') {
            page = 'login';
        }
        if (currentUser && (page === 'login' || page === 'register')) {
            page = 'dashboard';
        }
        currentPage = page;
        $$('.page-section').forEach(s => s.classList.remove('active'));
        const target = $(`#page-${page}`);
        if (target) target.classList.add('active');
        $$('.nav-links li a').forEach(a => a.classList.remove('active'));
        const navLink = document.querySelector(`.nav-links li a[data-page="${page}"]`);
        if (navLink) navLink.classList.add('active');
        
        if (page === 'dashboard') loadDashboard();
        if (page === 'marks') loadMarks();
        if (page === 'analytics') loadAnalytics();
        if (page === 'recommendations') loadRecommendations();
        if (page === 'profile') loadProfile();
        
        const navLinksEl = $('#navLinks');
        if (navLinksEl && navLinksEl.classList.contains('open')) navLinksEl.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleMobileMenu = () => {
        $('#navLinks').classList.toggle('open');
    };

    // ============ FIREBASE HELPERS ============
    const getMarksQuery = () => db.collection('marks').where('userId', '==', currentUser.id);

    // ============ AUTH ============
    const handleLogin = async (e) => {
        e.preventDefault();
        const regNo = $('#loginRegNo').value.trim();
        const password = $('#loginPassword').value;
        const errorEl = $('#loginError');
        const btn = $('#loginBtn');
        errorEl.classList.remove('visible');
        btn.disabled = true;
        btn.textContent = '⏳ Signing in...';

        try {
            // Check if user exists in Firestore first
            const userSnapshot = await db.collection('users').where('regNo', '==', regNo).limit(1).get();
            if (userSnapshot.empty) throw new Error('User record not found');
            
            const userData = userSnapshot.docs[0].data();
            const userId = userSnapshot.docs[0].id;

            // Authenticate
            await auth.signInWithEmailAndPassword(`${regNo}@apis.com`, password);
            
            currentUser = { id: userId, name: userData.name, regNo: userData.regNo };
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            updateNavUser();
            showToast('Login successful! 🎉', 'success');
            navigateTo('dashboard');
        } catch (err) {
            errorEl.textContent = err.message || 'Login failed';
            errorEl.classList.add('visible');
        } finally {
            btn.disabled = false;
            btn.textContent = '🔐 Sign In';
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const name = $('#regName').value.trim();
        const regNo = $('#regRegNo').value.trim();
        const password = $('#regPassword').value;
        const errorEl = $('#registerError');
        const btn = $('#registerBtn');
        errorEl.classList.remove('visible');

        if (password.length < 8) {
            errorEl.textContent = 'Password must be at least 8 characters.';
            errorEl.classList.add('visible');
            return;
        }

        btn.disabled = true;
        btn.textContent = '⏳ Creating...';

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(`${regNo}@apis.com`, password);
            const uid = userCredential.user.uid;

            await db.collection('users').doc(uid).set({
                name,
                regNo,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            currentUser = { id: uid, name, regNo };
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            updateNavUser();
            showToast('Account created! Welcome 🎉', 'success');
            navigateTo('dashboard');
        } catch (err) {
            errorEl.textContent = err.message || 'Registration failed';
            errorEl.classList.add('visible');
        } finally {
            btn.disabled = false;
            btn.textContent = '✨ Create Account';
        }
    };

    const handleLogout = async () => {
        try { await auth.signOut(); } catch { }
        currentUser = null;
        localStorage.clear();
        updateNavUser();
        navigateTo('login');
        showToast('Logged out successfully', 'info');
    };

    const updateNavUser = () => {
        const nameEl = $('#navUserName');
        const badgeEl = $('#navUserBadge');
        const logoutBtn = document.querySelector('.btn-logout');
        const navLinks = $('#navLinks');

        if (currentUser) {
            if (nameEl) nameEl.textContent = currentUser.name || 'User';
            if (badgeEl) badgeEl.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (navLinks) navLinks.style.display = 'flex';
        } else {
            if (nameEl) nameEl.textContent = 'Guest';
            if (badgeEl) badgeEl.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (navLinks) navLinks.style.display = 'none';
        }
    };

    const updateNavLinksVisibility = () => {
        const navLinks = $('#navLinks');
        if (!currentUser && navLinks) {
            if (window.innerWidth <= 768) navLinks.style.display = 'none';
        }
    };

    // ============ DASHBOARD ============
    const loadDashboard = async () => {
        if (!currentUser) return;
        try {
            const snapshot = await getMarksQuery().get();
            const marks = snapshot.docs.map(doc => doc.data());
            
            const totalSubjects = marks.length;
            const passCount = marks.filter(m => m.grade !== 'F').length;
            const failCount = totalSubjects - passCount;
            const totalMarks = marks.reduce((acc, m) => acc + (m.total || 0), 0);
            const overallAverage = totalSubjects > 0 ? (totalMarks / totalSubjects).toFixed(2) : 0;
            const gpa = totalSubjects > 0 ? (totalMarks / 10 / totalSubjects).toFixed(2) : '0.00';
            const bestSubject = marks.length > 0 ? marks.reduce((prev, curr) => (prev.total > curr.total) ? prev : curr) : null;
            const weakSubject = marks.length > 0 ? marks.reduce((prev, curr) => (prev.total < curr.total) ? prev : curr) : null;

            $('#statSubjects').textContent = totalSubjects;
            $('#statGPA').textContent = gpa;
            $('#statAverage').textContent = overallAverage + '%';
            $('#statPass').textContent = passCount;
            $('#statFail').textContent = failCount;
            $('#statBest').textContent = bestSubject ? bestSubject.subject : '—';
            $('#statWeak').textContent = weakSubject ? weakSubject.subject : '—';
            
            $('#dashboardEmpty').hidden = totalSubjects > 0;
        } catch (err) {
            console.error('Dashboard load error:', err);
            showToast('Failed to load dashboard', 'error');
        }
    };

    // ============ MARKS ============
    const loadMarks = async () => {
        if (!currentUser) return;
        try {
            const snapshot = await getMarksQuery().orderBy('createdAt', 'desc').get();
            marksData = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
            renderMarksTable();
        } catch (err) {
            console.error('Marks load error:', err);
            showToast('Failed to load marks', 'error');
            marksData = [];
            renderMarksTable();
        }
    };

    const renderMarksTable = () => {
        const table = $('#marksTable');
        const tbody = $('#marksTableBody');
        const empty = $('#marksEmpty');
        if (!marksData.length) {
            if (table) table.hidden = true;
            if (empty) empty.hidden = false;
            return;
        }
        if (table) table.hidden = false;
        if (empty) empty.hidden = true;
        if (tbody) {
            tbody.innerHTML = marksData.map(m => `
                <tr>
                    <td><strong>${escapeHTML(m.subject)}</strong></td>
                    <td>${m.ca1}</td><td>${m.ca2}</td><td>${m.mte}</td><td>${m.ete}</td>
                    <td><span style="font-family:var(--font-mono);font-weight:600;">${m.total}</span></td>
                    <td><span class="badge-grade badge-${escapeHTML(m.grade)}">${escapeHTML(m.grade)}</span></td>
                    <td>
                        <button class="btn-edit-text" onclick="window._editMark('${m._id}')">✏️ Edit</button>
                        <button class="btn-danger-text" onclick="window._deleteMark('${m._id}')">🗑️</button>
                    </td>
                </tr>`).join('');
        }
    };

    window._editMark = (id) => {
        const mark = marksData.find(m => m._id === id);
        if (!mark) return;
        editingMarkId = id;
        $('#markModalTitle').textContent = '✏️ Edit Marks';
        $('#markEditId').value = id;
        $('#markSubject').value = mark.subject;
        $('#markCA1').value = mark.ca1;
        $('#markCA2').value = mark.ca2;
        $('#markMTE').value = mark.mte;
        $('#markETE').value = mark.ete;
        $('#markModal').hidden = false;
    };

    window._deleteMark = async (id) => {
        if (!confirm('Are you sure you want to delete this mark?')) return;
        try {
            await db.collection('marks').doc(id).delete();
            showToast('Mark deleted', 'success');
            loadMarks();
            loadDashboard();
        } catch (err) {
            showToast('Failed to delete mark', 'error');
        }
    };

    const openAddMarkModal = () => {
        editingMarkId = null;
        $('#markModalTitle').textContent = '➕ Add New Marks';
        $('#markEditId').value = '';
        $('#markSubject').value = '';
        $('#markCA1').value = '';
        $('#markCA2').value = '';
        $('#markMTE').value = '';
        $('#markETE').value = '';
        $('#markModal').hidden = false;
    };

    const closeMarkModal = () => {
        $('#markModal').hidden = true;
        editingMarkId = null;
    };

    const handleMarkSubmit = async (e) => {
        e.preventDefault();
        const errorEl = $('#markFormError');
        errorEl.classList.remove('visible');
        const btn = $('#markSubmitBtn');
        const values = {
            subject: $('#markSubject').value.trim(),
            ca1: parseFloat($('#markCA1').value) || 0,
            ca2: parseFloat($('#markCA2').value) || 0,
            mte: parseFloat($('#markMTE').value) || 0,
            ete: parseFloat($('#markETE').value) || 0,
        };

        const total = values.ca1 + values.ca2 + values.mte + values.ete;
        let grade = 'F';
        if (total >= 90) grade = 'O';
        else if (total >= 80) grade = 'A+';
        else if (total >= 70) grade = 'A';
        else if (total >= 60) grade = 'B';
        else if (total >= 50) grade = 'C';

        const markData = {
            ...values,
            total,
            grade,
            userId: currentUser.id,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        btn.disabled = true;
        btn.textContent = '⏳ Saving...';
        try {
            if (editingMarkId) {
                await db.collection('marks').doc(editingMarkId).update(markData);
                showToast('Mark updated!', 'success');
            } else {
                markData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('marks').add(markData);
                showToast('Mark added!', 'success');
            }
            closeMarkModal();
            loadMarks();
            loadDashboard();
        } catch (err) {
            errorEl.textContent = err.message || 'Failed to save';
            errorEl.classList.add('visible');
        } finally {
            btn.disabled = false;
            btn.textContent = editingMarkId ? '💾 Update Marks' : '💾 Save Marks';
        }
    };

    const exportCSV = () => {
        if (!marksData.length) { showToast('No data to export', 'info'); return; }
        const csvRows = [
            ['Subject', 'CA1', 'CA2', 'MTE', 'ETE', 'Total', 'Grade'],
            ...marksData.map(m => [m.subject, m.ca1, m.ca2, m.mte, m.ete, m.total, m.grade])
        ];
        const csvContent = csvRows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marks_${currentUser.regNo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported!', 'success');
    };

    // ============ ANALYTICS ============
    const loadAnalytics = async () => {
        if (!currentUser) return;
        try {
            const snapshot = await getMarksQuery().get();
            const marks = snapshot.docs.map(doc => doc.data());
            
            const subjectPerformance = marks.map(m => ({ subject: m.subject, total: m.total, grade: m.grade }));
            const gradeDistribution = marks.reduce((acc, m) => {
                acc[m.grade] = (acc[m.grade] || 0) + 1;
                return acc;
            }, {});
            const componentBreakdown = {
                avgCA1: marks.length > 0 ? (marks.reduce((a, b) => a + b.ca1, 0) / marks.length).toFixed(1) : 0,
                avgCA2: marks.length > 0 ? (marks.reduce((a, b) => a + b.ca2, 0) / marks.length).toFixed(1) : 0,
                avgMTE: marks.length > 0 ? (marks.reduce((a, b) => a + b.mte, 0) / marks.length).toFixed(1) : 0,
                avgETE: marks.length > 0 ? (marks.reduce((a, b) => a + b.ete, 0) / marks.length).toFixed(1) : 0,
            };

            renderBarChart(subjectPerformance);
            renderPieChart(gradeDistribution);
            renderComponentBreakdown(componentBreakdown);
            
            const hasData = marks.length > 0;
            $('#analyticsEmpty').hidden = hasData;
            $$('#page-analytics .glass-card').forEach(el => el.style.display = hasData ? '' : 'none');
        } catch (err) {
            console.error('Analytics load error:', err);
            showToast('Failed to load analytics', 'error');
        }
    };

    const renderBarChart = (subjectPerformance) => {
        const ctx = $('#barChart');
        if (!ctx) return;
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjectPerformance.map(s => s.subject),
                datasets: [{
                    label: 'Total Marks',
                    data: subjectPerformance.map(s => s.total),
                    backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    borderColor: 'rgba(249, 115, 22, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: { responsive: true, scales: { y: { min: 0, max: 100 } } }
        });
    };

    const renderPieChart = (gradeDistribution) => {
        const ctx = $('#pieChart');
        if (!ctx) return;
        if (pieChartInstance) pieChartInstance.destroy();
        const entries = Object.entries(gradeDistribution);
        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: entries.map(([g]) => `Grade ${g}`),
                datasets: [{
                    data: entries.map(([, c]) => c),
                    backgroundColor: ['#fbbf24', '#4ade80', '#2dd4bf', '#60a5fa', '#f87171']
                }]
            },
            options: { responsive: true }
        });
    };

    const renderComponentBreakdown = (breakdown) => {
        const container = $('#componentBreakdown');
        if (!container) return;
        container.innerHTML = `
            <div class="component-item"><div class="comp-value">${breakdown.avgCA1}</div><div class="comp-label">Avg CA1</div></div>
            <div class="component-item"><div class="comp-value">${breakdown.avgCA2}</div><div class="comp-label">Avg CA2</div></div>
            <div class="component-item"><div class="comp-value">${breakdown.avgMTE}</div><div class="comp-label">Avg MTE</div></div>
            <div class="component-item"><div class="comp-value">${breakdown.avgETE}</div><div class="comp-label">Avg ETE</div></div>`;
    };

    // ============ RECOMMENDATIONS ============
    const loadRecommendations = async () => {
        if (!currentUser) return;
        try {
            const snapshot = await getMarksQuery().get();
            const marks = snapshot.docs.map(doc => doc.data());
            const weakSubjects = marks.filter(m => m.total < 60);
            const statusContainer = $('#overallStatusContainer');
            const recList = $('#recommendationsList');
            const recEmpty = $('#recEmpty');

            if (statusContainer) {
                statusContainer.innerHTML = `<div class="overall-status ${weakSubjects.length ? 'needs-improvement' : 'good'}">
                    ${weakSubjects.length ? `You have ${weakSubjects.length} subjects needing improvement.` : 'Excellent performance across all subjects!'}
                </div>`;
            }

            if (recList && weakSubjects.length) {
                recList.innerHTML = weakSubjects.map(m => `
                    <div class="glass-card compact recommendation-card">
                        <div class="rec-subject">📘 ${escapeHTML(m.subject)}</div>
                        <div class="rec-meta">Current Score: ${m.total} | Grade: ${m.grade}</div>
                        <ul class="rec-tips">
                            <li>Focus on previous year papers for this subject.</li>
                            <li>Review CA1/CA2 components where marks were lost.</li>
                            <li>Schedule extra practice for weak topics.</li>
                        </ul>
                    </div>`).join('');
                recList.style.display = '';
                recEmpty.hidden = true;
            } else {
                if (recList) recList.style.display = 'none';
                recEmpty.hidden = false;
            }
        } catch (err) {
            console.error('Recommendations load error:', err);
        }
    };

    // ============ PROFILE ============
    const loadProfile = () => {
        if (!currentUser) return;
        $('#profileName').textContent = currentUser.name || '—';
        $('#profileRegNo').textContent = currentUser.regNo || '—';
        $('#profileAvatar').textContent = (currentUser.name || '?').charAt(0).toUpperCase();
        $('#profileNameInput').value = currentUser.name || '';
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const newName = $('#profileNameInput').value.trim();
        if (!newName) return;
        try {
            await db.collection('users').doc(currentUser.id).update({ name: newName });
            currentUser.name = newName;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNavUser();
            loadProfile();
            showToast('Profile updated!', 'success');
        } catch (err) {
            showToast('Update failed', 'error');
        }
    };

    // ============ UTILS ============
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // ============ INIT ============
    const init = () => {
        if (window._apisInitialized) return;
        window._apisInitialized = true;
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { currentUser = JSON.parse(storedUser); } catch { localStorage.clear(); }
        }
        updateNavUser();
        navigateTo(currentUser ? 'dashboard' : 'login');
        
        window.addEventListener('scroll', () => {
            $('#navbar')?.classList.toggle('scrolled', window.scrollY > 10);
        });

        document.addEventListener('click', (e) => {
            const navLinks = $('#navLinks');
            const menuBtn = $('#mobileMenuBtn');
            if (navLinks?.classList.contains('open') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });

        window.addEventListener('resize', updateNavLinksVisibility);
        console.log('🚀 APIS Frontend v2.0 (Direct Firestore Mode) initialized');
    };

    // ============ EXPOSE TO WINDOW ============
    window.navigateTo = navigateTo;
    window.toggleMobileMenu = toggleMobileMenu;
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;
    window.handleLogout = handleLogout;
    window.openAddMarkModal = openAddMarkModal;
    window.closeMarkModal = () => $('#markModal').hidden = true;
    window.handleMarkSubmit = handleMarkSubmit;
    window.exportCSV = exportCSV;
    window.handleProfileUpdate = handleProfileUpdate;
    window._editMark = window._editMark;
    window._deleteMark = window._deleteMark;

    document.addEventListener('DOMContentLoaded', init);
})();
