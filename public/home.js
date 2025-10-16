// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        
        // Only redirect if we get a 401/403 (authentication error)
        if (response.status === 401 || response.status === 403 || response.redirected) {
            console.log('Not authenticated, redirecting to login...');
            window.location.href = '/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        
        if (user && user.name) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').src = user.picture || '/default-avatar.png';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // Don't redirect on network errors, just show error
        document.getElementById('userName').textContent = 'Error loading user';
    }
}

// Load user info when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
});

