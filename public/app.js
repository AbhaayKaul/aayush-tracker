// Get DOM elements
const form = document.getElementById('responseForm');
const notification = document.getElementById('notification');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const formSection = document.querySelector('.form-section');
const successScreen = document.getElementById('successScreen');
const submitAnotherBtn = document.getElementById('submitAnotherBtn');
const viewDashboardBtn = document.getElementById('viewDashboardBtn');
const successIcon = document.getElementById('successIcon');
const successTitle = document.getElementById('successTitle');
const successSubtitle = document.getElementById('successSubtitle');

// Multi-step form state
let currentStep = 1;
let totalSteps = 5; // Default is 5 questions (4 base + 1 conditional)
const answers = {};
let conditionalPath = null; // Will be 'yes', 'no', or 'hehehe bhai'
let displayStep = 1; // What step number to show to the user

// Initialize
totalQuestionsSpan.textContent = totalSteps;

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Update progress bar
function updateProgress() {
    const progress = (displayStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = displayStep;
}

// Show specific question
function showQuestion(step) {
    currentStep = step;
    
    // Set display step (for showing to user)
    if (step <= 4) {
        displayStep = step;
    } else if (step === 5 || step === 6) {
        // Both conditional questions show as "Question 5"
        displayStep = 5;
    }
    
    // Hide all questions
    document.querySelectorAll('.question-slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current question (handling conditional questions)
    let currentSlide;
    
    if (step === 5 && conditionalPath === 'yes') {
        // Show Q5 (time taken) - for "yes" answer
        currentSlide = document.querySelector('[data-question="5"][data-condition="yes"]');
    } else if (step === 6 && conditionalPath === 'no') {
        // Show Q6 (reason for not coming) - for "no" answer
        currentSlide = document.querySelector('[data-question="6"][data-condition="no"]');
    } else {
        // Regular questions 1-4
        currentSlide = document.querySelector(`[data-question="${step}"]:not(.conditional)`);
    }
    
    if (currentSlide) {
        currentSlide.classList.add('active');
        
        // Focus on the input
        const input = currentSlide.querySelector('.question-input, input[type="radio"]');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }
    
    // Update buttons
    prevBtn.disabled = step === 1;
    
    // Check if we should show submit button
    const nextQuestion = getNextQuestionNumber();
    if (nextQuestion === null) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        submitBtn.disabled = false; // Make sure submit button is enabled
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    updateProgress();
    
    // Update total questions display
    totalQuestionsSpan.textContent = totalSteps;
}

// Get next question number based on current step and conditions
function getNextQuestionNumber() {
    if (currentStep === 4) {
        // After Q4, determine which question to show next
        const q4Answer = answers.q4;
        
        if (q4Answer === 'yes') {
            conditionalPath = 'yes';
            totalSteps = 5;
            return 5;
        } else if (q4Answer === 'no') {
            conditionalPath = 'no';
            totalSteps = 5;
            return 6; // Internal step 6, but displays as step 5
        } else if (q4Answer === 'hehehe bhai') {
            conditionalPath = 'hehehe bhai';
            totalSteps = 4;
            return null; // No next question, ready to submit
        }
    } else if (currentStep < 4) {
        return currentStep + 1;
    } else if (currentStep === 5 || currentStep === 6) {
        return null; // Ready to submit
    }
    
    return currentStep + 1;
}

// Get previous question number
function getPreviousQuestionNumber() {
    if (currentStep === 5 || currentStep === 6) {
        // From conditional questions, go back to Q4
        return 4;
    }
    return currentStep - 1;
}

// Validate current question
function validateCurrentQuestion() {
    // For radio buttons (Q4, Q5)
    if (currentStep === 4) {
        const selectedRadio = document.querySelector('input[name="q4"]:checked');
        if (!selectedRadio) {
            showNotification('Please select an option before proceeding', 'error');
            return false;
        }
        answers.q4 = selectedRadio.value;
        return true;
    }
    
    if (currentStep === 5) {
        // Check within the active slide for Q5
        const activeSlide = document.querySelector('.question-slide.active[data-question="5"]');
        if (activeSlide) {
            const selectedRadio = activeSlide.querySelector('input[name="q5"]:checked');
            if (!selectedRadio) {
                console.log('No Q5 radio selected');
                showNotification('Please select an option before proceeding', 'error');
                return false;
            }
            answers.q5 = selectedRadio.value;
            console.log('Q5 validated:', selectedRadio.value);
            return true;
        }
        // If slide not found, check if answer was already saved
        if (answers.q5) {
            console.log('Q5 answer already saved:', answers.q5);
            return true;
        }
        console.log('Q5 validation failed - no active slide or saved answer');
        return false;
    }
    
    // For text/date inputs (Q1, Q2, Q3, Q6)
    let currentInput = document.querySelector(`#q${currentStep}`);
    
    // For Q6, need to find it differently since it's conditional
    if (!currentInput && currentStep === 6) {
        currentInput = document.querySelector('textarea[name="q6"]');
    }
    
    if (!currentInput) return false;
    
    const value = currentInput.value.trim();
    
    if (!value) {
        currentInput.style.borderColor = '#e74c3c';
        showNotification('Please answer this question before proceeding', 'error');
        currentInput.focus();
        return false;
    }
    
    // Reset border color
    currentInput.style.borderColor = '#e0e0e0';
    
    // Save the answer
    answers[`q${currentStep}`] = value;
    
    return true;
}

// Next button handler
nextBtn.addEventListener('click', () => {
    if (validateCurrentQuestion()) {
        const nextQuestion = getNextQuestionNumber();
        
        if (nextQuestion !== null) {
            showQuestion(nextQuestion);
        } else {
            // Should show submit button
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        }
    }
});

// Previous button handler
prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        const prevQuestion = getPreviousQuestionNumber();
        
        // If going back to Q4 from conditional questions, clear those answers
        if (prevQuestion === 4 && (currentStep === 5 || currentStep === 6)) {
            delete answers.q5;
            delete answers.q6;
            conditionalPath = null;
            totalSteps = 5;
        }
        
        showQuestion(prevQuestion);
    }
});

// Handle Enter key to move to next question
document.querySelectorAll('.question-input').forEach((input, index) => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (currentStep < totalSteps) {
                nextBtn.click();
            }
        }
    });
});

// Handle radio button selections for Q4 and Q5
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Save Q4 answer immediately
        if (e.target.name === 'q4') {
            answers.q4 = e.target.value;
            
            // If "Hehehe bhai" is selected, change Next button to Submit button immediately
            if (e.target.value === 'hehehe bhai' && currentStep === 4) {
                console.log('Hehehe bhai selected - showing submit button');
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
                submitBtn.disabled = false;
            } else if (currentStep === 4) {
                // For "yes" or "no", keep Next button
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }
        
        // When a radio in Q5 is selected, save and enable submit
        if (e.target.name === 'q5') {
            answers.q5 = e.target.value;
            console.log('Q5 selected:', e.target.value);
            // Make sure submit button is visible and enabled
            if (currentStep === 5) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
                submitBtn.disabled = false;
            }
        }
    });
});


// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Form submitted, current step:', currentStep);
    console.log('Answers:', answers);
    
    // Validate last question
    if (!validateCurrentQuestion()) {
        console.log('Validation failed');
        return;
    }
    
    console.log('Validation passed');
    
    // Prepare submission data
    const formData = {
        name: answers.q1,
        date: answers.q2,
        reason: answers.q3,
        aayush_status: answers.q4,
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4
    };
    
    // Add conditional fields
    if (answers.q4 === 'yes' && answers.q5) {
        formData.q5 = answers.q5;
        formData.time_taken = answers.q5;
    }
    
    if (answers.q4 === 'no' && answers.q6) {
        formData.q6 = answers.q6;
        formData.reason_not_coming = answers.q6;
    }
    
    // Create a summary message
    let message = `Date: ${answers.q2}, Reason: ${answers.q3}, Status: ${answers.q4}`;
    if (answers.q5) message += `, Time: ${answers.q5}`;
    if (answers.q6) message += `, Reason for not coming: ${answers.q6}`;
    
    formData.message = message;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Customize success message based on Aayush status
            if (answers.q4 === 'hehehe bhai') {
                successIcon.textContent = '🎉';
                successIcon.classList.add('party');
                successTitle.textContent = 'Congratulations, you have been aayushed';
                successSubtitle.textContent = 'Hehehe bhai moment achieved!';
            } else {
                // Reset to default messages for yes/no
                successIcon.textContent = '✅';
                successIcon.classList.remove('party');
                successTitle.textContent = 'You have successfully entered your pareshaani with Aayush';
                successSubtitle.textContent = 'Your response has been recorded and saved.';
            }
            
            // Show success screen instead of resetting
            formSection.style.display = 'none';
            successScreen.style.display = 'block';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showNotification(result.error || 'Failed to submit response', 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Failed to submit response. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Response';
    }
});

// Handle "Submit Another Response" button
submitAnotherBtn.addEventListener('click', () => {
    // Hide success screen, show form
    successScreen.style.display = 'none';
    formSection.style.display = 'block';
    
    // Reset form
    form.reset();
    currentStep = 1;
    displayStep = 1;
    totalSteps = 5;
    conditionalPath = null;
    showQuestion(1);
    Object.keys(answers).forEach(key => delete answers[key]);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Handle "View Aayush's Dashboard" button
viewDashboardBtn.addEventListener('click', () => {
    // Redirect to dashboard page
    window.location.href = '/dashboard.html';
});

// Add click handler for submit button (backup)
submitBtn.addEventListener('click', (e) => {
    console.log('Submit button clicked');
    console.log('Button disabled?', submitBtn.disabled);
    console.log('Button display:', submitBtn.style.display);
});

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', () => {
    showQuestion(1);
});

