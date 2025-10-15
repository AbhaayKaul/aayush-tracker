// Get DOM elements
const responsesContainer = document.getElementById('responsesContainer');
const refreshBtn = document.getElementById('refreshBtn');
const totalResponsesEl = document.getElementById('totalResponses');
const yesCountEl = document.getElementById('yesCount');
const noCountEl = document.getElementById('noCount');
const heheheCountEl = document.getElementById('heheheCount');

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format timestamp
function formatTimestamp(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calculate statistics
function calculateStats(responses) {
    const stats = {
        total: responses.length,
        yes: 0,
        no: 0,
        hehehe: 0
    };

    responses.forEach(response => {
        const status = response.aayush_status || response.q4;
        if (status === 'yes') stats.yes++;
        else if (status === 'no') stats.no++;
        else if (status === 'hehehe bhai') stats.hehehe++;
    });

    return stats;
}

// Update stats display
function updateStats(stats) {
    totalResponsesEl.textContent = stats.total;
    yesCountEl.textContent = stats.yes;
    noCountEl.textContent = stats.no;
    heheheCountEl.textContent = stats.hehehe;
}

// Display responses
function displayResponses(responses) {
    if (responses.length === 0) {
        responsesContainer.innerHTML = `
            <div class="no-responses">
                <div class="no-responses-icon">📭</div>
                <p>No responses yet. Be the first to submit!</p>
            </div>
        `;
        return;
    }

    // Calculate and update stats
    const stats = calculateStats(responses);
    updateStats(stats);
    
    // Sort by timestamp (newest first)
    responses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const html = responses.map(response => {
        const status = response.aayush_status || response.q4;
        const statusClass = status === 'yes' ? 'status-yes' : 
                           status === 'no' ? 'status-no' : 'status-hehehe';
        
        return `
            <div class="response-card ${statusClass}">
                <div class="response-header">
                    <div>
                        <div class="response-name">${escapeHtml(response.name || response.q1)}</div>
                        <div class="response-date">📅 ${formatDate(response.date || response.q2)}</div>
                    </div>
                    <div class="response-time">${formatTimestamp(response.createdAt)}</div>
                </div>
                <div class="response-body">
                    <div class="response-field">
                        <span class="field-label">Reason for calling:</span>
                        <span class="field-value">${escapeHtml(response.reason || response.q3)}</span>
                    </div>
                    <div class="response-field">
                        <span class="field-label">Aayush Status:</span>
                        <span class="field-value">
                            <span class="status-badge ${statusClass}">
                                ${escapeHtml(status)}
                            </span>
                        </span>
                    </div>
                    ${response.time_taken || response.q5 ? `
                        <div class="response-field">
                            <span class="field-label">⏱️ Time Taken:</span>
                            <span class="field-value">${escapeHtml(response.time_taken || response.q5)}</span>
                        </div>
                    ` : ''}
                    ${response.reason_not_coming || response.q6 ? `
                        <div class="response-field">
                            <span class="field-label">❌ Reason Not Coming:</span>
                            <span class="field-value">${escapeHtml(response.reason_not_coming || response.q6)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    responsesContainer.innerHTML = html;
}

// Load responses from API
async function loadResponses() {
    try {
        responsesContainer.innerHTML = '<p class="loading">Loading responses...</p>';
        
        const response = await fetch('/api/responses');
        const responses = await response.json();
        
        displayResponses(responses);
    } catch (error) {
        console.error('Error loading responses:', error);
        responsesContainer.innerHTML = '<p class="no-responses">Failed to load responses. Please try again.</p>';
    }
}

// Refresh button handler
refreshBtn.addEventListener('click', () => {
    loadResponses();
});

// Load responses when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadResponses();
});

