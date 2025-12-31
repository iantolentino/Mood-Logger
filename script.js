// Configuration - UPDATE THIS WITH YOUR RENDER URL
const BACKEND_BASE_URL = "https://mood-logger-api.onrender.com";
const API_URL = BACKEND_BASE_URL + "/mood";

console.log("Backend URL set to:", BACKEND_BASE_URL);
console.log("API URL set to:", API_URL);

// Available moods with emojis
const AVAILABLE_MOODS = [
    { id: 'calm', text: 'Calm', emoji: '☁️' },
    { id: 'peaceful', text: 'Peaceful', emoji: '🕊️' },
    { id: 'grateful', text: 'Grateful', emoji: '🙏' },
    { id: 'hopeful', text: 'Hopeful', emoji: '✨' },
    { id: 'content', text: 'Content', emoji: '😊' },
    { id: 'reflective', text: 'Reflective', emoji: '💭' },
    { id: 'energized', text: 'Energized', emoji: '⚡' },
    { id: 'balanced', text: 'Balanced', emoji: '⚖️' },
    { id: 'creative', text: 'Creative', emoji: '🎨' },
    { id: 'focused', text: 'Focused', emoji: '🎯' },
    { id: 'restful', text: 'Restful', emoji: '😴' },
    { id: 'inspired', text: 'Inspired', emoji: '💡' }
];

// DOM Elements
const moodForm = document.getElementById('moodForm');
const nameInput = document.getElementById('name');
const moodsContainer = document.querySelector('.moods-container');
const selectedCountEl = document.getElementById('selectedCount');
const submitBtn = document.getElementById('submitBtn');
const moodPreview = document.getElementById('moodPreview');
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('.theme-text');

// Selected moods array
let selectedMoods = [];

// Initialize the application
function init() {
    // Set current year in footer (if you add it)
    // currentYearSpan.textContent = new Date().getFullYear();
    
    // Create mood options
    renderMoodOptions();
    
    // Check backend connection
    checkBackendConnection();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update preview
    updatePreview();
    
    // Load saved theme - DARK MODE BY DEFAULT
    loadSavedTheme();
    updateThemeToggle();
}

// Render mood options
function renderMoodOptions() {
    moodsContainer.innerHTML = '';
    
    AVAILABLE_MOODS.forEach(mood => {
        const moodElement = document.createElement('div');
        moodElement.className = 'mood-option';
        moodElement.dataset.moodId = mood.id;
        moodElement.innerHTML = `
            <span class="mood-emoji">${mood.emoji}</span>
            <span class="mood-text">${mood.text}</span>
        `;
        
        moodElement.addEventListener('click', () => {
            toggleMoodSelection(mood.id, moodElement);
        });
        
        moodsContainer.appendChild(moodElement);
    });
}

// Toggle mood selection
function toggleMoodSelection(moodId, element) {
    const index = selectedMoods.indexOf(moodId);
    
    if (index === -1) {
        // Add mood if less than 5 selected
        if (selectedMoods.length < 5) {
            selectedMoods.push(moodId);
            element.classList.add('selected');
        }
    } else {
        // Remove mood
        selectedMoods.splice(index, 1);
        element.classList.remove('selected');
    }
    
    updateSelectionCount();
    updateSubmitButton();
    updatePreview();
}

// Update selection counter
function updateSelectionCount() {
    selectedCountEl.textContent = selectedMoods.length;
}

// Get mood text by ID
function getMoodText(moodId) {
    const mood = AVAILABLE_MOODS.find(m => m.id === moodId);
    return mood ? mood.text : moodId;
}

// Format name with possessive apostrophe
function formatNameWithPossessive(name) {
    if (!name || name.trim() === '') return '';
    
    const trimmedName = name.trim();
    
    // Capitalize first letter
    const capitalized = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
    
    // Handle names ending with 's' (add apostrophe only)
    if (capitalized.toLowerCase().endsWith('s')) {
        return `${capitalized}'`;
    }
    
    // For other names, add 's
    return `${capitalized}'s`;
}

// Update submit button state
function updateSubmitButton() {
    const isValid = selectedMoods.length >= 3 && selectedMoods.length <= 5 && nameInput.value.trim();
    
    submitBtn.disabled = !isValid;
    
    if (selectedMoods.length < 3) {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Select at least 3 moods';
    } else if (selectedMoods.length > 5) {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Maximum 5 moods';
    } else {
        submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Send Mood (${selectedMoods.length}/5)`;
    }
}

// Update preview section
function updatePreview() {
    const name = nameInput.value.trim();
    const selectedMoodObjects = selectedMoods.map(id => AVAILABLE_MOODS.find(m => m.id === id));
    
    if (selectedMoodObjects.length === 0 || !name) {
        moodPreview.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-smile"></i>
                <p>Your mood entry will appear here</p>
                <p class="preview-instruction">Fill out the form to see a preview</p>
            </div>
        `;
        return;
    }
    
    const moodList = selectedMoodObjects.map(mood => `
        <li>
            <span class="mood-emoji">${mood.emoji}</span>
            ${mood.text}
        </li>
    `).join('');
    
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format date for Telegram (MM/DD/YYYY format)
    const telegramDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
    
    // Show possessive name in preview
    const possessiveName = formatNameWithPossessive(name);
    
    moodPreview.innerHTML = `
        <div class="preview-entry">
            <div class="preview-name">${possessiveName} Mood Today</div>
            <div class="preview-date">
                <i class="fas fa-calendar-alt"></i>
                ${today}
            </div>
            <div class="preview-subtitle">Today's Moods:</div>
            <ul class="preview-moods">
                ${moodList}
            </ul>
        </div>
    `;
}

// Check if backend is connected
async function checkBackendConnection() {
    try {
        console.log("Testing backend connection to:", BACKEND_BASE_URL);
        const response = await fetch(BACKEND_BASE_URL);
        console.log("Response status:", response.status);
        
        if (response.ok) {
            console.log("Backend connection successful!");
        } else {
            console.log("Backend returned status:", response.status);
        }
    } catch (error) {
        console.error("Backend connection error:", error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        
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
        
        // Get mood texts
        const moodTexts = selectedMoods.map(getMoodText);
        
        // Format name with possessive apostrophe
        const possessiveName = formatNameWithPossessive(name);
        
        // Prepare data - Send possessive name in the name field
        const moodData = {
            name: possessiveName, // <-- THIS IS THE KEY CHANGE
            moods: moodTexts,
            date: new Date().toISOString().split('T')[0]  // YYYY-MM-DD format
        };
        
        console.log("Sending to backend:", moodData);
        console.log("Expected Telegram message:", `${possessiveName} Mood Today`);
        
        // Disable submit button
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
                }, 3000);
            } else {
                throw new Error(data.detail || 'Failed to send mood');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(`✗ Error: ${error.message}`, 'error');
        } finally {
            // Re-enable submit button
            setTimeout(() => {
                updateSubmitButton();
            }, 3000);
        }
    });
    
    
    // Name input validation
    nameInput.addEventListener('input', () => {
        updateSubmitButton();
        updatePreview();
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Show message function (need to add this to HTML)
function showMessage(text, type) {
    // Create message div if it doesn't exist
    let messageDiv = document.getElementById('message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = text;
    messageDiv.className = '';
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#10b981';
        messageDiv.style.color = 'white';
        messageDiv.style.border = 'none';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#ef4444';
        messageDiv.style.color = 'white';
        messageDiv.style.border = 'none';
    }
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }, 5000);
    } else if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }, 5000);
    }
}

// Reset form
function resetForm() {
    nameInput.value = '';
    selectedMoods = [];
    
    // Deselect all moods
    document.querySelectorAll('.mood-option.selected').forEach(element => {
        element.classList.remove('selected');
    });
    
    updateSelectionCount();
    updateSubmitButton();
    updatePreview();
    nameInput.focus();
}

// Theme toggle functionality
function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
    
    updateThemeToggle();
}

// Update theme toggle button
function updateThemeToggle() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    }
}

// Load saved theme from localStorage - MODIFIED TO DEFAULT TO DARK MODE
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // If no theme saved, default to DARK MODE
    if (!savedTheme) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); // Save dark mode preference
    } else if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

// Add CSS animation for message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
