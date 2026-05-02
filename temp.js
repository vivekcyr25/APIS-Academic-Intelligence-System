        // ==========================================
        // 1. DATA & CONFIG
        // ==========================================
        const subjectsList = ["Mathematics", "Physics", "Computer Science", "English", "DBMS", "C Programming"];
        const isLocalFile = window.location.protocol === 'file:' || window.location.hostname === 'localhost';
        const API_BASE = isLocalFile ? "http://localhost:3000/api" : "https://ca3-s3xb.onrender.com/api";

        let currentUser = null;
        let viewStudent = null;
        let barChartInst = null, lineChartInst = null, pieChartInst = null;

        // ==========================================
        // CINEMATIC INTRO â€” dismiss after 2.2s
        // ==========================================
        window.addEventListener('DOMContentLoaded', () => {
            const intro = document.getElementById('introScreen');
            setTimeout(() => {
                intro.classList.add('fade-out');
                setTimeout(() => { intro.style.display = 'none'; }, 900);
            }, 2200);
        });

        // ==========================================
        // 2. UTILITIES
        // ==========================================
        function calculateGrade(total) {
            if (total >= 90) return { l: 'O',  cls: 'grade-a', gp: 10 };
            if (total >= 80) return { l: 'A+', cls: 'grade-a', gp: 9  };
            if (total >= 70) return { l: 'A',  cls: 'grade-a', gp: 8  };
            if (total >= 60) return { l: 'B',  cls: 'grade-b', gp: 7  };
            if (total >= 50) return { l: 'C',  cls: 'grade-c', gp: 6  };
            return { l: 'F', cls: 'msg-error', gp: 0 };
        }

        function showToast(msg, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = msg;
            container.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 3000);
        }

        // Override showMsg to use Toasts if preferred, but leaving it for form errors
        function showMsg(id, text, typeClass) {
            if (id === 'modalMsg' || id === 'loginMsg' || id === 'searchMsg') {
                const box = document.getElementById(id);
                box.textContent = text;
                box.className = 'msg-box ' + typeClass;
                box.style.display = 'block';
                setTimeout(() => box.style.display = 'none', 4000);
            } else {
                showToast(text, typeClass.includes('error') ? 'error' : 'success');
            }
        }

        // ==========================================
        // THEME PERSISTENCE
        // ==========================================
        function applySavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            const btn = document.getElementById('themeBtn');
            if (savedTheme === 'light') {
                document.body.setAttribute('data-theme', 'light');
                if (btn) btn.innerHTML = 'ðŸŒ™ Dark';
            } else {
                document.body.removeAttribute('data-theme');
                if (btn) btn.innerHTML = 'â˜€ï¸ Light';
            }
        }
        document.addEventListener('DOMContentLoaded', applySavedTheme);

        // ==========================================
        // SESSION TIMEOUT
        // ==========================================
        let sessionTimer;
        let warningTimer;
        let countdownInterval;

        function resetSessionTimer() {
            if (!currentUser) return;
            clearTimeout(sessionTimer);
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            document.getElementById('sessionWarningModal').classList.remove('active');

            // Warning after 9 minutes (540s)
            warningTimer = setTimeout(showSessionWarning, 540 * 1000);
            // Logout after 10 minutes (600s)
            sessionTimer = setTimeout(handleAutoLogout, 600 * 1000);
        }

        function showSessionWarning() {
            let timeLeft = 60;
            const textEl = document.getElementById('sessionTimerText');
            textEl.textContent = timeLeft;
            document.getElementById('sessionWarningModal').classList.add('active');
            
            countdownInterval = setInterval(() => {
                timeLeft--;
                textEl.textContent = timeLeft;
                if (timeLeft <= 0) clearInterval(countdownInterval);
            }, 1000);
        }

        function extendSession() {
            resetSessionTimer();
        }

        function handleAutoLogout() {
            logout();
            showToast('Session expired due to inactivity. Please log in again.', 'warning');
        }

        // Reset timer on user activity
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, () => {
                if (currentUser && !document.getElementById('sessionWarningModal').classList.contains('active')) {
                    resetSessionTimer();
                }
            }, { passive: true });
        });

        // ==========================================
        // KEYBOARD NAVIGATION & AUTOCOMPLETE
        // ==========================================
        let allStudentsCache = null;
        let autocompleteTimeout;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeEditModal();
                if(typeof closeCompareModal === 'function') closeCompareModal();
                if(typeof closeDrillDown === 'function') closeDrillDown();
            }
        });

        async function fetchAllStudents() {
            if (allStudentsCache || !currentUser || currentUser.role !== 'admin') return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE}/student`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) allStudentsCache = await res.json();
            } catch (err) {}
        }

        function handleSearchInput(e) {
            clearTimeout(autocompleteTimeout);
            const val = e.target.value.trim();
            const list = document.getElementById('autocompleteList');
            if (!list) return;
            if (!val || !allStudentsCache) { list.style.display = 'none'; return; }
            
            autocompleteTimeout = setTimeout(() => {
                const matches = allStudentsCache.filter(s => s.regNo.includes(val) || s.name.toLowerCase().includes(val.toLowerCase()));
                if (matches.length > 0) {
                    list.innerHTML = matches.map(s => `<li onclick="selectAutocomplete('${s.regNo}')">${s.name} (${s.regNo})</li>`).join('');
                    list.style.display = 'block';
                } else {
                    list.style.display = 'none';
                }
            }, 300); // debounced
        }

        function selectAutocomplete(regNo) {
            document.getElementById('searchRegNo').value = regNo;
            document.getElementById('autocompleteList').style.display = 'none';
            fetchStudent();
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-group')) {
                const list = document.getElementById('autocompleteList');
                if (list) list.style.display = 'none';
            }
        });

        // ==========================================
        // ANIMATED STATS
        // ==========================================
        function animateValue(obj, start, end, duration, isFloat = false) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const current = progress * (end - start) + start;
                obj.textContent = isFloat ? current.toFixed(2) : Math.floor(current) + (obj.id === 'statAvg' ? '%' : '');
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }

        // Ripple effect
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.ripple-btn');
            if (!btn) return;
            const r = document.createElement('span');
            r.className = 'ripple';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            r.style.width = r.style.height = size + 'px';
            r.style.left = (e.clientX - rect.left - size / 2) + 'px';
            r.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
            btn.appendChild(r);
            setTimeout(() => r.remove(), 700);
        });

        // ==========================================
        // 3. AUTH
        // ==========================================
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();
            const btn  = document.getElementById('loginBtn');

            btn.innerHTML = '<span class="spinner"></span>';
            btn.disabled = true;

            await new Promise(r => setTimeout(r, 800));

            try {
                const res  = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    currentUser = data.user;
                    showToast('Logged in successfully', 'success');
                    loginSuccess();
                } else {
                    showMsg('loginMsg', data.error || 'Invalid credentials.', 'msg-error');
                }
            } catch {
                showMsg('loginMsg', 'Server error. Please try again.', 'msg-error');
            }
            btn.innerHTML = 'Sign In';
            btn.disabled = false;
        });

        function loginSuccess() {
            document.getElementById('loginSection').classList.remove('active');
            document.getElementById('dashboardSection').classList.add('active');
            document.getElementById('appNavbar').style.display = 'flex';
            document.getElementById('navAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
            renderDashboardStructure();
        }

        function logout() {
            clearTimeout(sessionTimer); clearTimeout(warningTimer); clearInterval(countdownInterval);
            document.getElementById('sessionWarningModal').classList.remove('active');
            localStorage.removeItem('token');
            currentUser = null; viewStudent = null;
            document.getElementById('dashboardSection').classList.remove('active');
            document.getElementById('appNavbar').style.display = 'none';
            document.getElementById('loginSection').classList.add('active');
            document.getElementById('loginForm').reset();
            document.getElementById('resultsWrapper').style.display = 'none';
            document.getElementById('statsRow').style.display = 'none';
        }

        // ==========================================
        // 4. DASHBOARD RENDER
        // ==========================================
        function renderDashboardStructure() {
            const middleMain = document.getElementById('middleMainCard');
            if (currentUser.role === 'admin') {
                document.getElementById('emptyState').style.display = 'block';
                document.getElementById('resultsWrapper').style.display = 'none';
                document.getElementById('statsRow').style.display = 'none';
                middleMain.innerHTML = `
                    <h2>Admin Search</h2>
                    <p class="info-text">Enter a student registration number to view or manage records.</p>
                    <div class="input-group" style="position: relative;">
                        <label>Registration Number</label>
                        <input type="text" id="searchRegNo" placeholder="e.g., 12510201"
                            onkeypress="if(event.key==='Enter') { document.getElementById('autocompleteList').style.display='none'; fetchStudent(); }" 
                            oninput="handleSearchInput(event)" autocomplete="off" />
                        <ul id="autocompleteList" class="autocomplete-list"></ul>
                    </div>
                    <button id="fetchBtn" class="btn ripple-btn" onclick="fetchStudent()">Fetch Record</button>
                    <button id="compareBtn" class="btn-ghost ripple-btn" onclick="openCompareModal()" style="margin-top: 10px;">Compare Students</button>
                    <div id="searchMsg" class="msg-box"></div>
                `;
                fetchAllStudents();
                fetchActivityLogs();
            } else {
                viewStudent = currentUser;
                document.getElementById('emptyState').style.display = 'none';
                renderStudentData();
            }
        }

        async function fetchStudent() {
            const regNo = document.getElementById('searchRegNo').value.trim();
            const btn   = document.getElementById('fetchBtn');
            if (!regNo) { showMsg('searchMsg', 'Please enter a Registration Number.', 'msg-error'); return; }

            btn.innerHTML = '<span class="spinner"></span>';
            btn.disabled = true;

            // Show skeleton UI
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('resultsWrapper').style.display = 'block';
            document.getElementById('statsRow').style.display = 'grid';
            document.getElementById('middleMainCard').innerHTML = '<div class="skeleton-box" style="height: 120px;"></div>';
            document.getElementById('marksTableBody').innerHTML = Array(5).fill('<tr>' + '<td class="skeleton-box" style="height:20px; margin:5px;"></td>'.repeat(7) + '</tr>').join('');
            document.getElementById('statAvg').textContent = '--';
            document.getElementById('statBest').textContent = '--';
            document.getElementById('statGrade').textContent = '--';

            await new Promise(r => setTimeout(r, 800)); // Artificial delay for skeleton demo
            btn.innerHTML = 'Fetch Record';
            btn.disabled = false;

            try {
                const token = localStorage.getItem('token');
                const res   = await fetch(`${API_BASE}/student/${regNo}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    viewStudent = data;
                    showMsg('searchMsg', 'Record found.', 'msg-success');
                    renderStudentData();
                } else {
                    document.getElementById('emptyState').style.display = 'block';
                    document.getElementById('resultsWrapper').style.display = 'none';
                    document.getElementById('statsRow').style.display = 'none';
                    showMsg('searchMsg', data.error || 'No record found.', 'msg-error');
                }
            } catch {
                document.getElementById('emptyState').style.display = 'block';
                document.getElementById('resultsWrapper').style.display = 'none';
                document.getElementById('statsRow').style.display = 'none';
                showMsg('searchMsg', 'Server error while fetching record.', 'msg-error');
            }
        }

        function renderStudentData() {
            // REFINED: Fade content in on render
            if (currentUser.role === 'admin') {
                const card = document.getElementById('middleMainCard');
                if (!document.getElementById('stdInfoGrid')) {
                    const grid = document.createElement('div');
                    grid.id = 'stdInfoGrid';
                    grid.className = 'info-grid fade-content';
                    card.appendChild(grid);
                }
                document.getElementById('stdInfoGrid').innerHTML = `
                    <div class="info-item"><label>Name</label><div>${viewStudent.name}</div></div>
                    <div class="info-item"><label>Semester</label><div>${viewStudent.semester}</div></div>
                `;
            } else {
                document.getElementById('middleMainCard').innerHTML = `
                    <h2>Your Profile</h2>
                    <div class="info-grid fade-content" style="margin-top:0;">
                        <div class="info-item"><label>Name</label><div>${viewStudent.name}</div></div>
                        <div class="info-item"><label>Reg No</label><div>${viewStudent.regNo}</div></div>
                        <div class="info-item"><label>Semester</label><div>${viewStudent.semester}</div></div>
                        <div class="info-item"><label>Attendance</label><div>${viewStudent.attendance}</div></div>
                    </div>
                `;
            }

            document.getElementById('resultsWrapper').style.display = 'block';
            document.getElementById('statsRow').style.display = 'grid';
            document.getElementById('adminEditBtn').style.display = currentUser.role === 'admin' ? 'block' : 'none';

            const tbody = document.getElementById('marksTableBody');
            tbody.innerHTML = '';
            let totalOverall = 0, totalGp = 0, bestSubj = '', bestScore = -1;

            subjectsList.forEach(subj => {
                const marks = viewStudent.marks[subj];
                const total = marks.ca1 + marks.ca2 + marks.mte + marks.ete;
                const grade = calculateGrade(total);
                totalOverall += total;
                totalGp += grade.gp;
                if (total > bestScore) { bestScore = total; bestSubj = subj; }
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight:600; color:var(--text-main);">${subj}</td>
                        <td>${marks.ca1}</td><td>${marks.ca2}</td>
                        <td>${marks.mte}</td><td>${marks.ete}</td>
                        <td style="font-weight:600;">${total}</td>
                        <td><span class="badge ${grade.cls}">${grade.l}</span></td>
                    </tr>`;
            });

            const avg = (totalOverall / subjectsList.length);
            const gpa = (totalGp / subjectsList.length);
            
            animateValue(document.getElementById('statAvg'), 0, avg, 800, true);
            document.getElementById('statBest').textContent = bestSubj.split(' ')[0];
            animateValue(document.getElementById('statGrade'), 0, gpa, 800, true);

            // Fetch actual AI Recommendations
            analyzeStudent();
            if(document.getElementById('analyticsContainer').style.display === 'block') {
                renderCharts();
            }
            // Add ETE Predictor
            let predictedEteSum = 0;
            let currentMarksSum = 0;
            subjectsList.forEach(subj => {
                const marks = viewStudent.marks[subj];
                const caMte = marks.ca1 + marks.ca2 + marks.mte;
                currentMarksSum += caMte;
                // Simple historical weight: if they got X out of 50 so far, predict they'll get slightly better out of 50 for ETE
                predictedEteSum += (caMte / 50) * 50 * 1.05; 
            });
            const predictedEteAvg = Math.min((predictedEteSum / subjectsList.length), 50).toFixed(1);
            
            const aiContainer = document.getElementById('aiRecommendations');
            if(currentUser.role === 'student' || viewStudent) {
                aiContainer.innerHTML = `<div style="padding: 15px; border-radius: 8px; background: var(--surface); color: var(--text-dim);">
                    <strong>Predicted Average ETE Score:</strong> ${predictedEteAvg} / 50
                </div><div id="aiAnalysisText"></div>`;
            }

        }

        async function analyzeStudent() {
            const aiContainer = document.getElementById('aiAnalysisText');
            if(!aiContainer) return;
            aiContainer.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.9rem;">Generating AI insights... <span class="spinner" style="display:inline-block; width:12px; height:12px; border-width:2px; border-color:var(--text-muted) transparent transparent transparent;"></span></div>';
            
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/ai-analysis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ studentData: viewStudent.marks })
                });
                const data = await res.json();
                
                if (res.ok && data.analysis) {
                    aiContainer.innerHTML = `
                        <div style="padding:14px 16px; border-radius:10px; background:var(--surface); border:1px solid var(--border); border-left:3px solid var(--primary); margin-top: 10px;">
                            <span style="font-size:0.92rem; color:var(--text-main); line-height:1.6;">
                                ${data.analysis.replace(/\n/g, '<br>')}
                            </span>
                        </div>`;
                } else {
                    aiContainer.innerHTML = `<div class="msg-box msg-error" style="margin-top: 10px;">AI Analysis unavailable.</div>`;
                }
            } catch (e) {
                aiContainer.innerHTML = `<div class="msg-box msg-error" style="margin-top: 10px;">Server error generating analysis.</div>`;
            }

            const sphereBtn = document.getElementById('sphereBtn');
            const chartsRow = document.getElementById('chartsRow');
            if (sphereBtn) sphereBtn.classList.remove('hidden');
            if (chartsRow) chartsRow.classList.remove('visible');
            renderCharts();
        }

        function revealAnalytics() {
            document.getElementById('sphereBtn').classList.add('hidden');
            setTimeout(() => {
                document.getElementById('chartsRow').classList.add('visible');
            }, 350);
        }

        // ==========================================
        // 5. CHARTS â€” REFINED: Calmer palette
        // ==========================================
        function renderCharts() {
            const isLight  = document.body.getAttribute('data-theme') === 'light';
            const textMuted = isLight ? '#6b6b7b' : '#7a7a8c';
            const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

            Chart.defaults.color = textMuted;
            Chart.defaults.font.family = 'DM Sans';
            Chart.defaults.font.size = 12;

            const primary = '#e8621a';
            const labels  = subjectsList;
            const totals  = labels.map(s => { const m = viewStudent.marks[s]; return m.ca1+m.ca2+m.mte+m.ete; });
            const caTotal = labels.map(s => viewStudent.marks[s].ca1 + viewStudent.marks[s].ca2);
            const mteData = labels.map(s => viewStudent.marks[s].mte);
            const eteData = labels.map(s => viewStudent.marks[s].ete);

            // Bar
            if (barChartInst) barChartInst.destroy();
            barChartInst = new Chart(document.getElementById('barChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Total',
                        data: totals,
                        backgroundColor: 'rgba(232,98,26,0.35)',
                        borderColor: primary,
                        borderWidth: 1.5,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    onClick: (e, elements) => {
                        if (!elements.length || currentUser.role !== 'admin') return;
                        const subjectIndex = elements[0].index;
                        const subject = labels[subjectIndex];
                        if(typeof openDrillDown === 'function') openDrillDown(subject);
                    },
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: gridColor }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false } }
                    },
                    plugins: { legend: { display: false } },
                    animation: { duration: 600, easing: 'easeOutQuart' }
                }
            });

            // Radar
            let radarChartInst = Chart.getChart('radarChart');
            if (radarChartInst) radarChartInst.destroy();
            radarChartInst = new Chart(document.getElementById('radarChart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Scores',
                        data: totals,
                        backgroundColor: 'rgba(232,98,26,0.2)',
                        borderColor: primary,
                        pointBackgroundColor: primary,
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        r: { 
                            angleLines: { color: gridColor }, 
                            grid: { color: gridColor }, 
                            pointLabels: { color: textMuted }, 
                            ticks: { display: false, max: 100, min: 0 } 
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // Line (Assessment Trend per Subject)
            if (lineChartInst) lineChartInst.destroy();
            const assessLabels = ['CA (30)', 'MTE (20)', 'ETE (50)'];
            const lineColors = ['#e8621a', '#38b6cb', '#d4a017', '#2eb87a', '#a638cb', '#38cb65'];
            const subjectDatasets = subjectsList.map((subj, i) => {
                const marks = viewStudent.marks[subj];
                return {
                    label: subj,
                    data: [marks.ca1 + marks.ca2, marks.mte, marks.ete],
                    borderColor: lineColors[i % lineColors.length],
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                };
            });

            lineChartInst = new Chart(document.getElementById('lineChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: assessLabels,
                    datasets: subjectDatasets
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: { beginAtZero: true, grid: { color: gridColor }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false } }
                    },
                    plugins: {
                        legend: { position: 'right', labels: { boxWidth: 10, font: {size: 10} } },
                        tooltip: {
                            backgroundColor: 'rgba(11,11,20,0.92)',
                            titleFont: { size: 13, weight: '600' },
                            bodyFont:  { size: 12 },
                            padding: 12,
                            cornerRadius: 10
                        }
                    },
                    animation: { duration: 600, easing: 'easeOutQuart' }
                }
            });

            // Donut
            const totalCA  = caTotal.reduce((a,b) => a+b, 0);
            const totalMTE = mteData.reduce((a,b) => a+b, 0);
            const totalETE = eteData.reduce((a,b) => a+b, 0);

            if (pieChartInst) pieChartInst.destroy();
            pieChartInst = new Chart(document.getElementById('pieChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['CA Total', 'MTE Total', 'ETE Total'],
                    datasets: [{
                        data: [totalCA, totalMTE, totalETE],
                        backgroundColor: ['rgba(56,182,203,0.6)', 'rgba(212,160,23,0.6)', 'rgba(46,184,122,0.6)'],
                        borderColor:     ['#38b6cb', '#d4a017', '#2eb87a'],
                        borderWidth: 1.5,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '62%',
                    animation: { animateScale: true, animateRotate: true, duration: 700, easing: 'easeOutQuart' }
                }
            });
        }

        // ==========================================
        // 6. MODAL (ADMIN)
        // ==========================================
        function openEditModal() {
            if (!viewStudent) return;
            const sel = document.getElementById('editSubject');
            sel.innerHTML = '';
            subjectsList.forEach(s => sel.innerHTML += `<option value="${s}">${s}</option>`);
            loadSubjectMarksForEdit();
            document.getElementById('editModal').style.display = 'flex';
        }
        function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }
        function loadSubjectMarksForEdit() {
            const subj  = document.getElementById('editSubject').value;
            const marks = viewStudent.marks[subj];
            document.getElementById('editCa1').value = marks.ca1;
            document.getElementById('editCa2').value = marks.ca2;
            document.getElementById('editMte').value  = marks.mte;
            document.getElementById('editEte').value  = marks.ete;
            updateLivePreview();
        }

        ['editCa1', 'editCa2', 'editMte', 'editEte'].forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', () => {
                    const val = Number(el.value);
                    const max = Number(el.getAttribute('max'));
                    if(val < 0 || val > max) {
                        el.classList.add('error');
                        if(id === 'editEte') document.getElementById('eteError').style.display = 'block';
                    } else {
                        el.classList.remove('error');
                        if(id === 'editEte') document.getElementById('eteError').style.display = 'none';
                    }
                    updateLivePreview();
                });
            }
        });

        function updateLivePreview() {
            const c1 = Number(document.getElementById('editCa1').value) || 0;
            const c2 = Number(document.getElementById('editCa2').value) || 0;
            const m = Number(document.getElementById('editMte').value) || 0;
            const e = Number(document.getElementById('editEte').value) || 0;
            const total = c1 + c2 + m + e;
            const grade = calculateGrade(total);
            document.getElementById('livePreviewTotal').textContent = `Total: ${total} / 100`;
            document.getElementById('livePreviewGrade').textContent = `Grade: ${grade.l}`;
            document.getElementById('livePreviewGrade').className = grade.cls;
        }

        function saveSubjectMarks() {
            const subj = document.getElementById('editSubject').value;
            const c1 = Number(document.getElementById('editCa1').value);
            const c2 = Number(document.getElementById('editCa2').value);
            const m  = Number(document.getElementById('editMte').value);
            const e  = Number(document.getElementById('editEte').value);
            
            let hasError = false;
            if(c1<0||c1>15) { document.getElementById('editCa1').classList.add('error'); hasError = true; }
            if(c2<0||c2>15) { document.getElementById('editCa2').classList.add('error'); hasError = true; }
            if(m<0||m>20) { document.getElementById('editMte').classList.add('error'); hasError = true; }
            if(e<0||e>50) { document.getElementById('editEte').classList.add('error'); document.getElementById('eteError').style.display='block'; hasError = true; }
            
            if (hasError) {
                showMsg('modalMsg', 'Please fix the highlighted errors.', 'msg-error'); return;
            }
            
            const token = localStorage.getItem('token');
            fetch(`${API_BASE}/student/${viewStudent.regNo}/marks`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subject: subj, marks: { ca1: c1, ca2: c2, mte: m, ete: e } })
            })
            .then(r => r.json())
            .then(data => {
                if (data.error) { showMsg('modalMsg', data.error, 'msg-error'); }
                else {
                    viewStudent.marks[subj] = { ca1: c1, ca2: c2, mte: m, ete: e };
                    showToast('Marks updated successfully.', 'success');
                    fetchActivityLogs();
                    setTimeout(() => { closeEditModal(); renderStudentData(); }, 900);
                }
            })
            .catch(() => showMsg('modalMsg', 'Server error. Failed to update.', 'msg-error'));
        }

        // ==========================================
        // 7. NEW UTILITIES
        // ==========================================
        let sortDirection = {};
        function sortTable(n, type) {
            const table = document.getElementById('marksTable');
            const tbody = document.getElementById('marksTableBody');
            let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
            switching = true;
            dir = sortDirection[n] === "asc" ? "desc" : "asc";
            sortDirection[n] = dir;
            
            while (switching) {
                switching = false;
                rows = tbody.rows;
                for (i = 0; i < (rows.length - 1); i++) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName("TD")[n];
                    y = rows[i + 1].getElementsByTagName("TD")[n];
                    
                    let cmpX = type === 'number' ? Number(x.innerHTML) : x.innerHTML.toLowerCase();
                    let cmpY = type === 'number' ? Number(y.innerHTML) : y.innerHTML.toLowerCase();
                    
                    if (dir == "asc") { if (cmpX > cmpY) { shouldSwitch = true; break; } }
                    else { if (cmpX < cmpY) { shouldSwitch = true; break; } }
                }
                if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    switchcount++;
                }
            }
        }

        let isFailingOnly = false;
        function toggleFailingOnly() {
            isFailingOnly = !isFailingOnly;
            const btn = document.getElementById('filterFailingBtn');
            btn.innerHTML = isFailingOnly ? 'Show All' : 'Failing Only';
            btn.style.color = isFailingOnly ? 'var(--danger)' : '';
            btn.style.borderColor = isFailingOnly ? 'var(--danger)' : 'var(--border)';
            
            const tbody = document.getElementById('marksTableBody');
            for(let row of tbody.rows) {
                const total = Number(row.getElementsByTagName("TD")[5].innerHTML);
                if(isFailingOnly && total < 40) row.style.display = '';
                else if(isFailingOnly) row.style.display = 'none';
                else row.style.display = '';
            }
        }

        function toggleExportMenu() { document.getElementById("exportDropdown").classList.toggle("show"); }
        window.onclick = function(event) {
            if (!event.target.matches('.btn-ghost') && !event.target.closest('.dropdown')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                for (var i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.style.display === 'block' || openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        function exportPDF() {
            if(typeof html2pdf === 'undefined') { showToast('PDF library still loading...', 'warning'); return; }
            const element = document.getElementById('resultsWrapper');
            const opt = { margin: 0.5, filename: `Transcript_${viewStudent.regNo}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
            html2pdf().set(opt).from(element).save();
            showToast('Downloading PDF...', 'success');
        }

        function exportCSV() {
            let csv = 'Subject,CA1,CA2,MTE,ETE,Total,Grade\n';
            subjectsList.forEach(subj => {
                const marks = viewStudent.marks[subj];
                const total = marks.ca1 + marks.ca2 + marks.mte + marks.ete;
                csv += `${subj},${marks.ca1},${marks.ca2},${marks.mte},${marks.ete},${total},${calculateGrade(total).l}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', `Transcript_${viewStudent.regNo}.csv`);
            a.click();
            showToast('Downloading CSV...', 'success');
        }

        function copyTable() {
            let text = 'Subject\tCA1\tCA2\tMTE\tETE\tTotal\n';
            subjectsList.forEach(subj => {
                const marks = viewStudent.marks[subj];
                text += `${subj}\t${marks.ca1}\t${marks.ca2}\t${marks.mte}\t${marks.ete}\t${marks.ca1+marks.ca2+marks.mte+marks.ete}\n`;
            });
            navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!', 'success'));
        }

        async function fetchActivityLogs() {
            if(!currentUser || currentUser.role !== 'admin') return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/activity`, { headers: { 'Authorization': `Bearer ${token}` } });
                const logs = await res.json();
                if(res.ok && logs.length > 0) {
                    document.getElementById('activityLogPanel').style.display = 'block';
                    const content = document.getElementById('activityLogContent');
                    content.innerHTML = logs.map(l => `<div class="log-item"><span class="log-time">${new Date(l.timestamp).toLocaleTimeString()}</span> ${l.action}</div>`).join('');
                }
            } catch (e) {}
        }

        let compareChartInst = null;
        function openCompareModal() {
            if(!allStudentsCache) { showToast('Loading students...', 'warning'); fetchAllStudents().then(openCompareModal); return; }
            const s1 = document.getElementById('compareS1');
            const s2 = document.getElementById('compareS2');
            s1.innerHTML = '<option value="">Select Student 1</option>' + allStudentsCache.map(s => `<option value="${s.regNo}">${s.name} (${s.regNo})</option>`).join('');
            s2.innerHTML = '<option value="">Select Student 2</option>' + allStudentsCache.map(s => `<option value="${s.regNo}">${s.name} (${s.regNo})</option>`).join('');
            if(viewStudent) { s1.value = viewStudent.regNo; }
            document.getElementById('compareModal').style.display = 'flex';
        }

        function closeCompareModal() { document.getElementById('compareModal').style.display = 'none'; }

        function renderCompareChart() {
            const reg1 = document.getElementById('compareS1').value;
            const reg2 = document.getElementById('compareS2').value;
            if(!reg1 || !reg2) return;
            const s1 = allStudentsCache.find(s => s.regNo === reg1);
            const s2 = allStudentsCache.find(s => s.regNo === reg2);
            
            const t1 = subjectsList.map(subj => s1.marks[subj].ca1 + s1.marks[subj].ca2 + s1.marks[subj].mte + s1.marks[subj].ete);
            const t2 = subjectsList.map(subj => s2.marks[subj].ca1 + s2.marks[subj].ca2 + s2.marks[subj].mte + s2.marks[subj].ete);

            if(compareChartInst) compareChartInst.destroy();
            const gridColor = document.body.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
            compareChartInst = new Chart(document.getElementById('compareChartCanvas').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: subjectsList,
                    datasets: [
                        { label: s1.name, data: t1, backgroundColor: 'rgba(232,98,26,0.8)' },
                        { label: s2.name, data: t2, backgroundColor: 'rgba(56,182,203,0.8)' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, grid: { color: gridColor } }, x: { grid: { display: false } } } }
            });
        }

        let drillDownChartInst = null;
        function openDrillDown(subject) {
            if(!allStudentsCache) { fetchAllStudents().then(() => openDrillDown(subject)); return; }
            document.getElementById('drillDownTitle').textContent = `Class Stats: ${subject}`;
            const scores = allStudentsCache.map(s => {
                const m = s.marks[subject];
                if (!m) return { name: s.name, total: 0 };
                return { name: s.name, total: m.ca1 + m.ca2 + m.mte + m.ete };
            }).sort((a,b) => b.total - a.total);

            if(drillDownChartInst) drillDownChartInst.destroy();
            const gridColor = document.body.getAttribute('data-theme') === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
            drillDownChartInst = new Chart(document.getElementById('drillDownCanvas').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: scores.map(s => s.name.split(' ')[0]),
                    datasets: [{ label: 'Total', data: scores.map(s => s.total), backgroundColor: 'rgba(212,160,23,0.8)' }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, grid: { color: gridColor } }, x: { grid: { display: false } } } }
            });
            document.getElementById('drillDownModal').style.display = 'flex';
        }

        function closeDrillDown() { document.getElementById('drillDownModal').style.display = 'none'; }

        // ==========================================
        // 7. UI UTILITIES
        // ==========================================
        function switchTab(tab) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            event.target.classList.add('active');
        }

        // REFINED: Dual-ring cursor with smooth lag
        const cursor     = document.getElementById('customCursor');
        const cursorRing = document.getElementById('cursorRing');
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let ringX = mouseX, ringY = mouseY;

        if (window.innerWidth > 768) {
            window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
            window.addEventListener('mousedown', () => { cursor.classList.add('clicking'); cursorRing.classList.add('clicking'); });
            window.addEventListener('mouseup',   () => { cursor.classList.remove('clicking'); cursorRing.classList.remove('clicking'); });

            document.querySelectorAll('button, a, .nav-item, .sphere-container, .stat-card, .info-item, .theme-toggle, .profile-dropdown, .nav-item, .close-btn').forEach(el => {
                el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); cursorRing.classList.add('hovering'); });
                el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); cursorRing.classList.remove('hovering'); });
            });

            function animateCursor() {
                // Dot snaps fast, ring lags for feel
                cursor.style.transform     = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
                ringX += (mouseX - ringX) * 0.12;
                ringY += (mouseY - ringY) * 0.12;
                cursorRing.style.transform = `translate3d(calc(${ringX}px - 50%), calc(${ringY}px - 50%), 0)`;
                requestAnimationFrame(animateCursor);
            }
            animateCursor();
        }

        // REFINED: Canvas â€” dimmer particles, no heavy glow lines
        const canvas = document.getElementById('bgCanvas');
        const ctx    = canvas.getContext('2d');
        let width, height, particles, shootingStars;

        function initCanvas() {
            width  = canvas.width  = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = []; shootingStars = [];
            if (width < 768) return;
            const count = Math.floor((width * height) / 16000);
            for (let i = 0; i < count; i++) {
                const bx = Math.random() * width, by = Math.random() * height;
                particles.push({
                    x: bx, y: by, baseX: bx, baseY: by,
                    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.4,
                    alpha: Math.random(), alphaSpeed: (Math.random() * 0.012) + 0.004
                });
            }
        }

        function drawParticles() {
            if (width < 768) return;
            ctx.clearRect(0, 0, width, height);
            const isLight  = document.body.getAttribute('data-theme') === 'light';
            // REFINED: Much dimmer particle colors
            const pr = isLight ? 180 : 220, pg = isLight ? 80 : 120, pb = isLight ? 20 : 80;
            const lineOpacity = isLight ? 0.06 : 0.07;

            particles.forEach(p => {
                const dx = mouseX - p.x, dy = mouseY - p.y;
                const dist = Math.hypot(dx, dy);

                // Gentle gravity â€” not aggressive swirl
                if (dist < 250 && dist > 50) {
                    p.x += dx * 0.012;
                    p.y += dy * 0.012;
                } else {
                    const bdx = p.baseX - p.x, bdy = p.baseY - p.y;
                    p.x += bdx * 0.06; p.y += bdy * 0.06;
                    p.baseX += p.vx; p.baseY += p.vy;
                    if (p.baseX < 0) p.baseX = width;  if (p.baseX > width)  p.baseX = 0;
                    if (p.baseY < 0) p.baseY = height; if (p.baseY > height) p.baseY = 0;
                }
                p.alpha += p.alphaSpeed;
                if (p.alpha > 1 || p.alpha < 0.15) p.alphaSpeed = -p.alphaSpeed;

                ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.alpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Lines between nearby particles â€” very subtle
            ctx.strokeStyle = `rgba(${isLight ? '180,80,20' : '220,120,80'},${lineOpacity})`;
            for (let i = 0; i < particles.length; i++) {
                // Mouse connection
                const dmx = mouseX - particles[i].x, dmy = mouseY - particles[i].y;
                const distM = Math.hypot(dmx, dmy);
                if (distM < 140) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouseX, mouseY);
                    ctx.lineWidth = (1 - distM / 140) * 0.8; ctx.stroke();
                }
                for (let j = i + 1; j < particles.length; j++) {
                    const ddx = particles[i].x - particles[j].x, ddy = particles[i].y - particles[j].y;
                    if (Math.abs(ddx) > 70 || Math.abs(ddy) > 70) continue;
                    const d = Math.hypot(ddx, ddy);
                    if (d < 70) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.lineWidth = 0.6 * (1 - d / 70); ctx.stroke();
                    }
                }
            }

            // Shooting stars â€” less frequent, more graceful
            if (Math.random() < 0.008 && shootingStars.length < 2) {
                shootingStars.push({
                    x: Math.random() * width * 1.5, y: -40,
                    vx: -(Math.random() * 8 + 12), vy: Math.random() * 8 + 12,
                    length: Math.random() * 120 + 80, life: 1, decay: Math.random() * 0.012 + 0.008
                });
            }
            shootingStars.forEach((star, idx) => {
                star.x += star.vx; star.y += star.vy; star.life -= star.decay;
                if (star.life <= 0) { shootingStars.splice(idx, 1); return; }
                ctx.beginPath();
                const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.vx * 10, star.y - star.vy * 10);
                grad.addColorStop(0, `rgba(255,255,255,${star.life * 0.7})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
                ctx.moveTo(star.x, star.y); ctx.lineTo(star.x - star.vx * 10, star.y - star.vy * 10);
                ctx.stroke();
            });

            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas(); drawParticles();

        function toggleTheme() {
            const btn = document.getElementById('themeBtn');
            if (document.body.getAttribute('data-theme') === 'light') {
                document.body.removeAttribute('data-theme');
                btn.innerHTML = 'â˜€ï¸ Light';
            } else {
                document.body.setAttribute('data-theme', 'light');
                btn.innerHTML = 'ðŸŒ™ Dark';
            }
            if (viewStudent) renderCharts();
        }
    </script>
</body>
</html>
