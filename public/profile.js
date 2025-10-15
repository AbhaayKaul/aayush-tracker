// Fetch and display user profile statistics
async function loadProfile() {
    try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();

        if (data.success) {
            // Hide loading, show content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('profileContent').style.display = 'block';

            // Populate user info
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userPicture').src = data.user.picture;
            
            // Format member since date
            const memberDate = new Date(data.user.memberSince);
            const formattedDate = memberDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            document.getElementById('memberSince').textContent = formattedDate;

            // Populate main stats
            document.getElementById('totalCalls').textContent = data.stats.totalCalls;
            document.getElementById('yesCalls').textContent = data.stats.yesCalls;
            document.getElementById('noCalls').textContent = data.stats.noCalls;
            document.getElementById('heheheBhaiCalls').textContent = data.stats.heheheBhaiCalls;
            document.getElementById('successRate').textContent = data.stats.successRate + '%';
            document.getElementById('pareshaaniPoints').textContent = data.stats.pareshaaniPoints;

            // Populate additional stats
            document.getElementById('avgResponseTime').textContent = data.stats.avgResponseTime;
            document.getElementById('fastestResponse').textContent = data.stats.fastestResponse;
            document.getElementById('slowestResponse').textContent = data.stats.slowestResponse;
            document.getElementById('mostCommonReason').textContent = data.stats.mostCommonReason;

            // Populate recent submissions
            displayRecentSubmissions(data.recentSubmissions);
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="error">
                <p style="color: #f44336; font-size: 1.2rem;">❌ Failed to load profile</p>
                <p style="color: #666; margin-top: 10px;">Please try refreshing the page</p>
            </div>
        `;
    }
}

// Display recent submissions
function displayRecentSubmissions(submissions) {
    const container = document.getElementById('recentSubmissions');
    
    if (submissions.length === 0) {
        container.innerHTML = `
            <div class="no-activity">
                <div class="no-activity-icon">📭</div>
                <p>No submissions yet. Time to bother Aayush!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = submissions.map(submission => {
        const statusClass = submission.status === 'yes' ? 'yes' : 
                           submission.status === 'no' ? 'no' : 'hehehe';
        const statusText = submission.status === 'yes' ? '✅ Came' : 
                          submission.status === 'no' ? '❌ Didn\'t Come' : '🎉 Hehehe Bhai';
        const borderClass = submission.status === 'yes' ? 'status-yes' : 
                           submission.status === 'no' ? 'status-no' : 'status-hehehe';
        
        // Format the date
        const date = new Date(submission.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const formattedTime = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        let additionalInfo = '';
        if (submission.status === 'yes' && submission.time_taken) {
            additionalInfo = `<p class="activity-time">⏱️ Time taken: ${submission.time_taken}</p>`;
        }

        return `
            <div class="activity-item ${borderClass}">
                <div class="activity-header">
                    <span class="activity-date">📅 ${formattedDate}</span>
                    <span class="activity-status ${statusClass}">${statusText}</span>
                </div>
                <p class="activity-reason"><strong>Reason:</strong> ${submission.reason}</p>
                ${additionalInfo}
                <p class="activity-time">🕐 ${formattedTime}</p>
            </div>
        `;
    }).join('');
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout';
    }
});

// Load profile on page load
document.addEventListener('DOMContentLoaded', loadProfile);

