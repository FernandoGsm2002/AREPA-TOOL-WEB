// Supabase Configuration
const SUPABASE_URL = 'https://lumhpjfndlqhexnjmvtu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bWhwamZuZGxxaGV4bmptdnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjY1NjcsImV4cCI6MjA3OTA0MjU2N30.oXVYUjnSpDDQphLZJzglGaDSQTjuGzYgD-LMC5FwDHw';

// Verificar que Supabase esté cargado
if (typeof window.supabase === 'undefined') {
    console.error('Supabase library not loaded!');
    alert('Error: Supabase library not loaded. Please refresh the page.');
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentFilter = 'all';
let currentUserId = null;
let allUsers = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing ArepaTool V1.0.1 Admin Panel...');
    console.log('Supabase URL:', SUPABASE_URL);
    
    try {
        await loadUsers();
        await loadSessions();
        await loadAuditLogs();
        await updateStatistics();
        
        console.log('Panel initialized successfully!');
        
        // Auto-refresh every 30 seconds
        setInterval(async () => {
            if (document.getElementById('users-section').style.display !== 'none') {
                await loadUsers();
            }
        }, 30000);
    } catch (error) {
        console.error('Error initializing panel:', error);
        alert('Error initializing panel. Check console for details.');
    }
});

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.list-group-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Add active class to clicked nav item
    event.target.closest('.list-group-item').classList.add('active');
    
    // Load data for section
    switch(section) {
        case 'users':
            loadUsers();
            break;
        case 'sessions':
            loadSessions();
            break;
        case 'audit':
            loadAuditLogs();
            break;
        case 'stats':
            updateStatistics();
            break;
    }
}

// Load Users
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allUsers = data;
        displayUsers(data);
        updateUserCounts(data);
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td>
                <span class="badge status-badge ${getStatusClass(user.status)}">
                    ${user.status.toUpperCase()}
                </span>
            </td>
            <td>
                ${user.activated_at ? formatDate(user.activated_at) + ' - ' + formatDate(user.subscription_end) : 'Not activated'}
                ${user.subscription_end && isExpired(user.subscription_end) ? '<span class="badge bg-danger ms-2">EXPIRED</span>' : ''}
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-action" onclick="editUser('${user.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                ${user.status === 'pending' ? `
                    <button class="btn btn-sm btn-success btn-action" onclick="approveUser('${user.id}')">
                        <i class="bi bi-check-circle"></i> Approve
                    </button>
                ` : ''}
                ${user.status === 'active' ? `
                    <button class="btn btn-sm btn-warning btn-action" onclick="suspendUser('${user.id}')">
                        <i class="bi bi-pause-circle"></i> Suspend
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-info btn-action" onclick="sendPasswordResetEmail('${user.id}')" title="Send password reset email">
                    <i class="bi bi-key"></i> Reset Password
                </button>
            </td>
        </tr>
    `).join('');
}

function updateUserCounts(users) {
    const counts = {
        all: users.length,
        pending: users.filter(u => u.status === 'pending').length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length
    };
    
    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-pending').textContent = counts.pending;
    document.getElementById('count-active').textContent = counts.active;
    document.getElementById('count-suspended').textContent = counts.suspended;
}

function filterUsers(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.nav-tabs .nav-link').forEach(el => {
        el.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter users
    const filtered = status === 'all' 
        ? allUsers 
        : allUsers.filter(u => u.status === status);
    
    displayUsers(filtered);
}

// User Actions
async function approveUser(userId) {
    if (!confirm('Approve this user?')) return;
    
    try {
        const now = new Date().toISOString();
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error } = await supabase
            .from('users')
            .update({ 
                status: 'active',
                activated_at: now,
                subscription_end: oneYearLater
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        await logAudit(userId, 'approve_user', 'User approved and activated');
        await loadUsers();
        showSuccess('User approved successfully');
    } catch (error) {
        console.error('Error approving user:', error);
        showError('Failed to approve user');
    }
}

async function suspendUser(userId) {
    if (!confirm('Suspend this user?')) return;
    
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'suspended' })
            .eq('id', userId);
        
        if (error) throw error;
        
        await logAudit(userId, 'suspend_user', 'User suspended');
        await loadUsers();
        showSuccess('User suspended successfully');
    } catch (error) {
        console.error('Error suspending user:', error);
        showError('Failed to suspend user');
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    currentUserId = userId;
    document.getElementById('modal-username').value = user.username;
    document.getElementById('modal-status').value = user.status;
    document.getElementById('modal-subscription-end').value = user.subscription_end.split('T')[0];
    
    const modal = new bootstrap.Modal(document.getElementById('userActionModal'));
    modal.show();
}

async function saveUserChanges() {
    try {
        const status = document.getElementById('modal-status').value;
        const subscriptionEnd = document.getElementById('modal-subscription-end').value;
        
        const { error } = await supabase
            .from('users')
            .update({ 
                status,
                subscription_end: new Date(subscriptionEnd).toISOString()
            })
            .eq('id', currentUserId);
        
        if (error) throw error;
        
        await logAudit(currentUserId, 'update_user', `Status: ${status}, Subscription updated`);
        
        bootstrap.Modal.getInstance(document.getElementById('userActionModal')).hide();
        await loadUsers();
        showSuccess('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        showError('Failed to update user');
    }
}

// =====================================================
// PASSWORD RESET MANAGEMENT
// =====================================================

async function sendPasswordResetEmail(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showError('User not found');
        return;
    }

    if (!confirm(`Send password reset email to ${user.email}?`)) {
        return;
    }

    try {
        console.log('Sending password reset to:', user.email);
        
        // Usar la API REST de Supabase directamente
        // Esto asegura que use el template personalizado
        const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: user.email,
                options: {
                    redirectTo: `${window.location.origin}/reset-password`
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send reset email');
        }

        console.log('Password reset email sent successfully');

        await logAudit(userId, 'password_reset_sent', `Password reset email sent to ${user.email}`);
        showSuccess(`✅ Password reset email sent to ${user.email}\n\nThe user will receive an email with a reset link that expires in 1 hour.`);
    } catch (error) {
        console.error('Error sending password reset:', error);
        showError('Failed to send password reset email: ' + error.message);
    }
}

// Load Sessions
async function loadSessions() {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                *,
                users (username)
            `)
            .order('last_activity', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('sessions-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No active sessions</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(session => `
            <tr>
                <td><strong>${session.users?.username || 'Unknown'}</strong></td>
                <td><code>${session.device_id}</code></td>
                <td>${session.ip_address}</td>
                <td>${formatDateTime(session.last_activity)}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-action" onclick="terminateSession('${session.id}')">
                        <i class="bi bi-x-circle"></i> Terminate
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading sessions:', error);
        showError('Failed to load sessions');
    }
}

async function terminateSession(sessionId) {
    if (!confirm('Terminate this session?')) return;
    
    try {
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId);
        
        if (error) throw error;
        
        await loadSessions();
        showSuccess('Session terminated');
    } catch (error) {
        console.error('Error terminating session:', error);
        showError('Failed to terminate session');
    }
}

// Load Audit Logs
async function loadAuditLogs() {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                users (username)
            `)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        
        const tbody = document.getElementById('audit-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No audit logs</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(log => `
            <tr>
                <td>${formatDateTime(log.created_at)}</td>
                <td><strong>${log.users?.username || 'System'}</strong></td>
                <td><span class="badge bg-info">${log.action}</span></td>
                <td>${log.details || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading audit logs:', error);
        showError('Failed to load audit logs');
    }
}

async function logAudit(userId, action, details) {
    try {
        await supabase
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                details,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}

// Statistics
async function updateStatistics() {
    try {
        const { data: users } = await supabase.from('users').select('status');
        const { data: sessions } = await supabase.from('sessions').select('id');
        
        document.getElementById('stat-total-users').textContent = users?.length || 0;
        document.getElementById('stat-active-users').textContent = 
            users?.filter(u => u.status === 'active').length || 0;
        document.getElementById('stat-pending-users').textContent = 
            users?.filter(u => u.status === 'pending').length || 0;
        document.getElementById('stat-active-sessions').textContent = sessions?.length || 0;
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Utility Functions
function getStatusClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'active': 'bg-success',
        'suspended': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isExpired(dateString) {
    return new Date(dateString) < new Date();
}

function refreshUsers() {
    loadUsers();
    showSuccess('Users refreshed');
}

function showSuccess(message) {
    // Simple alert for now - can be replaced with toast notifications
    alert(message);
}

function showError(message) {
    alert('Error: ' + message);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
}


// =====================================================
// UPDATES MANAGEMENT
// =====================================================

async function loadVersions() {
    try {
        const { data, error } = await supabase
            .from('app_versions')
            .select('*')
            .order('release_date', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('versions-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No versions found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(version => `
            <tr>
                <td><strong>${version.version}</strong></td>
                <td>${formatDate(version.release_date)}</td>
                <td><a href="${version.download_url}" target="_blank" class="text-truncate d-inline-block" style="max-width: 200px;">${version.download_url}</a></td>
                <td>
                    ${version.is_mandatory ? '<span class="badge bg-danger">YES</span>' : '<span class="badge bg-secondary">NO</span>'}
                </td>
                <td>
                    ${version.is_active ? '<span class="badge bg-success">ACTIVE</span>' : '<span class="badge bg-secondary">INACTIVE</span>'}
                </td>
                <td>
                    ${version.is_active ? `
                        <button class="btn btn-sm btn-warning btn-action" onclick="deactivateVersion('${version.id}')">
                            <i class="bi bi-pause-circle"></i> Deactivate
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success btn-action" onclick="activateVersion('${version.id}')">
                            <i class="bi bi-play-circle"></i> Activate
                        </button>
                    `}
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteVersion('${version.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading versions:', error);
        showError('Failed to load versions');
    }
}

function showAddVersionModal() {
    const modal = new bootstrap.Modal(document.getElementById('addVersionModal'));
    modal.show();
}

async function saveNewVersion() {
    try {
        const version = document.getElementById('version-number').value.trim();
        const downloadUrl = document.getElementById('version-url').value.trim();
        const changelog = document.getElementById('version-changelog').value.trim();
        const isMandatory = document.getElementById('version-mandatory').checked;
        
        if (!version || !downloadUrl) {
            showError('Version number and download URL are required');
            return;
        }
        
        const { error } = await supabase
            .from('app_versions')
            .insert({
                version,
                download_url: downloadUrl,
                changelog: changelog || null,
                is_mandatory: isMandatory,
                is_active: true,
                release_date: new Date().toISOString()
            });
        
        if (error) throw error;
        
        bootstrap.Modal.getInstance(document.getElementById('addVersionModal')).hide();
        await loadVersions();
        showSuccess('Version created successfully');
        
        // Clear form
        document.getElementById('version-number').value = '';
        document.getElementById('version-url').value = '';
        document.getElementById('version-changelog').value = '';
        document.getElementById('version-mandatory').checked = false;
    } catch (error) {
        console.error('Error creating version:', error);
        showError('Failed to create version: ' + error.message);
    }
}

async function activateVersion(versionId) {
    if (!confirm('Activate this version?')) return;
    
    try {
        const { error } = await supabase
            .from('app_versions')
            .update({ is_active: true })
            .eq('id', versionId);
        
        if (error) throw error;
        
        await loadVersions();
        showSuccess('Version activated');
    } catch (error) {
        console.error('Error activating version:', error);
        showError('Failed to activate version');
    }
}

async function deactivateVersion(versionId) {
    if (!confirm('Deactivate this version?')) return;
    
    try {
        const { error } = await supabase
            .from('app_versions')
            .update({ is_active: false })
            .eq('id', versionId);
        
        if (error) throw error;
        
        await loadVersions();
        showSuccess('Version deactivated');
    } catch (error) {
        console.error('Error deactivating version:', error);
        showError('Failed to deactivate version');
    }
}

async function deleteVersion(versionId) {
    if (!confirm('Delete this version? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('app_versions')
            .delete()
            .eq('id', versionId);
        
        if (error) throw error;
        
        await loadVersions();
        showSuccess('Version deleted');
    } catch (error) {
        console.error('Error deleting version:', error);
        showError('Failed to delete version');
    }
}

// =====================================================
// ANNOUNCEMENTS MANAGEMENT
// =====================================================

async function loadAnnouncements() {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('priority', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.getElementById('announcements-table-body');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No announcements found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(announcement => `
            <tr>
                <td><strong>${announcement.title}</strong></td>
                <td><span class="badge ${getAnnouncementTypeClass(announcement.type)}">${announcement.type.toUpperCase()}</span></td>
                <td><span class="badge bg-info">${announcement.priority}</span></td>
                <td><span class="badge bg-secondary">${announcement.target_users.toUpperCase()}</span></td>
                <td>
                    ${announcement.start_date ? formatDate(announcement.start_date) : 'Now'} - 
                    ${announcement.end_date ? formatDate(announcement.end_date) : 'Forever'}
                </td>
                <td>
                    ${announcement.is_active ? '<span class="badge bg-success">ACTIVE</span>' : '<span class="badge bg-secondary">INACTIVE</span>'}
                </td>
                <td>
                    ${announcement.is_active ? `
                        <button class="btn btn-sm btn-warning btn-action" onclick="deactivateAnnouncement('${announcement.id}')">
                            <i class="bi bi-pause-circle"></i> Deactivate
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success btn-action" onclick="activateAnnouncement('${announcement.id}')">
                            <i class="bi bi-play-circle"></i> Activate
                        </button>
                    `}
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteAnnouncement('${announcement.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        showError('Failed to load announcements');
    }
}

function showAddAnnouncementModal() {
    const modal = new bootstrap.Modal(document.getElementById('addAnnouncementModal'));
    modal.show();
}

async function saveNewAnnouncement() {
    try {
        const title = document.getElementById('announcement-title').value.trim();
        const message = document.getElementById('announcement-message').value.trim();
        const type = document.getElementById('announcement-type').value;
        const priority = parseInt(document.getElementById('announcement-priority').value);
        const target = document.getElementById('announcement-target').value;
        const startDate = document.getElementById('announcement-start').value;
        const endDate = document.getElementById('announcement-end').value;
        
        if (!title || !message) {
            showError('Title and message are required');
            return;
        }
        
        const { error } = await supabase
            .from('announcements')
            .insert({
                title,
                message,
                type,
                priority,
                target_users: target,
                start_date: startDate || null,
                end_date: endDate || null,
                is_active: true,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        bootstrap.Modal.getInstance(document.getElementById('addAnnouncementModal')).hide();
        await loadAnnouncements();
        showSuccess('Announcement created successfully');
        
        // Clear form
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-message').value = '';
        document.getElementById('announcement-type').value = 'info';
        document.getElementById('announcement-priority').value = '0';
        document.getElementById('announcement-target').value = 'all';
        document.getElementById('announcement-start').value = '';
        document.getElementById('announcement-end').value = '';
    } catch (error) {
        console.error('Error creating announcement:', error);
        showError('Failed to create announcement: ' + error.message);
    }
}

async function activateAnnouncement(announcementId) {
    if (!confirm('Activate this announcement?')) return;
    
    try {
        const { error } = await supabase
            .from('announcements')
            .update({ is_active: true })
            .eq('id', announcementId);
        
        if (error) throw error;
        
        await loadAnnouncements();
        showSuccess('Announcement activated');
    } catch (error) {
        console.error('Error activating announcement:', error);
        showError('Failed to activate announcement');
    }
}

async function deactivateAnnouncement(announcementId) {
    if (!confirm('Deactivate this announcement?')) return;
    
    try {
        const { error } = await supabase
            .from('announcements')
            .update({ is_active: false })
            .eq('id', announcementId);
        
        if (error) throw error;
        
        await loadAnnouncements();
        showSuccess('Announcement deactivated');
    } catch (error) {
        console.error('Error deactivating announcement:', error);
        showError('Failed to deactivate announcement');
    }
}

async function deleteAnnouncement(announcementId) {
    if (!confirm('Delete this announcement? This action cannot be undone.')) return;
    
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);
        
        if (error) throw error;
        
        await loadAnnouncements();
        showSuccess('Announcement deleted');
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showError('Failed to delete announcement');
    }
}

function getAnnouncementTypeClass(type) {
    const classes = {
        'info': 'bg-info',
        'warning': 'bg-warning',
        'error': 'bg-danger',
        'success': 'bg-success'
    };
    return classes[type] || 'bg-secondary';
}

// Update showSection to load data for new sections
const originalShowSection = showSection;
showSection = function(section) {
    originalShowSection(section);
    
    switch(section) {
        case 'updates':
            loadVersions();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
    }
};


// =====================================================
// LICENSE CONFIGURATION MANAGEMENT
// =====================================================

async function loadLicenseConfig() {
    try {
        const { data, error } = await supabase
            .from('app_config')
            .select('*');
        
        if (error) throw error;
        
        // Convertir array a objeto key-value
        const config = {};
        data.forEach(item => {
            config[item.key] = item.value;
        });
        
        // Llenar formulario (solo 3 campos)
        document.getElementById('license-app-enabled').value = config.app_enabled || 'true';
        document.getElementById('license-min-version').value = config.app_minimum_version || '1.0.0';
        document.getElementById('license-disabled-message').value = config.app_disabled_message || '';
        
        // Mostrar estado actual
        const isEnabled = config.app_enabled === 'true';
        const statusAlert = document.createElement('div');
        statusAlert.className = `alert ${isEnabled ? 'alert-success' : 'alert-danger'} mb-4`;
        statusAlert.innerHTML = `
            <i class="bi bi-${isEnabled ? 'check-circle' : 'x-circle'}"></i> 
            <strong>Estado Actual:</strong> La aplicación está ${isEnabled ? 'HABILITADA ✅' : 'DESHABILITADA ❌'}
        `;
        
        const cardBody = document.querySelector('#license-section .card-body');
        const existingAlert = cardBody.querySelector('.alert-success, .alert-danger');
        if (existingAlert) {
            existingAlert.remove();
        }
        cardBody.insertBefore(statusAlert, cardBody.firstChild);
        
    } catch (error) {
        console.error('Error loading license config:', error);
        showError('Failed to load license configuration');
    }
}

async function saveLicenseConfig() {
    if (!confirm('¿Guardar cambios en la configuración de licencia?\n\nLos cambios se aplicarán inmediatamente a todos los usuarios.')) {
        return;
    }
    
    try {
        const updates = [
            { key: 'app_enabled', value: document.getElementById('license-app-enabled').value },
            { key: 'app_minimum_version', value: document.getElementById('license-min-version').value },
            { key: 'app_disabled_message', value: document.getElementById('license-disabled-message').value }
        ];
        
        // Actualizar cada configuración
        for (const update of updates) {
            const { error } = await supabase
                .from('app_config')
                .update({ 
                    value: update.value,
                    updated_at: new Date().toISOString()
                })
                .eq('key', update.key);
            
            if (error) throw error;
        }
        
        await loadLicenseConfig();
        showSuccess('License configuration saved successfully!\n\nChanges are now active for all users.');
        
    } catch (error) {
        console.error('Error saving license config:', error);
        showError('Failed to save license configuration: ' + error.message);
    }
}

// Update showSection to load license config
const originalShowSection2 = showSection;
showSection = function(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.list-group-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Add active class to clicked nav item
    event.target.closest('.list-group-item').classList.add('active');
    
    // Load data for section
    switch(section) {
        case 'users':
            loadUsers();
            break;
        case 'sessions':
            loadSessions();
            break;
        case 'audit':
            loadAuditLogs();
            break;
        case 'stats':
            updateStatistics();
            break;
        case 'updates':
            loadVersions();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'license':
            loadLicenseConfig();
            break;
        case 'bypass':
            loadBypassRegistrations();
            break;
    }
};


// =====================================================
// BYPASS REGISTRATIONS MANAGEMENT
// =====================================================

let bypassRegistrations = [];
let bypassFilter = 'all';
let bypassRealtimeChannel = null;

async function loadBypassRegistrations() {
    try {
        const { data, error } = await supabase
            .from('bypass_registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        bypassRegistrations = data || [];
        updateBypassCounts();
        renderBypassTable();

        // Iniciar realtime si no está activo
        if (!bypassRealtimeChannel) {
            subscribeToBypassChanges();
        }
    } catch (error) {
        console.error('Error loading bypass registrations:', error);
        document.getElementById('bypass-table-body').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">Error loading data: ${error.message}</td></tr>
        `;
    }
}

function subscribeToBypassChanges() {
    // Cancelar suscripción anterior si existe
    if (bypassRealtimeChannel) {
        supabase.removeChannel(bypassRealtimeChannel);
    }

    // Crear nueva suscripción
    bypassRealtimeChannel = supabase
        .channel('bypass_registrations_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'bypass_registrations'
            },
            (payload) => {
                console.log('Bypass registration change detected:', payload);
                
                // Actualizar la lista local
                if (payload.eventType === 'INSERT') {
                    bypassRegistrations.unshift(payload.new);
                    showNotification('New bypass registration received!', 'info');
                } else if (payload.eventType === 'UPDATE') {
                    const index = bypassRegistrations.findIndex(r => r.id === payload.new.id);
                    if (index !== -1) {
                        bypassRegistrations[index] = payload.new;
                    }
                } else if (payload.eventType === 'DELETE') {
                    bypassRegistrations = bypassRegistrations.filter(r => r.id !== payload.old.id);
                }

                updateBypassCounts();
                renderBypassTable();
            }
        )
        .subscribe();

    console.log('Subscribed to bypass registrations realtime updates');
}

function updateBypassCounts() {
    const counts = {
        all: bypassRegistrations.length,
        pending: bypassRegistrations.filter(r => r.status === 'pending').length,
        approved: bypassRegistrations.filter(r => r.status === 'approved').length,
        rejected: bypassRegistrations.filter(r => r.status === 'rejected').length
    };

    document.getElementById('bypass-count-all').textContent = counts.all;
    document.getElementById('bypass-count-pending').textContent = counts.pending;
    document.getElementById('bypass-count-approved').textContent = counts.approved;
    document.getElementById('bypass-count-rejected').textContent = counts.rejected;

    // Actualizar badge en sidebar
    const badge = document.getElementById('bypass-pending-count');
    if (counts.pending > 0) {
        badge.textContent = counts.pending;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

function filterBypassRegistrations(status) {
    bypassFilter = status;
    
    // Actualizar tabs activos
    document.querySelectorAll('#bypass-section .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderBypassTable();
}

function renderBypassTable() {
    const tbody = document.getElementById('bypass-table-body');
    
    let filtered = bypassRegistrations;
    if (bypassFilter !== 'all') {
        filtered = bypassRegistrations.filter(r => r.status === bypassFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No registrations found</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(reg => {
        const statusBadge = {
            'pending': '<span class="badge bg-warning">Pending</span>',
            'approved': '<span class="badge bg-success">Approved</span>',
            'rejected': '<span class="badge bg-danger">Rejected</span>'
        }[reg.status] || '<span class="badge bg-secondary">Unknown</span>';

        const createdDate = new Date(reg.created_at).toLocaleString();
        const updatedDate = new Date(reg.updated_at).toLocaleString();

        return `
            <tr>
                <td><strong>${reg.serial_number}</strong></td>
                <td>${reg.username}</td>
                <td>${reg.user_email || '-'}</td>
                <td>${statusBadge}</td>
                <td>${createdDate}</td>
                <td>${updatedDate}</td>
                <td>
                    ${reg.status === 'pending' ? `
                        <button class="btn btn-sm btn-success me-1" onclick="approveBypass('${reg.id}')">
                            <i class="bi bi-check-circle"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger me-1" onclick="rejectBypass('${reg.id}')">
                            <i class="bi bi-x-circle"></i> Reject
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-info me-1" onclick="viewBypassDetails('${reg.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBypass('${reg.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function approveBypass(id) {
    const notes = prompt('Enter approval notes (optional):');
    if (notes === null) return; // User cancelled

    try {
        const { error } = await supabase
            .from('bypass_registrations')
            .update({
                status: 'approved',
                admin_notes: notes || 'Approved by admin',
                approved_by: 'admin',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        showNotification('Registration approved successfully!', 'success');
    } catch (error) {
        console.error('Error approving bypass:', error);
        alert('Error approving registration: ' + error.message);
    }
}

async function rejectBypass(id) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) {
        alert('Rejection reason is required');
        return;
    }

    try {
        const { error } = await supabase
            .from('bypass_registrations')
            .update({
                status: 'rejected',
                admin_notes: reason,
                approved_by: 'admin',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        showNotification('Registration rejected', 'warning');
    } catch (error) {
        console.error('Error rejecting bypass:', error);
        alert('Error rejecting registration: ' + error.message);
    }
}

async function deleteBypass(id) {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
        const { error } = await supabase
            .from('bypass_registrations')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showNotification('Registration deleted', 'info');
    } catch (error) {
        console.error('Error deleting bypass:', error);
        alert('Error deleting registration: ' + error.message);
    }
}

function viewBypassDetails(id) {
    const reg = bypassRegistrations.find(r => r.id === id);
    if (!reg) return;

    const details = `
Serial Number: ${reg.serial_number}
Username: ${reg.username}
Email: ${reg.user_email || 'N/A'}
Status: ${reg.status.toUpperCase()}
Admin Notes: ${reg.admin_notes || 'None'}
Approved By: ${reg.approved_by || 'N/A'}
Created: ${new Date(reg.created_at).toLocaleString()}
Updated: ${new Date(reg.updated_at).toLocaleString()}
Device Info: ${JSON.stringify(reg.device_info, null, 2)}
    `;

    alert(details);
}

function refreshBypassRegistrations() {
    loadBypassRegistrations();
}

function showNotification(message, type = 'info') {
    // Simple notification - you can enhance this with a toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Optional: Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ArepaTool V1.0.1 Admin', {
            body: message,
            icon: '/favicon.ico'
        });
    }
}
