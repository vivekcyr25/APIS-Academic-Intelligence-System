(function () {
    // ============ FIREBASE CONFIG ============
    // IMPORTANT: Replace these with your project's actual config from the Firebase Console
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
    let accessToken = null;
    let currentPage = 'login';
    let marksData = [];
    let barChartInstance = null;
    let pieChartInstance = null;
    let editingMarkId = null;

    // ============ DOM REFS ============
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============ ENCRYPTION SERVICE (Web Crypto API) ============
    const deriveKey = async (userId = '') => {
        const baseSecret = CONFIG.ENCRYPTION_SECRET + userId;
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(baseSecret), { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return window.crypto.subtle.deriveKey({
            name: 'PBKDF2',
            salt: CONFIG.SALT,
            iterations: CONFIG.ITERATIONS,
            hash: 'SHA-256'
        },
            keyMaterial, { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    };

    const encryptPayload = async (data, userId = '') => {
        const key = await deriveKey(userId);
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key,
            encoded);
        const fullCipher = new Uint8Array(encryptedBuffer);
        const ciphertext = fullCipher.slice(0, -16);
        const authTag = fullCipher.slice(-16);
        const toHex = (arr) => Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        return {
            iv: toHex(iv),
            encryptedData: toHex(ciphertext),
            authTag: toHex(authTag)
        };
    };

    const decryptPayload = async (payload, userId = '') => {
        const key = await deriveKey(userId);
        const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
        const iv = fromHex(payload.iv);
        const ciphertext = fromHex(payload.encryptedData);
        const authTag = fromHex(payload.authTag || '');
        const combined = new Uint8Array(ciphertext.length + authTag.length);
        combined.set(ciphertext);
        combined.set(authTag, ciphertext.length);
        const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key,
            combined);
        return JSON.parse(new TextDecoder().decode(decrypted));
    };

    // ============ API SERVICE ============
    const apiCall = async (endpoint, options = {}, useEncryption = false) => {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        let body = options.body;
        if (useEncryption && body && currentUser) {
            const encrypted = await encryptPayload(body, currentUser.id || '');
            body = JSON.stringify(encrypted);
        } else if (body) {
            body = JSON.stringify(body);
        }

        const fetchOptions = {
            method: options.method || 'GET',
            headers,
            credentials: 'include',
            ...(body && { body }),
            signal: options.signal,
        };

        const response = await fetch(url, fetchOptions);

        if (response.status === 401 && !options._retry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                const retryResponse = await fetch(url, { ...fetchOptions, headers, _retry: true });
                return handleResponse(retryResponse, useEncryption);
            }
        }
        return handleResponse(response, useEncryption);
    };

    const handleResponse = async (response, useEncryption) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/csv')) {
            return { blob: await response.blob(), isCSV: true };
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Request failed');
        if (useEncryption && data.data && currentUser && typeof data.data === 'object' && data.data
            .encryptedData) {
            data.data = await decryptPayload(data.data, currentUser.id || '');
        }
        return data;
    };

    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Refresh failed');
            const data = await response.json();
            if (data.data && data.data.accessToken) {
                accessToken = data.data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                return true;
            }
        } catch { logout(); }
        return false;
    };

    // ============ TOAST ============
    const showToast = (message, type = 'info') => {
        const container = $('#toastContainer');
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
        if (page === 'login') $('#loginError')?.classList.remove('visible');
        if (page === 'register') $('#registerError')?.classList.remove('visible');
        const navLinksEl = $('#navLinks');
        if (navLinksEl && navLinksEl.classList.contains('open')) navLinksEl.classList.remove(
            'open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleMobileMenu = () => {
        $('#navLinks').classList.toggle('open');
    };

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
            const data = await apiCall('/auth/login', { method: 'POST', body: { regNo, password } });
            accessToken = data.data.accessToken;
            currentUser = data.data.user;
            localStorage.setItem('accessToken', accessToken);
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
        if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(
            password)) {
            errorEl.textContent = 'Password must be 8+ chars with uppercase, lowercase & number.';
            errorEl.classList.add('visible');
            return;
        }
        btn.disabled = true;
        btn.textContent = '⏳ Creating...';
        try {
            const data = await apiCall('/auth/register', {
                method: 'POST', body: {
                    name, regNo,
                    password
                }
            });
            accessToken = data.data.accessToken;
            currentUser = data.data.user;
            localStorage.setItem('accessToken', accessToken);
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
        try { await apiCall('/auth/logout', { method: 'POST' }); } catch { }
        logout();
    };

    const logout = () => {
        accessToken = null;
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
        if (currentUser) {
            if (nameEl) nameEl.textContent = currentUser.name || 'User';
            if (badgeEl) badgeEl.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            $('#navLinks').style.display = '';
            if (window.innerWidth <= 768) $('#navLinks').style.display = '';
        } else {
            if (nameEl) nameEl.textContent = 'Guest';
            if (badgeEl) badgeEl.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            $('#navLinks').style.display = 'none';
        }
        updateNavLinksVisibility();
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
            const data = await apiCall('/dashboard');
            const d = data.data;
            $('#statSubjects').textContent = d.totalSubjects ?? 0;
            $('#statGPA').textContent = d.gpa ?? '0.00';
            $('#statAverage').textContent = (d.overallAverage ?? 0) + '%';
            $('#statPass').textContent = d.passCount ?? 0;
            $('#statFail').textContent = d.failCount ?? 0;
            $('#statBest').textContent = d.bestSubject ? d.bestSubject.subject : '—';
            $('#statWeak').textContent = d.weakSubject ? d.weakSubject.subject : '—';
            const hasData = (d.totalSubjects || 0) > 0;
            $('#dashboardEmpty').hidden = hasData;
        } catch (err) {
            console.error('Dashboard load error:', err);
            showToast('Failed to load dashboard', 'error');
            resetDashboardStats();
        }
    };

    const resetDashboardStats = () => {
        ['statSubjects', 'statGPA', 'statAverage', 'statPass', 'statFail', 'statBest', 'statWeak']
            .forEach(id => { const el = $('#' + id); if (el) el.textContent = '—'; });
    };

    // ============ MARKS ============
    const loadMarks = async () => {
        if (!currentUser) return;
        try {
            const data = await apiCall('/marks');
            marksData = data.data || [];
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
        $('#markFormError').classList.remove('visible');
        $('#markSubmitBtn').textContent = '💾 Update Marks';
        $('#markModal').hidden = false;
    };

    window._deleteMark = async (id) => {
        if (!confirm('Are you sure you want to delete this mark?')) return;
        try {
            await apiCall(`/marks/${id}`, { method: 'DELETE' });
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
        $('#markFormError').classList.remove('visible');
        $('#markSubmitBtn').textContent = '💾 Save Marks';
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
        const body = {
            subject: $('#markSubject').value.trim(),
            ca1: parseFloat($('#markCA1').value),
            ca2: parseFloat($('#markCA2').value),
            mte: parseFloat($('#markMTE').value),
            ete: parseFloat($('#markETE').value),
        };
        if (!body.subject) {
            errorEl.textContent = 'Subject name is required.';
            errorEl.classList.add('visible'); return;
        }
        if (isNaN(body.ca1) || body.ca1 < 0 || body.ca1 > 10) {
            errorEl.textContent =
                'CA1 must be 0–10.';
            errorEl.classList.add('visible'); return;
        }
        if (isNaN(body.ca2) || body.ca2 < 0 || body.ca2 > 10) {
            errorEl.textContent =
                'CA2 must be 0–10.';
            errorEl.classList.add('visible'); return;
        }
        if (isNaN(body.mte) || body.mte < 0 || body.mte > 30) {
            errorEl.textContent =
                'MTE must be 0–30.';
            errorEl.classList.add('visible'); return;
        }
        if (isNaN(body.ete) || body.ete < 0 || body.ete > 50) {
            errorEl.textContent =
                'ETE must be 0–50.';
            errorEl.classList.add('visible'); return;
        }
        btn.disabled = true;
        btn.textContent = '⏳ Saving...';
        try {
            if (editingMarkId) {
                await apiCall(`/marks/${editingMarkId}`, { method: 'PUT', body });
                showToast('Mark updated successfully', 'success');
            } else {
                await apiCall('/marks', { method: 'POST', body });
                showToast('Mark added successfully', 'success');
            }
            closeMarkModal();
            loadMarks();
            loadDashboard();
        } catch (err) {
            errorEl.textContent = err.message || 'Failed to save marks';
            errorEl.classList.add('visible');
        } finally {
            btn.disabled = false;
            btn.textContent = editingMarkId ? '💾 Update Marks' : '💾 Save Marks';
        }
    };

    const exportCSV = async () => {
        if (!marksData.length) { showToast('No data to export', 'info'); return; }
        try {
            const data = await apiCall('/export/csv');
            if (data.blob) {
                const url = URL.createObjectURL(data.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `marks_${currentUser?.regNo || 'export'}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('CSV downloaded!', 'success');
            }
        } catch {
            const csvRows = [
                ['Student Name', currentUser?.name || ''],
                ['Reg No', currentUser?.regNo || ''],
                ['Export Date', new Date().toLocaleDateString()],
                [],
                ['Subject', 'CA1', 'CA2', 'MTE', 'ETE', 'Total', 'Grade']
            ];
            marksData.forEach(m => csvRows.push([m.subject, m.ca1, m.ca2, m.mte, m.ete, m.total, m
                .grade
            ]));
            const csvContent = csvRows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `marks_${currentUser?.regNo || 'export'}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSV exported (offline mode)', 'info');
        }
    };

    // ============ ANALYTICS ============
    const loadAnalytics = async () => {
        if (!currentUser) return;
        try {
            const data = await apiCall('/analytics');
            const a = data.data;
            renderBarChart(a.subjectPerformance || []);
            renderPieChart(a.gradeDistribution || {});
            renderComponentBreakdown(a.componentBreakdown || {});
            const hasData = (a.subjectPerformance || []).length > 0;
            $('#analyticsEmpty').hidden = hasData;
            document.querySelectorAll('#page-analytics .charts-grid .glass-card, #page-analytics .glass-card.compact')
                .forEach(el => el.style.display = hasData ? '' : 'none');
        } catch (err) {
            console.error('Analytics load error:', err);
            showToast('Failed to load analytics', 'error');
            $('#analyticsEmpty').hidden = false;
        }
    };

    const renderBarChart = (subjectPerformance) => {
        const ctx = $('#barChart');
        if (!ctx) return;
        if (barChartInstance) barChartInstance.destroy();
        if (!subjectPerformance.length) return;
        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjectPerformance.map(s => s.subject),
                datasets: [{
                    label: 'Total Marks',
                    data: subjectPerformance.map(s => s.total),
                    backgroundColor: subjectPerformance.map(s => {
                        const g = s.grade;
                        if (g === 'O') return 'rgba(251,191,36,0.7)';
                        if (g === 'A+') return 'rgba(34,197,94,0.6)';
                        if (g === 'A') return 'rgba(20,184,166,0.6)';
                        if (g === 'B') return 'rgba(59,130,246,0.6)';
                        if (g === 'C') return 'rgba(251,191,36,0.4)';
                        return 'rgba(239,68,68,0.6)';
                    }),
                    borderColor: 'rgba(249,115,22,0.5)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: {
                        min: 0, max: 100, ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    };

    const renderPieChart = (gradeDistribution) => {
        const ctx = $('#pieChart');
        if (!ctx) return;
        if (pieChartInstance) pieChartInstance.destroy();
        if (!Object.keys(gradeDistribution).length) return;
        const gradeColors = {
            'O': '#fbbf24',
            'A+': '#4ade80',
            'A': '#2dd4bf',
            'B': '#60a5fa',
            'C': '#fbbf24',
            'F': '#f87171'
        };
        const entries = Object.entries(gradeDistribution);
        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: entries.map(([g]) => `Grade ${g}`),
                datasets: [{
                    data: entries.map(([, c]) => c),
                    backgroundColor: entries.map(([g]) => gradeColors[g] ||
                        'rgba(148,163,184,0.5)'),
                    borderColor: 'rgba(13,15,20,0.8)',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: '#94a3b8' } } }
            }
        });
    };

    const renderComponentBreakdown = (breakdown) => {
        const container = $('#componentBreakdown');
        if (!container) return;
        container.innerHTML = `
          <div class="component-item"><div class="comp-value">${breakdown.avgCA1 ?? '—'}</div><div class="comp-label">Avg CA1</div></div>
          <div class="component-item"><div class="comp-value">${breakdown.avgCA2 ?? '—'}</div><div class="comp-label">Avg CA2</div></div>
          <div class="component-item"><div class="comp-value">${breakdown.avgMTE ?? '—'}</div><div class="comp-label">Avg MTE</div></div>
          <div class="component-item"><div class="comp-value">${breakdown.avgETE ?? '—'}</div><div class="comp-label">Avg ETE</div></div>`;
    };

    // ============ RECOMMENDATIONS ============
    const loadRecommendations = async () => {
        if (!currentUser) return;
        try {
            const data = await apiCall('/recommendations');
            const r = data.data;
            const statusContainer = $('#overallStatusContainer');
            const recList = $('#recommendationsList');
            const recEmpty = $('#recEmpty');
            if (statusContainer) {
                const isGood = !r.recommendations || r.recommendations.length === 0;
                statusContainer.innerHTML = `
              <div class="overall-status ${isGood ? 'good' : 'needs-improvement'}">
                ${escapeHTML(r.overallStatus || '')}
              </div>`;
            }
            if (recList && r.recommendations && r.recommendations.length > 0) {
                recList.innerHTML = r.recommendations.map(rec => `
              <div class="glass-card compact recommendation-card">
                <div class="rec-subject">📘 ${escapeHTML(rec.subject)}</div>
                <div class="rec-meta">Total: ${rec.total} | Grade: ${escapeHTML(rec.grade)}</div>
                <ul class="rec-tips">${(rec.tips || []).map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
              </div>`).join('');
                recList.style.display = '';
            } else if (recList) {
                recList.innerHTML = '';
                recList.style.display = 'none';
            }
            if (recEmpty) recEmpty.hidden = r.recommendations && r.recommendations.length > 0;
        } catch (err) {
            console.error('Recommendations load error:', err);
            showToast('Failed to load recommendations', 'error');
        }
    };

    // ============ PROFILE ============
    const loadProfile = () => {
        if (!currentUser) return;
        $('#profileName').textContent = currentUser.name || '—';
        $('#profileRegNo').textContent = currentUser.regNo || '—';
        $('#profileAvatar').textContent = (currentUser.name || '?').charAt(0).toUpperCase();
        $('#profileNameInput').value = currentUser.name || '';
        $('#profileSince').textContent = currentUser.createdAt ? new Date(currentUser.createdAt)
            .toLocaleDateString() : 'N/A';
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const newName = $('#profileNameInput').value.trim();
        if (!newName) { showToast('Name cannot be empty', 'error'); return; }
        try {
            const data = await apiCall('/profile', { method: 'PUT', body: { name: newName } });
            currentUser = { ...currentUser, name: newName };
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateNavUser();
            loadProfile();
            showToast('Profile updated!', 'success');
        } catch (err) {
            showToast(err.message || 'Update failed', 'error');
        }
    };

    // ============ MODAL CLICK-OUTSIDE ============
    $('#markModal').addEventListener('click', function (e) {
        if (e.target === this) closeMarkModal();
    });

    // ============ KEYBOARD SHORTCUTS ============
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!$('#markModal').hidden) closeMarkModal();
        }
    });

    // ============ UTILS ============
    const escapeHTML = (str) => {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // ============ INIT ============
    const init = () => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                accessToken = storedToken;
                currentUser = JSON.parse(storedUser);
            } catch {
                currentUser = null;
                accessToken = null;
                localStorage.clear();
            }
        }
        updateNavUser();
        if (currentUser) {
            navigateTo('dashboard');
        } else {
            navigateTo('login');
        }
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = $('#navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 10);
            }
        });
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            const navLinks = $('#navLinks');
            const menuBtn = $('#mobileMenuBtn');
            if (navLinks && navLinks.classList.contains('open') &&
                !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
        // Handle window resize
        window.addEventListener('resize', updateNavLinksVisibility);
        console.log('🚀 APIS Frontend v2.0 initialized');
        console.log('🔐 AES-256-GCM E2E Encryption ready');
        console.log('👤 Auth status:', currentUser ? 'Logged in' : 'Guest');
    };

    // ============ EXPOSE TO WINDOW ============
    window.navigateTo = navigateTo;
    window.toggleMobileMenu = toggleMobileMenu;
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;
    window.handleLogout = handleLogout;
    window.openAddMarkModal = openAddMarkModal;
    window.closeMarkModal = closeMarkModal;
    window.handleMarkSubmit = handleMarkSubmit;
    window.exportCSV = exportCSV;
    window.handleProfileUpdate = handleProfileUpdate;
    window._editMark = window._editMark;
    window._deleteMark = window._deleteMark;

    // ============ START ============
    document.addEventListener('DOMContentLoaded', init);
})();
