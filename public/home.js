// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        const user = await response.json();
        
        if (user && user.name) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').src = user.picture || '/default-avatar.png';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // Redirect to login if not authenticated
        window.location.href = '/login.html';
    }
}

// Load user info when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
});

