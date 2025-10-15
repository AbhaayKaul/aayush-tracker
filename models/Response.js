const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    aayush_status: {
        type: String,
        required: true,
        enum: ['yes', 'no', 'hehehe bhai']
    },
    time_taken: {
        type: String,
        required: false
    },
    reason_not_coming: {
        type: String,
        required: false
    },
    // Store all question answers
    q1: String,
    q2: String,
    q3: String,
    q4: String,
    q5: String,
    q6: String,
    message: String,
    
    // Link to user who submitted it
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String
    },
    userEmail: {
        type: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Response', responseSchema);

