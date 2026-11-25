const pageCopy = {
      dashboard: 'Dashboard',
      repository: 'Repository',
      submission: 'Submission',
      ai: 'AI Tools',
      analytics: 'Analytics',
      security: 'Security'
    };

    const repositoryCategories = ['CCS', 'CED', 'CBAA', 'CCJE', 'CN'];
    const repositorySchoolYears = Array.from({ length: 17 }, (_, index) => {
      const start = 2010 + index;
      return `${start}-${start + 1}`;
    });

    const navButtons = document.querySelectorAll('.nav button');
    const views = document.querySelectorAll('.view');
    const roleRestrictedElements = document.querySelectorAll('[data-role]');
    const title = document.getElementById('pageTitle');
    const submissionForm = document.getElementById('submissionForm');
    const adviserSelect = document.getElementById('adviser');
    const repositoryList = document.getElementById('repositoryList');
    const activityBody = document.getElementById('activityBody');
    const formStatus = document.getElementById('formStatus');
    const runPrecheck = document.getElementById('runPrecheck');
    const analyzeSubmission = document.getElementById('analyzeSubmission');
    const classificationBadge = document.getElementById('classificationBadge');
    const plagiarismSources = document.getElementById('plagiarismSources');
    const plagiarismSourcesAi = document.getElementById('plagiarismSourcesAi');
    const citationRecommendations = document.getElementById('citationRecommendations');
    const citationRecommendationsAi = document.getElementById('citationRecommendationsAi');
    const openHeatmap = document.getElementById('openHeatmap');
    const closeHeatmap = document.getElementById('closeHeatmap');
    const heatmapModal = document.getElementById('heatmapModal');
    const heatmapPreview = document.getElementById('heatmapPreview');
    const heatmapLarge = document.getElementById('heatmapLarge');
    const archivedAnalysisModal = document.getElementById('archivedAnalysisModal');
    const closeArchivedAnalysis = document.getElementById('closeArchivedAnalysis');
    const archivedAnalysisSelect = document.getElementById('archivedAnalysisSelect');
    const archivedAnalysisSearch = document.getElementById('archivedAnalysisSearch');
    const archivedAnalysisMatches = document.getElementById('archivedAnalysisMatches');
    const archivedDepartmentTabs = document.querySelectorAll('[data-archived-department-tab]');
    const runArchivedAnalysis = document.getElementById('runArchivedAnalysis');
    const archivedAnalysisStatus = document.getElementById('archivedAnalysisStatus');
    const notificationButton = document.getElementById('notificationButton');
    const notificationMenu = document.getElementById('notificationMenu');
    const notificationCount = document.getElementById('notificationCount');
    const notificationTotal = document.getElementById('notificationTotal');
    const notificationList = document.getElementById('notificationList');
    const dashboardLinks = document.querySelectorAll('[data-dashboard-view]');
    const repositorySearchButton = document.getElementById('repositorySearchButton');
    const departmentTabs = document.querySelectorAll('[data-department-tab]');
    const repositoryQuery = document.getElementById('repositoryQuery');
    const repositoryCategory = document.getElementById('repositoryCategory');
    const repositorySchoolYear = document.getElementById('repositorySchoolYear');
    const repositoryStatus = document.getElementById('repositoryStatus');
    const globalSearch = document.getElementById('globalSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const previousSearchPage = document.getElementById('previousSearchPage');
    const nextSearchPage = document.getElementById('nextSearchPage');
    const searchPageStatus = document.getElementById('searchPageStatus');
    const categoryReports = document.getElementById('categoryReports');
    const analyzeAi = document.getElementById('analyzeAi');
    const adminUsersBody = document.getElementById('adminUsersBody');
    const reviewerAssignments = document.getElementById('reviewerAssignments');
    const publishQueue = document.getElementById('publishQueue');
    const dashboardPublishQueue = document.getElementById('dashboardPublishQueue');
    const adminAuditLogs = document.getElementById('adminAuditLogs');
    const refreshAdminPanel = document.getElementById('refreshAdminPanel');
    const adminRefreshStatus = document.getElementById('adminRefreshStatus');
    const setupMfa = document.getElementById('setupMfa');
    const mfaStatus = document.getElementById('mfaStatus');
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.getElementById('loginStatus');
    const openRegister = document.getElementById('openRegister');
    const closeRegister = document.getElementById('closeRegister');
    const registerModal = document.getElementById('registerModal');
    const registerForm = document.getElementById('registerForm');
    const registerStatus = document.getElementById('registerStatus');
    const openPasswordReset = document.getElementById('openPasswordReset');
    const closePasswordReset = document.getElementById('closePasswordReset');
    const passwordResetModal = document.getElementById('passwordResetModal');
    const passwordResetRequestForm = document.getElementById('passwordResetRequestForm');
    const passwordResetRequestStatus = document.getElementById('passwordResetRequestStatus');
    const passwordResetForm = document.getElementById('passwordResetForm');
    const passwordResetStatus = document.getElementById('passwordResetStatus');
    const logoutButton = document.getElementById('logoutButton');
    const currentUserName = document.querySelectorAll('[data-current-user-name]');
    const currentUserRole = document.querySelectorAll('[data-current-user-role]');
    const currentUserInitials = document.querySelectorAll('[data-current-user-initials]');
    const databaseKey = 'edataBankingDatabase';
    const defaultHeatmapScores = [12, 18, 9, 24, 16, 30, 11, 21, 26, 14, 19, 34, 17, 22, 28, 13];
    const defaultUsers = [];
    let apiToken = '';
    let notificationRefreshTimer = null;
    let notificationUnreadCount = 0;
    const database = loadDatabase();
    const records = database.manuscripts;
    const notifications = database.notifications;
    const auditLogs = database.auditLogs;
    let heatmapScores = database.heatmapScores;
    let archivedAnalysisRecords = [];
    let archivedDepartmentFilter = '';
    let archivedSelectedId = '';
    const searchState = { page: 1, pageSize: 10, totalPages: 1, total: 0 };

    function loadDatabase() {
      const emptyDatabase = {
        users: defaultUsers,
        session: null,
        manuscripts: [],
        notifications: [],
        auditLogs: [],
        aiReports: [],
        workflow: [],
        citations: [],
        heatmapScores: [...defaultHeatmapScores],
        aiByUser: {},
        ai: {
          originality: 0,
          suggestions: 0,
          related: 0,
          classification: 'Ready'
        }
      };

      try {
        const savedDatabase = JSON.parse(localStorage.getItem(databaseKey));
        const savedUsers = Array.isArray(savedDatabase?.users) ? savedDatabase.users : defaultUsers;
        const normalizedUsers = savedUsers
          .filter((user) => user.role !== 'researcher')
          .map((user) => {
            if (user.role === 'student') {
              return { ...user, role: 'student_researcher', portal: 'Student Researcher Portal' };
            }
            return user;
          });
        const normalizedSession = savedDatabase?.session
          ? {
              ...savedDatabase.session,
              role: ['student', 'researcher'].includes(savedDatabase.session.role)
                ? 'student_researcher'
                : savedDatabase.session.role
            }
          : null;

        return {
          ...emptyDatabase,
          ...savedDatabase,
          users: normalizedUsers,
          session: normalizedSession,
          manuscripts: [],
          notifications: Array.isArray(savedDatabase?.notifications) ? savedDatabase.notifications : [],
          auditLogs: Array.isArray(savedDatabase?.auditLogs) ? savedDatabase.auditLogs : [],
          aiReports: Array.isArray(savedDatabase?.aiReports) ? savedDatabase.aiReports : [],
          workflow: Array.isArray(savedDatabase?.workflow) ? savedDatabase.workflow : [],
          citations: Array.isArray(savedDatabase?.citations) ? savedDatabase.citations : [],
          heatmapScores: Array.isArray(savedDatabase?.heatmapScores) ? savedDatabase.heatmapScores : [...defaultHeatmapScores],
          aiByUser: savedDatabase?.aiByUser && typeof savedDatabase.aiByUser === 'object' ? savedDatabase.aiByUser : {},
          ai: {
            ...emptyDatabase.ai,
            ...(savedDatabase?.ai || {})
          }
        };
      } catch (error) {
        return emptyDatabase;
      }
    }

    function saveDatabase() {
      database.notifications = notifications;
      database.auditLogs = auditLogs;
      database.heatmapScores = heatmapScores;
      localStorage.setItem(databaseKey, JSON.stringify(database));
    }

    async function apiRequest(path, options = {}) {
      const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
        const csrf = document.cookie.split('; ').find((item) => item.startsWith('edata_csrf='))?.split('=').slice(1).join('=');
        if (csrf) headers['X-CSRF-Token'] = decodeURIComponent(csrf);
      }
      const response = await fetch(`/api${path}`, { ...options, headers, credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'The server request failed.');
      return payload;
    }

    async function hydrateFromApi(params = '') {
      await hydrateRepositoryFilters();
      const payload = await apiRequest(`/manuscripts${params}`);
      records.splice(0, records.length, ...payload.manuscripts);
      Object.assign(searchState, payload.pagination || {});
      updateSearchPagination();
      renderRecords();
      updateDashboard();
      await hydrateNotifications();
      await hydrateAnalytics();
      if (hasRole('admin')) {
        try { await hydrateAdminPanel(); } catch (error) { console.error('Admin panel refresh failed:', error); }
      }
    }

    async function hydrateRepositoryFilters() {
      if (!repositoryCategory || !repositorySchoolYear || !repositoryStatus) return;
      const selected = {
        category: repositoryCategory.value,
        schoolYear: repositorySchoolYear.value,
        status: repositoryStatus.value
      };
      const payload = await apiRequest('/manuscripts/filters');
      const fill = (select, values, key, allLabel) => {
        select.innerHTML = `<option value="">${allLabel}</option>`;
        values.forEach((value) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
        if (values.includes(selected[key])) select.value = selected[key];
      };
      fill(repositoryCategory, repositoryCategories, 'category', 'All Categories');
      fill(repositorySchoolYear, repositorySchoolYears, 'schoolYear', 'All School Years');
      fill(repositoryStatus, payload.statuses, 'status', 'All Statuses');
      updateDepartmentTabs();
    }

    function updateDepartmentTabs() {
      departmentTabs.forEach((tab) => {
        const selected = tab.dataset.departmentTab === (repositoryCategory?.value || '');
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
    }

    function updateSearchPagination() {
      if (!searchPageStatus) return;
      searchPageStatus.textContent = `Page ${searchState.page || 1} of ${searchState.totalPages || 1} (${searchState.total || 0} results)`;
      if (previousSearchPage) previousSearchPage.disabled = (searchState.page || 1) <= 1;
      if (nextSearchPage) nextSearchPage.disabled = (searchState.page || 1) >= (searchState.totalPages || 1);
    }

    function buildSearchParams(page = 1) {
      const params = new URLSearchParams({ page: String(page), pageSize: String(searchState.pageSize || 10) });
      if (repositoryQuery?.value.trim()) params.set('q', repositoryQuery.value.trim());
      if (repositoryCategory?.value) params.set('category', repositoryCategory.value);
      if (repositorySchoolYear?.value) params.set('schoolYear', repositorySchoolYear.value);
      if (repositoryStatus?.value) params.set('status', repositoryStatus.value);
      return `?${params}`;
    }

    async function runRepositorySearch(page = 1) {
      await hydrateFromApi(buildSearchParams(page));
    }

    let suggestionTimer;
    async function loadSearchSuggestions(value) {
      clearTimeout(suggestionTimer);
      suggestionTimer = setTimeout(async () => {
        if (!value.trim()) { searchSuggestions.innerHTML = ''; return; }
        try {
          const payload = await apiRequest(`/search/suggestions?q=${encodeURIComponent(value.trim())}`);
          searchSuggestions.innerHTML = payload.suggestions.map((item) => `<option value="${escapeHtml(item)}"></option>`).join('');
        } catch { /* suggestions are optional and should not block search */ }
      }, 180);
    }

    async function hydrateNotifications() {
      const payload = await apiRequest('/notifications');
      notificationUnreadCount = Number.isFinite(Number(payload.unreadCount))
        ? Number(payload.unreadCount)
        : payload.notifications.filter((item) => !item.readAt).length;
      notifications.splice(0, notifications.length, ...payload.notifications.map((item) => ({
        ...item,
        target: 'repository',
        focusId: item.manuscriptId ? `manuscript-${item.manuscriptId}` : 'repositoryList'
      })));
      renderNotifications();
    }

    async function hydrateAdvisers() {
      if (!hasRole('student_researcher') || !adviserSelect) return;
      const payload = await apiRequest('/advisers');
      adviserSelect.innerHTML = '<option value="">Select an adviser</option>';
      payload.advisers.forEach((adviser) => {
        const option = document.createElement('option');
        option.value = adviser.id;
        option.textContent = adviser.name;
        adviserSelect.appendChild(option);
      });
      adviserSelect.disabled = payload.advisers.length === 0;
      if (!payload.advisers.length) adviserSelect.innerHTML = '<option value="">No approved advisers available</option>';
    }

    function startNotificationRefresh() {
      if (notificationRefreshTimer) clearInterval(notificationRefreshTimer);
      notificationRefreshTimer = setInterval(async () => {
        if (!database.session) return;
        try {
          await hydrateNotifications();
          if (hasRole('admin')) await hydrateAdminPanel();
        } catch { /* background refresh must not interrupt the current page */ }
      }, 15000);
    }

    function stopNotificationRefresh() {
      if (notificationRefreshTimer) clearInterval(notificationRefreshTimer);
      notificationRefreshTimer = null;
    }

    async function hydrateAnalytics() {
      const payload = await apiRequest('/analytics');
      if (categoryReports) {
        categoryReports.innerHTML = payload.byCategory.length
          ? payload.byCategory.map((item) => `<div class="item"><h5>${escapeHtml(item.category)}</h5><p>${item.count} manuscript${item.count === 1 ? '' : 's'} in this research category.</p></div>`).join('')
          : '<div class="empty-state">Category reports will appear after manuscripts are added.</div>';
      }
      const max = Math.max(1, ...payload.byYear.map((item) => item.count));
      document.querySelectorAll('.chart .bar-group').forEach((group, index) => {
        const item = payload.byYear[index];
        group.querySelectorAll('span').forEach((bar) => { bar.style.height = item ? `${Math.max(8, (item.count / max) * 100)}%` : '0%'; });
        if (item) group.title = `${item.schoolYear}: ${item.count} manuscripts`;
      });
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }

    async function hydrateAdminPanel() {
      if (!hasRole('admin') || !adminUsersBody) return;
      if (adminRefreshStatus) adminRefreshStatus.textContent = 'Refreshing...';
      const [usersPayload, auditPayload, pendingPayload, approvedPayload] = await Promise.all([
        apiRequest('/admin/users'),
        apiRequest('/admin/audit-logs?limit=30'),
        apiRequest('/manuscripts?status=For%20Review&page=1&pageSize=50'),
        apiRequest('/manuscripts?status=Approved&page=1&pageSize=50')
      ]);
      const faculty = usersPayload.users.filter((user) => user.role === 'faculty' && user.isActive && user.accountStatus === 'approved');
      adminUsersBody.innerHTML = usersPayload.users.map((user) => {
        const pending = user.accountStatus === 'pending';
        const statusLabel = pending ? 'Pending verification' : user.accountStatus === 'rejected' ? 'Rejected' : user.isActive ? 'Active' : 'Inactive';
        const statusClass = pending || !user.isActive ? 'warn' : user.accountStatus === 'rejected' ? 'bad' : 'good';
        const verificationActions = pending
          ? `<button class="light-btn admin-verify" data-user-id="${user.id}" data-status="approved">Approve</button><button class="light-btn admin-verify" data-user-id="${user.id}" data-status="rejected">Reject</button>`
          : `<button class="light-btn admin-toggle" data-user-id="${user.id}" data-active="${user.isActive}">${user.isActive ? 'Deactivate' : 'Activate'}</button>`;
        return `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.username)}</td><td><select class="field admin-role" data-user-id="${user.id}"><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option><option value="faculty" ${user.role === 'faculty' ? 'selected' : ''}>Faculty</option><option value="student_researcher" ${user.role === 'student_researcher' ? 'selected' : ''}>Student</option></select></td><td><span class="badge ${statusClass}">${statusLabel}</span></td><td class="admin-actions">${verificationActions}</td></tr>`;
      }).join('');
      adminUsersBody.querySelectorAll('.admin-role').forEach((control) => control.addEventListener('change', async () => {
        try { await apiRequest(`/admin/users/${control.dataset.userId}`, { method: 'PATCH', body: JSON.stringify({ role: control.value }) }); await hydrateAdminPanel(); } catch (error) { window.alert(error.message); }
      }));
      adminUsersBody.querySelectorAll('.admin-toggle').forEach((button) => button.addEventListener('click', async () => {
        try { await apiRequest(`/admin/users/${button.dataset.userId}`, { method: 'PATCH', body: JSON.stringify({ isActive: button.dataset.active !== 'true' }) }); await hydrateAdminPanel(); } catch (error) { window.alert(error.message); }
      }));
      adminUsersBody.querySelectorAll('.admin-verify').forEach((button) => button.addEventListener('click', async () => {
        try { await apiRequest(`/admin/users/${button.dataset.userId}`, { method: 'PATCH', body: JSON.stringify({ accountStatus: button.dataset.status }) }); await hydrateAdminPanel(); } catch (error) { window.alert(error.message); }
      }));
      reviewerAssignments.innerHTML = pendingPayload.manuscripts.length
        ? pendingPayload.manuscripts.map((record) => `<div class="item"><h5>${escapeHtml(record.title)}</h5><p>${escapeHtml(record.category)} · ${escapeHtml(record.schoolYear)}</p><select class="field reviewer-select" data-manuscript-id="${record.id}"><option value="">Unassigned</option>${faculty.map((user) => `<option value="${user.id}" ${String(record.reviewerId || '') === String(user.id) ? 'selected' : ''}>${escapeHtml(user.name)}</option>`).join('')}</select></div>`).join('')
        : '<div class="empty-state">No manuscripts awaiting assignment.</div>';
      reviewerAssignments.querySelectorAll('.reviewer-select').forEach((control) => control.addEventListener('change', async () => {
        try { await apiRequest(`/manuscripts/${control.dataset.manuscriptId}/assign-reviewer`, { method: 'PATCH', body: JSON.stringify({ reviewerId: control.value || null }) }); await hydrateAdminPanel(); } catch (error) { window.alert(error.message); }
      }));
      [publishQueue, dashboardPublishQueue].filter(Boolean).forEach((queue) => renderPublishQueue(queue, approvedPayload.manuscripts));
      adminAuditLogs.innerHTML = auditPayload.logs.length
        ? auditPayload.logs.map((log) => `<div class="item"><h5>${escapeHtml(log.action)}</h5><p>${escapeHtml(log.details || '')}</p><small>${escapeHtml(log.userName || 'System')} · ${escapeHtml(new Date(log.createdAt).toLocaleString())}</small></div>`).join('')
        : '<div class="empty-state">No audit logs yet.</div>';
      if (adminRefreshStatus) adminRefreshStatus.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    }

    function renderPublishQueue(queue, recordsToPublish) {
      queue.innerHTML = recordsToPublish.length
        ? ''
        : '<div class="empty-state">No adviser-approved theses are waiting for publication.</div>';
      recordsToPublish.forEach((record) => {
        const item = document.createElement('div');
        item.className = 'item';
        const title = document.createElement('h5');
        title.textContent = record.title;
        const details = document.createElement('p');
        details.textContent = `${record.adviser || record.reviewerName || 'Adviser'} · ${record.category} · ${record.schoolYear}`;
        item.append(title, details, createWorkflowAction(record, 'Publish to Repository', 'Archived', 'Thesis Published'));
        queue.appendChild(item);
      });
    }

    function writeAudit(action, details) {
      auditLogs.unshift({
        id: Date.now(),
        user: database.session?.name || 'Guest',
        role: database.session?.role || 'guest',
        action,
        details,
        createdAt: new Date().toLocaleString()
      });
      saveDatabase();
    }

    function formatRole(role) {
      const labels = {
        admin: 'Admin Portal',
        faculty: 'Faculty Portal',
        student_researcher: 'Student Researcher Portal'
      };
      return labels[role] || 'Authorized User';
    }

    function hasRole(role) {
      return database.session?.role === role;
    }

    function applyRoleAccess() {
      roleRestrictedElements.forEach((element) => {
        const canAccess = Boolean(database.session) && element.dataset.role === database.session.role;
        element.hidden = !canAccess;
        element.style.display = canAccess ? '' : 'none';
      });
    }

    function getInitials(name) {
      return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    }

    function applySession() {
      if (!database.session) {
        document.body.classList.remove('is-authenticated');
        applyRoleAccess();
        restoreAiState();
        return;
      }

      document.body.classList.add('is-authenticated');
      currentUserName.forEach((item) => {
        item.textContent = database.session.name;
      });
      currentUserRole.forEach((item) => {
        item.textContent = `${formatRole(database.session.role)} | E-Data Banking System`;
      });
      currentUserInitials.forEach((item) => {
        item.textContent = getInitials(database.session.name);
      });
      applyRoleAccess();
      restoreAiState();
    }

    function showView(target) {
      if (target === 'submission' && !hasRole('student_researcher')) {
        target = 'dashboard';
      }
      navButtons.forEach((item) => item.classList.toggle('active', item.dataset.view === target));
      views.forEach((view) => view.classList.remove('active'));
      document.getElementById(target).classList.add('active');
      title.textContent = pageCopy[target];
    }

    function showPasswordReset(token = '') {
      passwordResetModal?.classList.add('active');
      passwordResetModal?.setAttribute('aria-hidden', 'false');
      if (token) {
        document.getElementById('resetToken').value = token;
        passwordResetRequestForm?.classList.add('hidden');
        passwordResetForm?.classList.remove('hidden');
      }
    }

    function hidePasswordReset() {
      passwordResetModal?.classList.remove('active');
      passwordResetModal?.setAttribute('aria-hidden', 'true');
      passwordResetRequestForm?.reset();
      passwordResetForm?.reset();
      passwordResetRequestForm?.classList.remove('hidden');
      passwordResetForm?.classList.add('hidden');
      if (passwordResetRequestStatus) passwordResetRequestStatus.textContent = '';
      if (passwordResetStatus) passwordResetStatus.textContent = '';
    }

    navButtons.forEach((button) => {
      button.addEventListener('click', () => showView(button.dataset.view));
    });

    function activateDashboardLink(link) {
      const target = link.dataset.dashboardView;
      if (target === 'repository' && link.dataset.dashboardStatus && repositoryStatus) {
        repositoryStatus.value = link.dataset.dashboardStatus;
      }
      showView(target);
      if (target === 'repository' && link.dataset.dashboardStatus) {
        runRepositorySearch(1).catch((error) => window.alert(error.message));
      }
    }

    dashboardLinks.forEach((link) => {
      link.addEventListener('click', () => activateDashboardLink(link));
      link.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateDashboardLink(link);
        }
      });
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = document.getElementById('loginUsername').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      try {
        const payload = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        let authenticated = payload;
        if (payload.mfaRequired) {
          const code = window.prompt('Enter the six-digit code from your authenticator app:');
          if (!code) { loginStatus.textContent = 'MFA verification is required.'; return; }
          authenticated = await apiRequest('/auth/mfa/verify', {
            method: 'POST',
            body: JSON.stringify({ challengeToken: payload.challengeToken, code })
          });
        }
        const user = authenticated.user;
        database.session = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          loggedInAt: new Date().toLocaleString()
        };
        loginForm.reset();
        loginStatus.textContent = '';
        applySession();
        await hydrateFromApi();
        await hydrateAdvisers();
        showView('dashboard');
      } catch (error) {
        loginStatus.textContent = error.message;
        return;
      }
    });

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('registerName').value.trim();
      const username = document.getElementById('registerUsername').value.trim().toLowerCase();
      const password = document.getElementById('registerPassword').value;
      const role = document.getElementById('registerRole').value;
      registerStatus.style.color = 'var(--bad)';

      if (!['student_researcher', 'faculty'].includes(role)) {
        registerStatus.textContent = 'Choose Student Researcher or Adviser / Faculty Reviewer.';
        return;
      }

      try {
        const registration = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, username, password, role })
        });
        registerForm.reset();
        registerStatus.style.color = 'var(--good)';
        registerStatus.textContent = `Registration successful. ${registration.message || 'Account registered. You can log in now.'}`;
        loginStatus.textContent = '';
      } catch (error) {
        registerStatus.textContent = error.message;
      }
    });

    passwordResetRequestForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      passwordResetRequestStatus.textContent = '';
      try {
        const payload = await apiRequest('/auth/password-reset/request', {
          method: 'POST',
          body: JSON.stringify({ username: document.getElementById('resetUsername').value.trim().toLowerCase() })
        });
        passwordResetRequestStatus.style.color = 'var(--good)';
        passwordResetRequestStatus.textContent = payload.message || 'If the account exists, reset instructions will be sent.';
        if (payload.debugToken) {
          document.getElementById('resetToken').value = payload.debugToken;
          passwordResetRequestForm.classList.add('hidden');
          passwordResetForm.classList.remove('hidden');
          passwordResetStatus.style.color = 'var(--muted)';
          passwordResetStatus.textContent = 'Development mode: enter a new password below.';
        }
      } catch (error) {
        passwordResetRequestStatus.style.color = 'var(--bad)';
        passwordResetRequestStatus.textContent = error.message;
      }
    });

    passwordResetForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = document.getElementById('resetPassword').value;
      const confirmation = document.getElementById('resetPasswordConfirm').value;
      if (password !== confirmation) {
        passwordResetStatus.textContent = 'The passwords do not match.';
        return;
      }
      try {
        await apiRequest('/auth/password-reset/complete', {
          method: 'POST',
          body: JSON.stringify({ token: document.getElementById('resetToken').value.trim(), password })
        });
        passwordResetStatus.style.color = 'var(--good)';
        passwordResetStatus.textContent = 'Password reset successfully. You can now sign in.';
        setTimeout(hidePasswordReset, 1200);
      } catch (error) {
        passwordResetStatus.style.color = 'var(--bad)';
        passwordResetStatus.textContent = error.message;
      }
    });

    logoutButton.addEventListener('click', async () => {
      writeAudit('Logout', `${database.session?.name || 'User'} signed out.`);
      try { await apiRequest('/auth/logout', { method: 'POST', body: '{}' }); } catch { /* the local session is cleared below */ }
      database.session = null;
      apiToken = '';
      stopNotificationRefresh();
      saveDatabase();
      applySession();
    });

    function renderNotifications() {
      notificationCount.textContent = notificationUnreadCount;
      notificationTotal.textContent = `${notificationUnreadCount} new`;
      notificationButton.classList.toggle('has-unread', notificationUnreadCount > 0);
      notificationButton.setAttribute('aria-label', notificationUnreadCount > 0
        ? `Notifications, ${notificationUnreadCount} unread`
        : 'Notifications');

      if (!notifications.length) {
        notificationList.innerHTML = '<div class="notification-empty">No notifications yet.</div>';
        return;
      }

      notificationList.innerHTML = '';
      notifications.forEach((notification) => {
        const item = document.createElement('button');
        item.className = 'notification-item';
        item.type = 'button';
        item.classList.toggle('unread', !notification.readAt);
        item.setAttribute('aria-label', `${notification.readAt ? '' : 'Unread notification: '}${notification.title}`.trim());

        const itemTitle = document.createElement('strong');
        itemTitle.textContent = notification.title;

        const itemText = document.createElement('span');
        itemText.textContent = notification.message;

        item.append(itemTitle, itemText);
        item.addEventListener('click', async () => {
          notificationMenu.classList.remove('active');
          notificationButton.setAttribute('aria-expanded', 'false');
          showView(notification.target);
          if (notification.manuscriptId) {
            if (repositoryStatus) repositoryStatus.value = '';
            try { await runRepositorySearch(1); } catch { /* repository can still open */ }
          }
          if (notification.focusId) {
            document.getElementById(notification.focusId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (!notification.readAt) {
            notification.readAt = new Date().toISOString();
            notificationUnreadCount = Math.max(0, notificationUnreadCount - 1);
            renderNotifications();
            try { await apiRequest(`/notifications/${notification.id}/read`, { method: 'PATCH', body: '{}' }); } catch { /* local state still reflects the read action */ }
          }
        });

        notificationList.appendChild(item);
      });
    }

    function addNotification(title, message, target, focusId = '') {
      notifications.unshift({
        id: Date.now(),
        title,
        message,
        target,
        focusId,
        createdAt: new Date().toLocaleString()
      });
      notificationUnreadCount += 1;
      saveDatabase();
      renderNotifications();
    }

    function setCount(name, value) {
      document.querySelectorAll(`[data-count="${name}"]`).forEach((item) => {
        item.textContent = value;
      });
    }

    function setPercent(name, value) {
      document.querySelectorAll(`[data-percent="${name}"]`).forEach((item) => {
        item.textContent = `${value}%`;
      });
      document.querySelectorAll(`[data-progress="${name}"]`).forEach((item) => {
        item.style.width = `${value}%`;
      });
    }

    function createBadge(text, type = '') {
      const badge = document.createElement('span');
      badge.className = type ? `badge ${type}` : 'badge';
      badge.textContent = text;
      return badge;
    }

    function slugifyFileName(value) {
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'manuscript';
    }

    function readPdfFile(file) {
      return new Promise((resolve, reject) => {
        if (!file) {
          resolve(null);
          return;
        }

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
          reject(new Error('Only PDF files can be uploaded.'));
          return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          resolve({
            name: file.name,
            type: file.type || 'application/pdf',
            size: file.size,
            dataUrl: reader.result
          });
        });
        reader.addEventListener('error', () => reject(new Error('The PDF file could not be read.')));
        reader.readAsDataURL(file);
      });
    }

    function createPdfDownload(record) {
      const hasLocalFile = Boolean(record.file?.dataUrl);
      const hasApiFile = Boolean(record.fileName);

      if (!hasLocalFile && !hasApiFile) {
        const unavailable = document.createElement('span');
        unavailable.className = 'badge';
        unavailable.textContent = 'No PDF';
        return unavailable;
      }

      const link = document.createElement('a');
      link.className = 'download-link';
      link.href = hasLocalFile ? record.file.dataUrl : '#';
      link.download = record.file?.name || record.fileName || `${slugifyFileName(record.title)}.pdf`;
      link.textContent = 'Download PDF';
      link.addEventListener('click', async (event) => {
        if (!hasApiFile) {
          writeAudit('PDF Download', `${record.title} was downloaded by ${database.session?.name || 'Guest'}.`);
          return;
        }

        event.preventDefault();
        link.setAttribute('aria-busy', 'true');
        try {
          const response = await fetch(`/api/manuscripts/${encodeURIComponent(record.id)}/file`, {
            credentials: 'include'
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.error || 'The PDF download failed.');
          }

          const objectUrl = URL.createObjectURL(await response.blob());
          const download = document.createElement('a');
          download.href = objectUrl;
          download.download = record.fileName || `${slugifyFileName(record.title)}.pdf`;
          document.body.appendChild(download);
          download.click();
          download.remove();
          URL.revokeObjectURL(objectUrl);
          writeAudit('PDF Download', `${record.title} was downloaded by ${database.session?.name || 'Guest'}.`);
        } catch (error) {
          window.alert(error.message);
        } finally {
          link.removeAttribute('aria-busy');
        }
      });
      return link;
    }

    function renderRecords() {
      if (!records.length) {
        const hasFilters = Boolean(repositoryQuery?.value.trim() || repositoryCategory?.value || repositorySchoolYear?.value || repositoryStatus?.value);
        repositoryList.innerHTML = `<div class="empty-state">${hasFilters ? 'No manuscripts match the selected filters.' : 'No manuscripts have been added yet.'}</div>`;
        activityBody.innerHTML = '<tr class="empty-row"><td colspan="5">No thesis records yet. Submit a manuscript to add the first entry.</td></tr>';
        return;
      }

      repositoryList.innerHTML = '';
      activityBody.innerHTML = '';

      records.forEach((record) => {
        const article = document.createElement('article');
        article.className = 'item';
        article.id = `manuscript-${record.id}`;

        const itemTitle = document.createElement('h5');
        itemTitle.textContent = record.title;

        const meta = document.createElement('div');
        meta.className = 'meta';
        [record.category, record.schoolYear].forEach((text) => {
          const span = document.createElement('span');
          span.textContent = text;
          meta.appendChild(span);
        });
        meta.appendChild(createBadge(record.status, 'warn'));

        const description = document.createElement('p');
        description.textContent = record.abstract || record.keywords || 'No abstract added yet.';

        let reviewerNote = null;
        if (record.reviewerNotes) {
          const note = document.createElement('p');
          note.className = 'reviewer-note';
          note.textContent = `Adviser note: ${record.reviewerNotes}`;
          reviewerNote = note;
        }

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        actions.appendChild(createPdfDownload(record));

        if (hasRole('faculty') && record.status === 'For Review') {
          actions.appendChild(createWorkflowAction(record, 'Approve & Publish to Repository', 'Approved', 'Faculty Approval'));
          actions.appendChild(createWorkflowAction(record, 'Request Revision', 'Revision Requested', 'Revision Requested'));
          actions.appendChild(createWorkflowAction(record, 'Reject Thesis', 'Rejected', 'Thesis Rejected'));
          actions.appendChild(createNoteAction(record));
        }
        if (hasRole('admin') && record.status === 'Approved') {
          actions.appendChild(createWorkflowAction(record, 'Publish to Repository', 'Archived', 'Thesis Published'));
        }
        if (hasRole('student_researcher') && ['Revision Requested', 'Rejected'].includes(record.status)) {
          actions.appendChild(createRevisionAction(record));
        }

        article.append(itemTitle, meta, description);
        if (reviewerNote) article.appendChild(reviewerNote);
        article.appendChild(actions);
        repositoryList.appendChild(article);

        const row = document.createElement('tr');
        const titleCell = document.createElement('td');
        const authorCell = document.createElement('td');
        const statusCell = document.createElement('td');
        const similarityCell = document.createElement('td');
        const pdfCell = document.createElement('td');

        titleCell.textContent = record.title;
        authorCell.textContent = record.authors;
        statusCell.appendChild(createBadge(record.status, 'warn'));
        similarityCell.textContent = record.similarityScore == null ? 'Not checked' : `${record.similarityScore}% overlap`;
        pdfCell.appendChild(createPdfDownload(record));
        row.append(titleCell, authorCell, statusCell, similarityCell, pdfCell);
        activityBody.appendChild(row);
      });
    }

    function createWorkflowAction(record, label, nextStatus, auditAction) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'light-btn';
      button.textContent = label;
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const action = nextStatus === 'Approved' ? 'approve'
            : nextStatus === 'Archived' ? 'archive'
              : nextStatus === 'Revision Requested' ? 'revision-request' : 'reject';
          const notes = window.prompt('Notes for the researcher:', '') || '';
          await apiRequest(`/manuscripts/${record.id}/${action}`, { method: 'PATCH', body: JSON.stringify({ notes }) });
          await hydrateFromApi();
          addNotification(
            nextStatus === 'Approved' ? 'Thesis approved' : nextStatus === 'Archived' ? 'Thesis archived' : nextStatus,
            `${record.title} is now ${nextStatus.toLowerCase()}.`,
            'repository',
            'repositoryList'
          );
        } catch (error) {
          window.alert(error.message);
          button.disabled = false;
        }
      });
      return button;
    }

    function createNoteAction(record) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'light-btn';
      button.textContent = 'Add Adviser Note';
      button.addEventListener('click', async () => {
        const notes = window.prompt('Adviser note for the researcher:', record.reviewerNotes || '');
        if (notes === null || !notes.trim()) return;
        button.disabled = true;
        try {
          await apiRequest(`/manuscripts/${record.id}/note`, {
            method: 'PATCH',
            body: JSON.stringify({ notes: notes.trim() })
          });
          await hydrateFromApi();
        } catch (error) {
          window.alert(error.message);
          button.disabled = false;
        }
      });
      return button;
    }

    function createRevisionAction(record) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'light-btn';
      button.textContent = 'Submit Revision';
      button.addEventListener('click', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf,.pdf';
        input.click();
        input.addEventListener('change', async () => {
          try {
            const file = await readPdfFile(input.files[0]);
            if (!file) return;
            const notes = window.prompt('Describe the revision:', '') || '';
            await apiRequest(`/manuscripts/${record.id}/revise`, { method: 'POST', body: JSON.stringify({ file, notes }) });
            await hydrateFromApi();
          } catch (error) { window.alert(error.message); }
        }, { once: true });
      });
      return button;
    }

    function updateDashboard() {
      const pending = records.filter((record) => record.status === 'For Review').length;
      const archived = records.filter((record) => record.status === 'Archived').length;
      const categoryCount = new Set(records.map((record) => record.category)).size;

      setCount('archived', archived);
      setCount('added', records.length);
      setCount('pending', pending);
      setCount('reviews', pending);
      setCount('categories', categoryCount);
      setPercent('digitization', records.length ? 10 : 0);
    }

    function restoreAiState() {
      // AI results belong to the manuscript currently being analyzed. Do not
      // restore a previous manuscript's result when the page/session loads.
      resetAiState();
    }

    function getAiScopeKey() {
      const session = database.session;
      return session ? `${session.id || session.username}:${session.role}` : 'guest';
    }

    function getAiState() {
      const saved = database.aiByUser?.[getAiScopeKey()];
      return saved ? { originality: 0, suggestions: 0, related: 0, classification: 'Ready', ...saved } : {
        originality: 0,
        suggestions: 0,
        related: 0,
        classification: 'Ready'
      };
    }

    function resetAiState() {
      const emptyAi = {
        originality: 0,
        suggestions: 0,
        related: 0,
        classification: 'Ready'
      };
      database.aiByUser[getAiScopeKey()] = emptyAi;
      database.ai = emptyAi;
      setPercent('originality', 0);
      setCount('suggestions', 0);
      setCount('related', 0);
      classificationBadge.textContent = 'Ready';
      renderPlagiarismReport(null);
      renderCitationRecommendations(null);
      heatmapScores = [...defaultHeatmapScores];
      renderHeatmap();
      saveDatabase();
    }

    function prepareAiForNewManuscript() {
      const ai = getAiState();
      const hasPreviousResult = ai.originality > 0
        || ai.suggestions > 0
        || ai.related > 0
        || ai.classification !== 'Ready';
      if (hasPreviousResult) resetAiState();
    }

    function renderPlagiarismReport(report) {
      const targets = [plagiarismSources, plagiarismSourcesAi].filter(Boolean);
      const matches = report?.matches || [];
      const content = matches.length
        ? matches.map((match) => `<div class="item"><h5>${escapeHtml(match.title)} <span class="badge warn">${match.score}% similarity</span></h5><p>${escapeHtml(match.category || 'Uncategorized')} · ${match.matchedWords} shared terms</p>${match.matchedPhrases?.length ? `<small>Matched phrases: ${escapeHtml(match.matchedPhrases.slice(0, 3).join(' · '))}</small>` : ''}</div>`).join('')
        : '<div class="empty-state">No significant matching phrases found in the internal repository.</div>';
      targets.forEach((target) => { target.innerHTML = content; });
    }

    function renderCitationRecommendations(payload) {
      const targets = [citationRecommendations, citationRecommendationsAi].filter(Boolean);
      const results = payload?.results || [];
      const internal = payload?.internal || [];
      const externalMarkup = results.map((item) => `<div class="item"><h5>${escapeHtml(item.title)}</h5><p>${escapeHtml(item.journal || 'Scholarly work')} · ${escapeHtml(String(item.year))}${item.doi ? ` · <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">DOI</a>` : ''}</p><small>APA: ${escapeHtml(item.apa)}</small><br /><small>MLA: ${escapeHtml(item.mla)}</small></div>`).join('');
      const internalMarkup = internal.map((item) => `<div class="item"><h5>${escapeHtml(item.title)}</h5><p>Internal thesis · ${escapeHtml(item.category)} · ${escapeHtml(item.schoolYear)}</p><small>Authors: ${escapeHtml(item.authors)}</small></div>`).join('');
      const content = externalMarkup || internalMarkup
        ? `${externalMarkup}${internalMarkup}`
        : '<div class="empty-state">No scholarly references found for this topic.</div>';
      targets.forEach((target) => { target.innerHTML = content; });
    }

    function getHeatColor(score) {
      if (score >= 76) return '#cf5f46';
      if (score >= 56) return '#f2c05a';
      if (score >= 36) return '#003366';
      return '#e6eef9';
    }

    function renderHeatmap() {
      heatmapPreview.innerHTML = '';
      heatmapLarge.innerHTML = '';

      heatmapScores.forEach((score, index) => {
        const previewCell = document.createElement('span');
        previewCell.className = 'heat-cell';
        previewCell.style.setProperty('--heat', getHeatColor(score));
        heatmapPreview.appendChild(previewCell);

        const largeCell = document.createElement('div');
        largeCell.className = 'heat-cell';
        largeCell.style.setProperty('--heat', getHeatColor(score));
        largeCell.textContent = `${score}%`;
        largeCell.title = `Section ${index + 1}: ${score}% similarity`;
        heatmapLarge.appendChild(largeCell);
      });
    }

    function updateHeatmap(originality, suggestions, related) {
      const similarity = 100 - originality;
      heatmapScores = heatmapScores.map((score, index) => {
        const wave = ((index * 13) + (suggestions * 7) + (related * 11)) % 34;
        return Math.min(92, Math.max(8, similarity + wave));
      });
      renderHeatmap();
    }

    function showHeatmap() {
      heatmapModal.classList.add('active');
      heatmapModal.setAttribute('aria-hidden', 'false');
      closeHeatmap.focus();
    }

    function hideHeatmap() {
      heatmapModal.classList.remove('active');
      heatmapModal.setAttribute('aria-hidden', 'true');
      openHeatmap.focus();
    }

    function showRegister() {
      registerStatus.textContent = '';
      registerStatus.style.color = 'var(--bad)';
      registerModal.classList.add('active');
      registerModal.setAttribute('aria-hidden', 'false');
      document.getElementById('registerName').focus();
    }

    function hideRegister() {
      registerModal.classList.remove('active');
      registerModal.setAttribute('aria-hidden', 'true');
      openRegister.focus();
    }

    async function runAiPrecheck() {
      const titleValue = document.getElementById('thesisTitle').value.trim();
      const abstractValue = document.getElementById('abstract').value.trim();
      const keywordValue = document.getElementById('keywords').value.trim();
      const categoryValue = document.getElementById('category').value.trim();

      if (!titleValue && !abstractValue && !keywordValue) {
        formStatus.textContent = 'Add thesis details first before running the AI pre-check.';
        return;
      }

      resetAiState();

      let result;
      let plagiarism;
      try {
        result = await apiRequest('/ai/precheck', {
          method: 'POST',
          body: JSON.stringify({ title: titleValue, abstract: abstractValue, keywords: keywordValue, category: categoryValue })
        });
        const uploadedFile = await readPdfFile(document.getElementById('manuscriptFile').files[0]);
        plagiarism = await apiRequest('/ai/plagiarism', {
          method: 'POST',
          body: JSON.stringify({ title: titleValue, abstract: abstractValue, keywords: keywordValue, category: categoryValue, file: uploadedFile })
        });
        const citationQuery = [titleValue, abstractValue, keywordValue].filter(Boolean).join(' ');
        const citations = await apiRequest(`/citations/recommend?q=${encodeURIComponent(citationQuery)}&style=APA`);
        renderCitationRecommendations(citations);
      } catch (error) {
        formStatus.textContent = error.message;
        return;
      }
      const originality = plagiarism.originality;
      const suggestions = result.suggestions;
      const related = plagiarism.matches.length;

      setPercent('originality', originality);
      setCount('suggestions', suggestions);
      setCount('related', related);
      updateHeatmap(originality, suggestions, related);
      classificationBadge.textContent = result.classification || 'Unclassified';
      renderPlagiarismReport(plagiarism);
      const aiResult = {
        originality,
        suggestions,
        related,
        classification: result.classification || 'Unclassified'
      };
      database.aiByUser[getAiScopeKey()] = aiResult;
      database.ai = aiResult;
      database.aiReports.unshift({
        id: Date.now(),
        title: titleValue || 'Untitled Manuscript',
        originality,
        suggestions,
        related,
        classification: result.classification || 'Unclassified',
        relatedTitles: result.related.map((item) => item.title),
        citationSuggestions: result.citationSuggestions,
        plagiarismReport: plagiarism,
        createdAt: new Date().toLocaleString(),
        checkedBy: database.session?.name || 'Guest'
      });
      saveDatabase();
      writeAudit('AI Pre-check', `${titleValue || 'Untitled Manuscript'} generated an originality result.`);
      formStatus.textContent = 'AI pre-check complete.';
      addNotification(
        'AI pre-check completed',
        `${originality}% originality result is ready for review.`,
        'submission',
        'openHeatmap'
      );
    }

    async function openArchivedAnalysis() {
      resetAiState();
      archivedAnalysisStatus.textContent = '';
      archivedAnalysisSelect.innerHTML = '<option value="">Loading archived manuscripts...</option>';
      archivedAnalysisModal.classList.add('active');
      archivedAnalysisModal.setAttribute('aria-hidden', 'false');
      try {
        const payload = await apiRequest('/manuscripts?status=Archived&page=1&pageSize=100');
        archivedAnalysisRecords = payload.manuscripts || [];
        archivedDepartmentFilter = '';
        archivedSelectedId = '';
        archivedAnalysisSearch.value = '';
        updateArchivedDepartmentTabs();
        renderArchivedAnalysisOptions();
        if (!archivedAnalysisRecords.length) archivedAnalysisStatus.textContent = 'No archived manuscripts are available yet.';
      } catch (error) {
        archivedAnalysisSelect.innerHTML = '<option value="">Unable to load archived manuscripts</option>';
        archivedAnalysisStatus.textContent = error.message;
      }
    }

    function updateArchivedDepartmentTabs() {
      archivedDepartmentTabs.forEach((tab) => {
        const selected = tab.dataset.archivedDepartmentTab === archivedDepartmentFilter;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
    }

    function renderArchivedAnalysisOptions() {
      const query = archivedAnalysisSearch.value.trim().toLowerCase();
      const filtered = archivedAnalysisRecords.filter((record) => {
        const matchesDepartment = !archivedDepartmentFilter || record.category === archivedDepartmentFilter;
        const searchable = [record.title, record.authors, record.abstract, record.keywords, record.category, record.schoolYear]
          .filter(Boolean).join(' ').toLowerCase();
        return matchesDepartment && (!query || searchable.includes(query));
      });
      archivedAnalysisMatches.innerHTML = '';
      archivedAnalysisSelect.innerHTML = '<option value="">Select an archived manuscript</option>';
      filtered.forEach((record) => {
        const option = document.createElement('option');
        option.value = record.id;
        option.textContent = `${record.title} · ${record.category} · ${record.schoolYear}`;
        archivedAnalysisSelect.appendChild(option);

        const match = document.createElement('button');
        match.type = 'button';
        match.className = `archived-analysis-match${String(record.id) === String(archivedSelectedId) ? ' selected' : ''}`;
        match.innerHTML = `<strong>${escapeHtml(record.title)}</strong><span>${escapeHtml(record.authors || 'Unknown author')} · ${escapeHtml(record.category || 'Uncategorized')} · ${escapeHtml(record.schoolYear || 'No school year')}</span>`;
        match.addEventListener('click', () => {
          archivedSelectedId = String(record.id);
          archivedAnalysisSelect.value = String(record.id);
          renderArchivedAnalysisOptions();
        });
        archivedAnalysisMatches.appendChild(match);
      });
      if (archivedSelectedId && !filtered.some((record) => String(record.id) === String(archivedSelectedId))) {
        archivedSelectedId = '';
        archivedAnalysisSelect.value = '';
      }
      if (filtered.length === 1 && !archivedSelectedId) {
        archivedSelectedId = String(filtered[0].id);
        archivedAnalysisSelect.value = archivedSelectedId;
        archivedAnalysisMatches.firstElementChild?.classList.add('selected');
      }
      if (!filtered.length) archivedAnalysisStatus.textContent = 'No archived manuscripts match this department/search.';
      else if (filtered.length === 1) archivedAnalysisStatus.textContent = '1 match found and selected.';
      else archivedAnalysisStatus.textContent = `${filtered.length} matches found. Select the manuscript you want to analyze.`;
    }

    function hideArchivedAnalysis() {
      archivedAnalysisModal.classList.remove('active');
      archivedAnalysisModal.setAttribute('aria-hidden', 'true');
    }

    async function analyzeArchivedManuscript() {
      const record = archivedAnalysisRecords.find((item) => String(item.id) === String(archivedSelectedId));
      if (!record) {
        archivedAnalysisStatus.textContent = 'Select an archived manuscript first.';
        return;
      }
      resetAiState();
      runArchivedAnalysis.disabled = true;
      archivedAnalysisStatus.textContent = 'Analyzing archived manuscript...';
      try {
        const body = JSON.stringify({ title: record.title, abstract: record.abstract || '', keywords: record.keywords || '', category: record.category || '' });
        const result = await apiRequest('/ai/precheck', { method: 'POST', body });
        const plagiarism = await apiRequest('/ai/plagiarism', { method: 'POST', body });
        const citationQuery = [record.title, record.abstract, record.keywords].filter(Boolean).join(' ');
        const citations = await apiRequest(`/citations/recommend?q=${encodeURIComponent(citationQuery)}&style=APA`);
        const originality = plagiarism.originality;
        const suggestions = result.suggestions;
        const related = plagiarism.matches.length;
        setPercent('originality', originality);
        setCount('suggestions', suggestions);
        setCount('related', related);
        updateHeatmap(originality, suggestions, related);
        classificationBadge.textContent = result.classification || 'Unclassified';
        renderPlagiarismReport(plagiarism);
        renderCitationRecommendations(citations);
        const aiResult = { originality, suggestions, related, classification: result.classification || 'Unclassified' };
        database.aiByUser[getAiScopeKey()] = aiResult;
        database.ai = aiResult;
        database.aiReports.unshift({
          id: Date.now(),
          title: record.title,
          originality,
          suggestions,
          related,
          classification: result.classification || 'Unclassified',
          relatedTitles: result.related.map((item) => item.title),
          citationSuggestions: result.citationSuggestions,
          plagiarismReport: plagiarism,
          createdAt: new Date().toLocaleString(),
          checkedBy: database.session?.name || 'Guest'
        });
        saveDatabase();
        writeAudit('Archived AI Analysis', `${record.title} was analyzed from the archived repository.`);
        addNotification('Archived analysis completed', `${record.title} AI results are ready for review.`, 'ai', 'plagiarismReportAi');
        hideArchivedAnalysis();
        showView('ai');
      } catch (error) {
        archivedAnalysisStatus.textContent = error.message;
      } finally {
        runArchivedAnalysis.disabled = false;
      }
    }

    submissionForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!hasRole('student_researcher')) {
        formStatus.textContent = 'Only student researchers can submit a thesis manuscript.';
        return;
      }

      const fileInput = document.getElementById('manuscriptFile');
      let uploadedFile = null;

      try {
        uploadedFile = await readPdfFile(fileInput.files[0]);
      } catch (error) {
        formStatus.textContent = error.message;
        return;
      }

      const record = {
        id: Date.now(),
        title: document.getElementById('thesisTitle').value.trim(),
        authors: document.getElementById('authors').value.trim(),
        adviser: document.getElementById('adviser').value.trim(),
        adviserId: Number(document.getElementById('adviser').value) || null,
        category: document.getElementById('category').value,
        schoolYear: document.getElementById('schoolYear').value,
        abstract: document.getElementById('abstract').value.trim(),
        keywords: document.getElementById('keywords').value.trim(),
        consent: {
          digitalArchiving: document.getElementById('archivingConsent').checked,
          privacyNotice: document.getElementById('archivingConsent').checked,
          copyrightAcknowledgement: document.getElementById('archivingConsent').checked,
          version: '2026-01'
        },
        status: 'For Review',
        submittedBy: database.session?.name || 'Guest',
        createdAt: new Date().toLocaleString(),
        file: uploadedFile
      };

      if (!record.title || !record.authors || !record.category || !record.schoolYear) {
        formStatus.textContent = 'Please complete the required fields first.';
        return;
      }
      if (!record.adviserId) {
        formStatus.textContent = 'Please select an adviser first.';
        return;
      }

      try {
        const payload = await apiRequest('/manuscripts', {
          method: 'POST',
          body: JSON.stringify(record)
        });
        await hydrateFromApi();
        addNotification(
          'New thesis submitted',
          `${record.title} is now pending faculty review.`,
          'repository',
          'repositoryList'
        );
        submissionForm.reset();
        resetAiState();
        formStatus.textContent = 'Manuscript submitted for review.';
      } catch (error) {
        formStatus.textContent = error.message;
      }
    });

    document.getElementById('saveDraft').addEventListener('click', () => {
      database.draft = {
        title: document.getElementById('thesisTitle').value,
        authors: document.getElementById('authors').value,
        adviser: document.getElementById('adviser').value,
        category: document.getElementById('category').value,
        schoolYear: document.getElementById('schoolYear').value,
        abstract: document.getElementById('abstract').value,
        keywords: document.getElementById('keywords').value,
        savedAt: new Date().toLocaleString()
      };
      saveDatabase();
      formStatus.textContent = 'Draft saved. It will be restored when you return to this form.';
    });

    function restoreDraft() {
      const draft = database.draft;
      if (!draft) return;
      ['title', 'authors', 'adviser', 'category', 'schoolYear', 'abstract', 'keywords'].forEach((field) => {
        const element = document.getElementById(field === 'title' ? 'thesisTitle' : field);
        if (element && draft[field]) element.value = draft[field];
      });
    }

    runPrecheck.addEventListener('click', runAiPrecheck);
    analyzeSubmission.addEventListener('click', runAiPrecheck);
    analyzeAi?.addEventListener('click', openArchivedAnalysis);
    closeArchivedAnalysis?.addEventListener('click', hideArchivedAnalysis);
    archivedAnalysisModal?.addEventListener('click', (event) => {
      if (event.target === archivedAnalysisModal) hideArchivedAnalysis();
    });
    runArchivedAnalysis?.addEventListener('click', analyzeArchivedManuscript);
    archivedDepartmentTabs.forEach((tab) => tab.addEventListener('click', () => {
      archivedDepartmentFilter = tab.dataset.archivedDepartmentTab || '';
      updateArchivedDepartmentTabs();
      renderArchivedAnalysisOptions();
    }));
    archivedAnalysisSearch?.addEventListener('input', renderArchivedAnalysisOptions);
    document.querySelectorAll('#thesisTitle, #authors, #adviser, #category, #schoolYear, #abstract, #keywords, #manuscriptFile')
      .forEach((field) => field.addEventListener('input', prepareAiForNewManuscript));
    setupMfa?.addEventListener('click', async () => {
      setupMfa.disabled = true;
      try {
        const setup = await apiRequest('/auth/mfa/setup', { method: 'POST' });
        window.alert(`Save this secret in your authenticator app:\n\n${setup.secret}\n\nManual setup URI:\n${setup.otpauthUrl}`);
        const code = window.prompt('Enter the six-digit authenticator code to confirm MFA:');
        if (!code) return;
        await apiRequest('/auth/mfa/confirm', { method: 'POST', body: JSON.stringify({ code }) });
        if (mfaStatus) { mfaStatus.textContent = 'Enabled'; mfaStatus.className = 'badge good'; }
        setupMfa.textContent = 'MFA Enabled';
      } catch (error) { window.alert(error.message); }
      finally { setupMfa.disabled = false; }
    });
    refreshAdminPanel?.addEventListener('click', async () => {
      refreshAdminPanel.disabled = true;
      try { await hydrateAdminPanel(); }
      catch (error) {
        if (adminRefreshStatus) adminRefreshStatus.textContent = 'Refresh failed';
        window.alert(error.message);
      }
      finally { refreshAdminPanel.disabled = false; }
    });
    repositorySearchButton?.addEventListener('click', async () => {
      try { await runRepositorySearch(1); } catch (error) { window.alert(error.message); }
    });
    [repositoryQuery, repositoryCategory, repositorySchoolYear, repositoryStatus].forEach((control) => {
      control?.addEventListener('change', () => repositorySearchButton?.click());
    });
    departmentTabs.forEach((tab) => tab.addEventListener('click', () => {
      if (!repositoryCategory) return;
      repositoryCategory.value = tab.dataset.departmentTab || '';
      updateDepartmentTabs();
      repositorySearchButton?.click();
    }));
    repositoryQuery?.addEventListener('input', (event) => loadSearchSuggestions(event.target.value));
    globalSearch?.addEventListener('input', (event) => loadSearchSuggestions(event.target.value));
    globalSearch?.addEventListener('keydown', async (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      repositoryQuery.value = globalSearch.value;
      showView('repository');
      try { await runRepositorySearch(1); } catch (error) { window.alert(error.message); }
    });
    previousSearchPage?.addEventListener('click', () => runRepositorySearch(Math.max(1, searchState.page - 1)).catch((error) => window.alert(error.message)));
    nextSearchPage?.addEventListener('click', () => runRepositorySearch(Math.min(searchState.totalPages, searchState.page + 1)).catch((error) => window.alert(error.message)));
    notificationButton.addEventListener('click', () => {
      const isOpen = notificationMenu.classList.toggle('active');
      notificationButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!notificationMenu.contains(event.target) && !notificationButton.contains(event.target)) {
        notificationMenu.classList.remove('active');
        notificationButton.setAttribute('aria-expanded', 'false');
      }
    });

    openHeatmap.addEventListener('click', showHeatmap);
    closeHeatmap.addEventListener('click', hideHeatmap);
    heatmapModal.addEventListener('click', (event) => {
      if (event.target === heatmapModal) hideHeatmap();
    });
    openRegister.addEventListener('click', showRegister);
    closeRegister.addEventListener('click', hideRegister);
    registerModal.addEventListener('click', (event) => {
      if (event.target === registerModal) hideRegister();
    });
    openPasswordReset?.addEventListener('click', () => showPasswordReset());
    closePasswordReset?.addEventListener('click', hidePasswordReset);
    passwordResetModal?.addEventListener('click', (event) => {
      if (event.target === passwordResetModal) hidePasswordReset();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        notificationMenu.classList.remove('active');
        notificationButton.setAttribute('aria-expanded', 'false');
        if (registerModal.classList.contains('active')) {
          hideRegister();
        }
        if (passwordResetModal?.classList.contains('active')) hidePasswordReset();
        if (archivedAnalysisModal?.classList.contains('active')) hideArchivedAnalysis();
      }
      if (event.key === 'Escape' && heatmapModal.classList.contains('active')) {
        hideHeatmap();
      }
    });

    applySession();
    renderRecords();
    updateDashboard();
    restoreAiState();
    renderNotifications();
    renderHeatmap();
    restoreDraft();

    const resetToken = new URLSearchParams(window.location.search).get('resetToken');
    if (resetToken) {
      showPasswordReset(resetToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (database.session) {
      hydrateFromApi().catch(() => {
        apiToken = '';
        database.session = null;
        applySession();
      });
      hydrateAdvisers().catch(() => {
        if (adviserSelect) adviserSelect.innerHTML = '<option value="">Unable to load advisers</option>';
      });
      startNotificationRefresh();
    }
