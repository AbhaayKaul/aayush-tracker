// Fetch and display leaderboard data
async function loadLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();

        if (data.success) {
            // Hide loading, show content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('leaderboardContent').style.display = 'block';

            // Populate overall stats
            document.getElementById('totalUsers').textContent = data.overall.totalUsers;
            document.getElementById('totalResponses').textContent = data.overall.totalResponses;
            document.getElementById('totalYes').textContent = data.overall.totalYes;
            document.getElementById('totalNo').textContent = data.overall.totalNo;
            document.getElementById('totalHehehe').textContent = data.overall.totalHehehe;
            document.getElementById('overallSuccessRate').textContent = data.overall.overallSuccessRate + '%';

            // Populate leaderboards
            displayLeaderboard('mostCallsBoard', data.leaderboards.mostCalls, 'calls', 'totalCalls');
            displayLeaderboard('mostSuccessfulBoard', data.leaderboards.mostSuccessful, 'success', 'successRate');
            displayLeaderboard('mostRejectedBoard', data.leaderboards.mostRejected, 'danger', 'noCalls');
            displayLeaderboard('mostHeheheBoard', data.leaderboards.mostHeheheBhai, 'warning', 'heheheBhaiCalls');
            displayLeaderboard('highestPareshaaniBoard', data.leaderboards.highestPareshaani, 'purple', 'pareshaaniPoints');
            displayLeaderboard('fastestResponseBoard', data.leaderboards.fastestResponse, 'info', 'avgResponseTime');
        } else {
            throw new Error('Failed to load leaderboard');
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="error">
                <p style="color: #f44336; font-size: 1.2rem;">❌ Failed to load leaderboard</p>
                <p style="color: #666; margin-top: 10px;">Please try refreshing the page</p>
            </div>
        `;
    }
}

// Display a specific leaderboard
function displayLeaderboard(containerId, data, badgeType, statKey) {
    const container = document.getElementById(containerId);
    
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No data yet!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map((user, index) => {
        const rank = index + 1;
        let rankClass = '';
        let rankDisplay = rank;

        // Special styling for top 3
        if (rank === 1) {
            rankClass = 'gold';
            rankDisplay = '🥇';
        } else if (rank === 2) {
            rankClass = 'silver';
            rankDisplay = '🥈';
        } else if (rank === 3) {
            rankClass = 'bronze';
            rankDisplay = '🥉';
        }

        // Format the stat value based on type
        let statValue = user[statKey];
        if (statKey === 'successRate') {
            statValue = statValue + '%';
        } else if (statKey === 'avgResponseTime') {
            statValue = '~' + statValue + ' mins';
        }

        return `
            <div class="leaderboard-item">
                <div class="rank ${rankClass}">${rankDisplay}</div>
                <div class="user-info">
                    <div class="user-name">${user.userName}</div>
                    <div class="user-email">${user.userEmail}</div>
                </div>
                <div class="stat-badge ${badgeType}">${statValue}</div>
            </div>
        `;
    }).join('');
}

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', loadLeaderboard);

