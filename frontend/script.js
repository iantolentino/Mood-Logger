// Configuration - UPDATE THIS WITH YOUR RENDER URL
const API_URL = "https://mood-logger-api.onrender.com";
const BACKEND_BASE_URL = API_URL.replace('/mood', '');

// Available moods with emojis
const AVAILABLE_MOODS = [
    { id: 'happy', text: 'Happy', emoji: '😊' },
    { id: 'sad', text: 'Sad', emoji: '😢' },
    { id: 'angry', text: 'Angry', emoji: '😠' },
    { id: 'excited', text: 'Excited', emoji: '🤩' },
    { id: 'tired', text: 'Tired', emoji: '😴' },
    { id: 'relaxed', text: 'Relaxed', emoji: '😌' },
    { id: 'anxious', text: 'Anxious', emoji: '😰' },
    { id: 'productive', text: 'Productive', emoji: '💪' },
    { id: 'creative', text: 'Creative', emoji: '🎨' },
    { id: 'grateful', text: 'Grateful', emoji: '🙏' }
];

// DOM Elements
const moodForm = document.getElementById('moodForm');
const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date');
const moodsGrid = document.querySelector('.moods-grid');
const messageDiv = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const apiStatus = document.getElementById('status');
const currentYearSpan = document.getElementById('currentYear');

// Initialize the app
function init() {
    // Set current year in footer
    currentYearSpan.textContent = new Date().getFullYear();
    
    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Create mood checkboxes
    renderMoodOptions();
    
    // Check backend connection
    checkBackendConnection();
    
    // Set up event listeners
    setupEventListeners();
}

// Render mood options as clickable cards
function renderMoodOptions() {
    moodsGrid.innerHTML = '';
    
    AVAILABLE_MOODS.forEach(mood => {
        const moodElement = document.createElement('div');
        moodElement.className = 'mood-option';
        moodElement.dataset.moodId = mood.id;
        moodElement.innerHTML = `
            <span class="mood-emoji">${mood.emoji}</span>
            <span class="mood-text">${mood.text}</span>
        `;
        
        moodElement.addEventListener('click', () => {
            moodElement.classList.toggle('selected');
            updateSubmitButton();
        });
        
        moodsGrid.appendChild(moodElement);
    });
}

// Update submit button state based on selection
function updateSubmitButton() {
    const selectedMoods = getSelectedMoods();
    const submitBtn = document.querySelector('.btn-submit');
    
    if (selectedMoods.length >= 3 && selectedMoods.length <= 5) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Log My Mood (${selectedMoods.length}/5)`;
    } else {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Select 3-5 Moods (${selectedMoods.length}/5)`;
    }
}

// Get selected moods
function getSelectedMoods() {
    const selected = [];
    document.querySelectorAll('.mood-option.selected').forEach(element => {
        selected.push(element.dataset.moodId);
    });
    return selected;
}

// Get mood text by ID
function getMoodText(moodId) {
    const mood = AVAILABLE_MOODS.find(m => m.id === moodId);
    return mood ? mood.text : moodId;
}

// Check if backend is connected
async function checkBackendConnection() {
    try {
        const response = await fetch(BACKEND_BASE_URL);
        if (response.ok) {
            apiStatus.textContent = 'Connected';
            apiStatus.className = 'connected';
        } else {
            apiStatus.textContent = 'Error';
            apiStatus.className = 'disconnected';
        }
    } catch (error) {
        apiStatus.textContent = 'Offline';
        apiStatus.className = 'disconnected';
        console.warn('Backend is not reachable:', error.message);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const selectedMoods = getSelectedMoods();
        const date = dateInput.value;
        
        // Validation
        if (!name) {
            showMessage('Please enter your name', 'error');
            nameInput.focus();
            return;
        }
        
        if (selectedMoods.length < 3) {
            showMessage('Please select at least 3 moods', 'error');
            return;
        }
        
        if (selectedMoods.length > 5) {
            showMessage('Please select no more than 5 moods', 'error');
            return;
        }
        
        // Prepare data
        const moodData = {
            name: name,
            moods: selectedMoods.map(getMoodText),
            date: date
        };
        
        // Disable submit button
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Send to backend
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(moodData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('✓ Mood logged successfully! Sent to Telegram.', 'success');
                // Reset form after successful submission
                setTimeout(() => {
                    resetForm();
                    showMessage('', 'success'); // Hide message
                }, 3000);
            } else {
                throw new Error(data.detail || 'Failed to send mood');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(`✗ Error: ${error.message}`, 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            updateSubmitButton();
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetForm);
    
    // Update submit button when moods are selected/deselected
    document.addEventListener('click', (e) => {
        if (e.target.closest('.mood-option')) {
            updateSubmitButton();
        }
    });
}

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

// Reset form
function resetForm() {
    nameInput.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Deselect all moods
    document.querySelectorAll('.mood-option.selected').forEach(element => {
        element.classList.remove('selected');
    });
    
    messageDiv.classList.add('hidden');
    updateSubmitButton();
    nameInput.focus();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);