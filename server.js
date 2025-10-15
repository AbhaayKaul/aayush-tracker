require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const Response = require('./models/Response');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static('public'));

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0].value
            });
            console.log('✅ New user created:', user.email);
        }
        
        return done(null, user);
    } catch (error) {
        console.error('❌ Error in Google Strategy:', error);
        return done(error, null);
    }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html');
}

// Authentication Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login.html' }),
    (req, res) => {
        res.redirect('/home.html');
    }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login.html');
    });
});

// Root route - redirect based on authentication
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/home.html');
    } else {
        res.redirect('/login.html');
    }
});

// Protected route - form page
app.get('/form', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

// API endpoint to get current user
app.get('/api/user', isAuthenticated, (req, res) => {
    res.json({
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
    });
});

// API endpoint to get user profile statistics
app.get('/api/user/stats', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('📊 Fetching stats for user:', userId, req.user.email);
        
        // Get all responses by this user
        const userResponses = await Response.find({ userId: userId }).sort({ createdAt: -1 });
        console.log('📊 Found', userResponses.length, 'responses for this user');
        
        // Calculate statistics
        const totalCalls = userResponses.length;
        const yesCalls = userResponses.filter(r => r.aayush_status === 'yes').length;
        const noCalls = userResponses.filter(r => r.aayush_status === 'no').length;
        const heheheBhaiCalls = userResponses.filter(r => r.aayush_status === 'hehehe bhai').length;
        
        // Success rate (percentage of times Aayush came)
        const successRate = totalCalls > 0 ? ((yesCalls / totalCalls) * 100).toFixed(1) : 0;
        
        // Calculate average response time (only for 'yes' responses with time_taken)
        const yesResponses = userResponses.filter(r => r.aayush_status === 'yes' && r.time_taken);
        let avgResponseTime = 'N/A';
        if (yesResponses.length > 0) {
            // Map time ranges to numeric values for averaging
            const timeMapping = {
                'immediately(2-5 mins)': 3.5,
                '5-15 mins': 10,
                'more than 15 mins': 20
            };
            const totalTime = yesResponses.reduce((sum, r) => sum + (timeMapping[r.time_taken] || 0), 0);
            const avgMinutes = (totalTime / yesResponses.length).toFixed(1);
            avgResponseTime = `~${avgMinutes} mins`;
        }
        
        // Get most common reason
        const reasons = userResponses.map(r => r.reason);
        const reasonCounts = {};
        reasons.forEach(reason => {
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
        const mostCommonReason = Object.keys(reasonCounts).length > 0 
            ? Object.keys(reasonCounts).reduce((a, b) => reasonCounts[a] > reasonCounts[b] ? a : b)
            : 'N/A';
        
        // Get fastest and slowest response times
        let fastestResponse = 'N/A';
        let slowestResponse = 'N/A';
        if (yesResponses.length > 0) {
            const times = yesResponses.map(r => r.time_taken);
            if (times.includes('immediately(2-5 mins)')) fastestResponse = '2-5 mins';
            else if (times.includes('5-15 mins')) fastestResponse = '5-15 mins';
            
            if (times.includes('more than 15 mins')) slowestResponse = '15+ mins';
            else if (times.includes('5-15 mins')) slowestResponse = '5-15 mins';
        }
        
        // Recent submissions (last 5)
        const recentSubmissions = userResponses.slice(0, 5).map(r => ({
            date: r.date,
            reason: r.reason,
            status: r.aayush_status,
            time_taken: r.time_taken,
            createdAt: r.createdAt
        }));
        
        // Member since
        const memberSince = req.user.createdAt || new Date();
        
        // Calculate "Pareshaani Points" (funny metric)
        // Formula: noCalls * 10 + heheheBhai * 50 + yesCalls * 5
        const pareshaaniPoints = (noCalls * 10) + (heheheBhaiCalls * 50) + (yesCalls * 5);
        
        res.json({
            success: true,
            user: {
                name: req.user.name,
                email: req.user.email,
                picture: req.user.picture,
                memberSince: memberSince
            },
            stats: {
                totalCalls,
                yesCalls,
                noCalls,
                heheheBhaiCalls,
                successRate,
                avgResponseTime,
                mostCommonReason,
                fastestResponse,
                slowestResponse,
                pareshaaniPoints
            },
            recentSubmissions
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user statistics' });
    }
});

// Protected route - dashboard
app.get('/dashboard.html', isAuthenticated, (req, res, next) => {
    next();
});

// Protected route - profile
app.get('/profile.html', isAuthenticated, (req, res, next) => {
    next();
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/profile.html');
});

// Protected route - leaderboard
app.get('/leaderboard.html', isAuthenticated, (req, res, next) => {
    next();
});

app.get('/leaderboard', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/leaderboard.html');
});

// API endpoint to get leaderboard data
app.get('/api/leaderboard', isAuthenticated, async (req, res) => {
    try {
        // Get all responses with user information
        const allResponses = await Response.find({}).sort({ createdAt: -1 });
        
        // Group by user
        const userStats = {};
        
        allResponses.forEach(response => {
            const userId = response.userId?.toString();
            if (!userId) return; // Skip responses without user
            
            if (!userStats[userId]) {
                userStats[userId] = {
                    userId: userId,
                    userName: response.userName || 'Unknown',
                    userEmail: response.userEmail || '',
                    totalCalls: 0,
                    yesCalls: 0,
                    noCalls: 0,
                    heheheBhaiCalls: 0,
                    totalResponseTime: 0,
                    responseTimeCount: 0
                };
            }
            
            userStats[userId].totalCalls++;
            
            if (response.aayush_status === 'yes') {
                userStats[userId].yesCalls++;
                
                // Calculate response time for average
                if (response.time_taken) {
                    const timeMapping = {
                        'immediately(2-5 mins)': 3.5,
                        '5-15 mins': 10,
                        'more than 15 mins': 20
                    };
                    userStats[userId].totalResponseTime += (timeMapping[response.time_taken] || 0);
                    userStats[userId].responseTimeCount++;
                }
            } else if (response.aayush_status === 'no') {
                userStats[userId].noCalls++;
            } else if (response.aayush_status === 'hehehe bhai') {
                userStats[userId].heheheBhaiCalls++;
            }
        });
        
        // Convert to array and calculate additional stats
        const leaderboard = Object.values(userStats).map(user => {
            const successRate = user.totalCalls > 0 ? ((user.yesCalls / user.totalCalls) * 100).toFixed(1) : 0;
            const avgResponseTime = user.responseTimeCount > 0 
                ? (user.totalResponseTime / user.responseTimeCount).toFixed(1)
                : 0;
            const pareshaaniPoints = (user.noCalls * 10) + (user.heheheBhaiCalls * 50) + (user.yesCalls * 5);
            
            return {
                ...user,
                successRate: parseFloat(successRate),
                avgResponseTime: parseFloat(avgResponseTime),
                pareshaaniPoints
            };
        });
        
        // Sort by different criteria for leaderboards
        const mostCalls = [...leaderboard].sort((a, b) => b.totalCalls - a.totalCalls).slice(0, 10);
        const mostSuccessful = [...leaderboard]
            .filter(u => u.totalCalls >= 3) // At least 3 calls for fair comparison
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 10);
        const mostRejected = [...leaderboard].sort((a, b) => b.noCalls - a.noCalls).slice(0, 10);
        const mostHeheheBhai = [...leaderboard].sort((a, b) => b.heheheBhaiCalls - a.heheheBhaiCalls).slice(0, 10);
        const highestPareshaani = [...leaderboard].sort((a, b) => b.pareshaaniPoints - a.pareshaaniPoints).slice(0, 10);
        const fastestResponse = [...leaderboard]
            .filter(u => u.avgResponseTime > 0)
            .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
            .slice(0, 10);
        
        // Overall stats
        const totalUsers = leaderboard.length;
        const totalResponses = allResponses.length;
        const totalYes = allResponses.filter(r => r.aayush_status === 'yes').length;
        const totalNo = allResponses.filter(r => r.aayush_status === 'no').length;
        const totalHehehe = allResponses.filter(r => r.aayush_status === 'hehehe bhai').length;
        const overallSuccessRate = totalResponses > 0 ? ((totalYes / totalResponses) * 100).toFixed(1) : 0;
        
        res.json({
            success: true,
            overall: {
                totalUsers,
                totalResponses,
                totalYes,
                totalNo,
                totalHehehe,
                overallSuccessRate
            },
            leaderboards: {
                mostCalls,
                mostSuccessful,
                mostRejected,
                mostHeheheBhai,
                highestPareshaani,
                fastestResponse
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard data' });
    }
});

// API endpoint to save a response
app.post('/api/submit', isAuthenticated, async (req, res) => {
    try {
        const { name, date, reason, aayush_status, time_taken, reason_not_coming, q1, q2, q3, q4, q5, q6, message } = req.body;
        
        // Basic validation
        if (!name || !date || !reason || !aayush_status) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        // Create new response document
        const newResponse = new Response({
            name,
            date,
            reason,
            aayush_status,
            time_taken: time_taken || null,
            reason_not_coming: reason_not_coming || null,
            q1,
            q2,
            q3,
            q4,
            q5: q5 || null,
            q6: q6 || null,
            message,
            // Link to authenticated user
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email
        });

        // Save to MongoDB
        await newResponse.save();

        console.log('✅ Response saved to MongoDB:', newResponse._id);

        // Send confirmation email to user
        if (req.user && req.user.email) {
            try {
                let emailContent = '';
                let emailSubject = '';
                
                // Different funny emails based on Aayush status
                if (aayush_status === 'yes') {
                    emailSubject = '🎉 OMG! Aayush Actually Came Down!';
                    emailContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #4CAF50;">🎊 BREAKING NEWS! 🎊</h1>
                            <h2>Aayush Actually Showed Up!</h2>
                            
                            <p>Hey <strong>${req.user.name}</strong>! 👋</p>
                            
                            <p style="font-size: 16px;">Your complaint has been officially logged in the <strong>Aayush Pareshaani Database™</strong></p>
                            
                            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                <h3 style="color: #667eea;">📋 The Tea (Your Submission):</h3>
                                <p><strong>📅 Date:</strong> ${date}</p>
                                <p><strong>🤔 Why you bothered him:</strong> ${reason}</p>
                                <p><strong>⏱️ How long he took:</strong> ${time_taken}</p>
                                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                                    <em>Fun fact: This might be the first time Aayush came on time! 🎯</em>
                                </p>
                            </div>
                            
                            <p>🏆 <strong>Achievement Unlocked:</strong> You successfully summoned Aayush!</p>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <a href="${BASE_URL}/dashboard.html" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                    👀 Stalk the Dashboard
                                </a>
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                This is an automated roast from Aayush Tracker 🤖<br>
                                If Aayush is reading this: Bhai tu aagaya? Shocking! 😱
                            </p>
                        </div>
                    `;
                } else if (aayush_status === 'no') {
                    emailSubject = '😤 Aayush Ne Phir Se Dhoka Diya!';
                    emailContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #f44336;">💔 SAD NEWS ALERT! 💔</h1>
                            <h2>Aayush Didn't Show Up (Surprise Surprise!)</h2>
                            
                            <p>Yo <strong>${req.user.name}</strong>! 😔</p>
                            
                            <p style="font-size: 16px;">We regret to inform you that your call went unanswered... again. 🙄</p>
                            
                            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff9800;">
                                <h3 style="color: #f57c00;">📋 Incident Report:</h3>
                                <p><strong>📅 Date of Betrayal:</strong> ${date}</p>
                                <p><strong>🤔 What you wanted:</strong> ${reason}</p>
                                <p><strong>😤 His Excuse:</strong> ${reason_not_coming}</p>
                                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                                    <em>Classic Aayush move! We're not even surprised anymore. 🤷‍♂️</em>
                                </p>
                            </div>
                            
                            <p>📊 <strong>Stats Update:</strong> Aayush's "Not Coming" streak continues!</p>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <a href="${BASE_URL}/dashboard.html" style="background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                    😢 See the Hall of Shame
                                </a>
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="color: #999; font-size: 12px; text-align: center;">
                                Automated disappointment email from Aayush Tracker 🤖<br>
                                Better luck next time! (Who are we kidding? 😂)
                            </p>
                        </div>
                    `;
                } else {
                    // Hehehe bhai
                    emailSubject = '🤪 HEHEHE BHAI! You Got Aayushed!';
                    emailContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
                            <h1 style="font-size: 48px;">🎉🎊🥳</h1>
                            <h1 style="color: #ff6b6b;">HEHEHE BHAI!</h1>
                            <h2 style="color: #4ecdc4;">YOU JUST GOT AAYUSHED! 😂</h2>
                            
                            <p style="font-size: 20px;">Wassup <strong>${req.user.name}</strong>! 🤪</p>
                            
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 30px 0;">
                                <h2>🎯 THE LEGENDARY "HEHEHE BHAI" MOMENT!</h2>
                                <p style="font-size: 18px; margin: 20px 0;">
                                    <strong>📅 Date:</strong> ${date}<br>
                                    <strong>🎭 Reason:</strong> ${reason}
                                </p>
                                <p style="font-size: 24px; margin-top: 20px;">
                                    Peak comedy achieved! 😎✨
                                </p>
                            </div>
                            
                            <p style="font-size: 16px; color: #666;">
                                This response is so legendary it deserves its own statue! 🗿
                            </p>
                            
                            <p style="margin: 30px 0;">
                                <a href="${BASE_URL}/dashboard.html" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-size: 18px;">
                                    🚀 Check the Chaos
                                </a>
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="color: #999; font-size: 12px;">
                                Auto-generated masti from Aayush Tracker 🤖<br>
                                Keep the hehehe bhai energy alive! 😂🔥
                            </p>
                        </div>
                    `;
                }

                await emailTransporter.sendMail({
                    from: `"Aayush Pareshaani Tracker 🤡" <${process.env.EMAIL_USER}>`,
                    to: req.user.email,
                    subject: emailSubject,
                    html: emailContent
                });

                console.log('✅ Email sent to:', req.user.email);
            } catch (emailError) {
                console.error('❌ Error sending email:', emailError.message);
                // Don't fail the request if email fails
            }
        }

        res.json({ 
            success: true, 
            message: 'Response submitted successfully', 
            data: newResponse 
        });
    } catch (error) {
        console.error('❌ Error saving response:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
});

// API endpoint to get all responses
app.get('/api/responses', isAuthenticated, async (req, res) => {
    try {
        const responses = await Response.find().sort({ createdAt: -1 }); // Sort by newest first
        res.json(responses);
    } catch (error) {
        console.error('❌ Error reading responses:', error);
        res.status(500).json({ error: 'Failed to read responses' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

