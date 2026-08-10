// KES Daily Sales Report - JavaScript

// Global variables
let activityCount = 0;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVPu-_GkUZaaMa5iWBjhSiXVNVkkihkqY9c7zpvQUdY5DogFgbhujd1edV9v9v4jWo/exec';

/** Active voice recording session (only one at a time) */
let activeVoiceSession = null;

// Activity type options
const activityTypes = [
    'In-person presentation',
    'In-person return visit to the leader',
    'First in-person visit to the leader',
    'Phone call presentation to the leader',
    'Home presentation',
    'Home follow-up',
    'Phone call follow-up',
    'First call to the leader',
    'Other (type here)'
];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeForm();
    addActivityCard();
    setupEventListeners();
});

/**
 * Initialize form with today's date
 */
function initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add activity button
    document.getElementById('addActivityBtn').addEventListener('click', addActivityCard);

    // Form submission
    document.getElementById('salesForm').addEventListener('submit', handleSubmit);

    // Voice note buttons (delegated — activity cards are dynamic)
    document.getElementById('activitiesContainer').addEventListener('click', handleVoiceControlClick);
}

/**
 * Create and add a new activity card
 */
function addActivityCard() {
    activityCount++;
    const container = document.getElementById('activitiesContainer');

    const activityCard = document.createElement('div');
    activityCard.className = 'activity-card';
    activityCard.id = `activity-${activityCount}`;

    activityCard.innerHTML = `
        <div class="activity-card-body">
            <h3 class="activity-number">Activity ${activityCount}</h3>
            
            <!-- Location radio buttons -->
            <div class="mb-3">
                <label class="form-label required">Where did you make contact?</label>
                <div class="location-radio">
                    <div class="radio-option">
                        <input type="radio" 
                               id="location-home-${activityCount}" 
                               name="location-${activityCount}" 
                               value="Home" 
                               required>
                        <label for="location-home-${activityCount}">Home</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" 
                               id="location-office-${activityCount}" 
                               name="location-${activityCount}" 
                               value="Office">
                        <label for="location-office-${activityCount}">Office</label>
                    </div>
                </div>
            </div>
            
            <!-- Place name -->
            <div class="mb-3">
                <label for="place-${activityCount}" class="form-label required">Name of place or office</label>
                <input type="text" 
                       class="form-control" 
                       id="place-${activityCount}" 
                       name="place-${activityCount}" 
                       required>
            </div>
            
            <!-- Branch Name -->
            <div class="mb-3">
                <label for="branchName-${activityCount}" class="form-label">Branch Name (If Office)</label>
                <input type="text" 
                       class="form-control" 
                       id="branchName-${activityCount}" 
                       name="branchName-${activityCount}"
                       placeholder="Enter branch name">
            </div>
            
            <!-- Branch Location -->
            <div class="mb-3">
                <label for="branchLocation-${activityCount}" class="form-label">Location</label>
                <input type="text" 
                       class="form-control" 
                       id="branchLocation-${activityCount}" 
                       name="branchLocation-${activityCount}"
                       placeholder="Enter town or district">
            </div>
            
            <!-- Activity type dropdown -->
            <div class="mb-3">
                <label for="type-${activityCount}" class="form-label required">Activity Type</label>
                <select class="form-select" 
                        id="type-${activityCount}" 
                        name="type-${activityCount}" 
                        onchange="handleActivityTypeChange(${activityCount})"
                        required>
                    <option value="">Select activity type...</option>
                    ${activityTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            
            <!-- Custom activity type input (hidden by default) -->
            <div class="mb-3" id="customTypeContainer-${activityCount}" style="display: none;">
                <label for="customType-${activityCount}" class="form-label required">Please specify activity type</label>
                <input type="text" 
                       class="form-control" 
                       id="customType-${activityCount}" 
                       name="customType-${activityCount}"
                       placeholder="Type your custom activity type here">
            </div>
            
            <!-- Contact person's name -->
            <div class="mb-3">
                <label for="contactName-${activityCount}" class="form-label required">Contact person's name</label>
                <input type="text" 
                       class="form-control" 
                       id="contactName-${activityCount}" 
                       name="contactName-${activityCount}" 
                       placeholder="Person's name">
            </div>
            
            <!-- Contact person's position -->
            <div class="mb-3">
                <label for="contactPosition-${activityCount}" class="form-label">Contact person's position</label>
                <input type="text" 
                       class="form-control" 
                       id="contactPosition-${activityCount}" 
                       name="contactPosition-${activityCount}"
                       placeholder="Person's position">
            </div>
            
            <!-- Contact person's phone number -->
            <div class="mb-3">
                <label for="phone-${activityCount}" class="form-label">Contact person's phone number</label>
                <input type="tel" 
                       class="form-control" 
                       id="phone-${activityCount}" 
                       name="phone-${activityCount}"
                       placeholder="Type phone number">
            </div>
            
            <!-- What happened -->
            <div class="mb-3">
                <div class="textarea-field-header">
                    <label for="happened-${activityCount}" class="form-label">What happened?</label>
                    <div class="voice-note-controls" data-target="happened-${activityCount}">
                        <button type="button" class="btn btn-voice-record" data-voice-action="toggle" aria-label="Record voice note for what happened">
                            <span class="voice-btn-icon" aria-hidden="true">🎤</span>
                            <span class="voice-btn-label">Voice note</span>
                        </button>
                        <span class="voice-status" role="status"></span>
                    </div>
                </div>
                <textarea class="form-control" 
                          id="happened-${activityCount}" 
                          name="happened-${activityCount}" 
                          rows="3"
                          placeholder="Describe what happened during this activity..."></textarea>
            </div>
            
            <!-- Next move -->
            <div class="mb-3">
                <div class="textarea-field-header">
                    <label for="nextMove-${activityCount}" class="form-label">What is the next move?</label>
                    <div class="voice-note-controls" data-target="nextMove-${activityCount}">
                        <button type="button" class="btn btn-voice-record" data-voice-action="toggle" aria-label="Record voice note for next move">
                            <span class="voice-btn-icon" aria-hidden="true">🎤</span>
                            <span class="voice-btn-label">Voice note</span>
                        </button>
                        <span class="voice-status" role="status"></span>
                    </div>
                </div>
                <textarea class="form-control" 
                          id="nextMove-${activityCount}" 
                          name="nextMove-${activityCount}" 
                          rows="3"
                          placeholder="Describe the next steps..."></textarea>
            </div>
            
            <!-- Remove button (only show if more than 1 activity) -->
            <div class="remove-activity-container" id="removeContainer-${activityCount}" style="display: none;">
                <button type="button" 
                        class="btn btn-remove-activity" 
                        onclick="removeActivityCard(${activityCount})">
                    Remove Activity
                </button>
            </div>
        </div>
    `;

    container.appendChild(activityCard);
    updateRemoveButtons();

    // Scroll to the new activity card
    activityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Remove an activity card
 * @param {number} activityNumber - The activity number to remove
 */
function removeActivityCard(activityNumber) {
    const activityCard = document.getElementById(`activity-${activityNumber}`);
    if (activityCard) {
        activityCard.remove();
        updateRemoveButtons();
    }
}

/**
 * Handle activity type dropdown change
 * @param {number} activityNumber - The activity number
 */
function handleActivityTypeChange(activityNumber) {
    const typeSelect = document.getElementById(`type-${activityNumber}`);
    const customTypeContainer = document.getElementById(`customTypeContainer-${activityNumber}`);
    const customTypeInput = document.getElementById(`customType-${activityNumber}`);

    if (typeSelect.value === 'Other (type here)') {
        customTypeContainer.style.display = 'block';
        customTypeInput.required = true;
    } else {
        customTypeContainer.style.display = 'none';
        customTypeInput.required = false;
        customTypeInput.value = '';
    }
}

/**
 * Update remove buttons visibility based on activity count
 */
function updateRemoveButtons() {
    const activities = document.querySelectorAll('.activity-card');
    activities.forEach((activity, index) => {
        const removeContainer = activity.querySelector('[id^="removeContainer-"]');
        if (removeContainer) {
            removeContainer.style.display = activities.length > 1 ? 'block' : 'none';
        }
    });
}

/**
 * Handle form submission
 * @param {Event} event - The submit event
 */
async function handleSubmit(event) {
    event.preventDefault();

    // Hide previous messages
    hideMessages();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Collect form data
    const formData = collectFormData();

    // Show loading indicator
    showLoading();

    try {
        // Submit data to Google Apps Script
        const response = await submitToGoogleScript(formData);

        // Hide loading indicator
        hideLoading();

        // Show success message
        showSuccess();

        // Reset form
        resetForm();

    } catch (error) {
        // Hide loading indicator
        hideLoading();

        // Show error message
        showError(error.message);
    }
}

/**
 * Check if the input looks like a role/title instead of a person's name
 * @param {string} input - The input to check
 * @returns {boolean} - True if it looks like a role, false otherwise
 */
function isRoleTitle(input) {
    const rolePatterns = [
        /\bhr\b/i,
        /\bmanager\b/i,
        /\bdirector\b/i,
        /\bceo\b/i,
        /\bsupervisor\b/i,
        /\badmin\b/i,
        /\breceptionist\b/i,
        /\bsecretary\b/i,
        /\bassistant\b/i,
        /\bcoordinator\b/i,
        /\bofficer\b/i,
        /\bhead\b/i,
        /\blead\b/i,
        /\bchief\b/i,
        /\bexecutive\b/i,
        /\bvp\b/i,
        /\bpresident\b/i,
        /\bowner\b/i,
        /\bpartner\b/i,
        /\bclerk\b/i,
        /\bagent\b/i,
        /\brepresentative\b/i,
        /\bconsultant\b/i,
        /\bspecialist\b/i,
        /\bmanager\b/i,
        /\badmin\b/i
    ];

    return rolePatterns.some(pattern => pattern.test(input));
}

/**
 * Validate the form
 * @returns {boolean} - True if valid, false otherwise
 */
function validateForm() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const reportDate = document.getElementById('reportDate').value;

    if (!employeeName) {
        showError('Please enter your employee name.');
        return false;
    }

    if (!reportDate) {
        showError('Please select a date.');
        return false;
    }

    // Check if there are any activities
    const activities = document.querySelectorAll('.activity-card');
    if (activities.length === 0) {
        showError('Please add at least one activity.');
        return false;
    }

    // Validate each activity
    for (let i = 1; i <= activityCount; i++) {
        const activityCard = document.getElementById(`activity-${i}`);
        if (!activityCard) continue;

        const place = document.getElementById(`place-${i}`).value.trim();
        const type = document.getElementById(`type-${i}`).value;
        const contactName = document.getElementById(`contactName-${i}`).value.trim();

        if (!place) {
            showError(`Please enter the place name for Activity ${i}.`);
            return false;
        }

        if (!type) {
            showError(`Please select an activity type for Activity ${i}.`);
            return false;
        }

        // If Other is selected, validate custom input
        if (type === 'Other (type here)') {
            const customType = document.getElementById(`customType-${i}`).value.trim();
            if (!customType) {
                showError(`Please specify the custom activity type for Activity ${i}.`);
                return false;
            }
        }

        if (!contactName) {
            showError(`Please enter the contact person's name for Activity ${i}.`);
            return false;
        }

        // Check if contact name looks like a role/title instead of a person's name
        if (isRoleTitle(contactName)) {
            showError(`Please enter the contact person's actual name (not their role/title) for Activity ${i}. For example: "John Smith" instead of "Manager".`);
            return false;
        }
    }

    return true;
}

/**
 * Collect form data into JSON object
 * @returns {Object} - The form data object
 */
function collectFormData() {
    const employeeName = document.getElementById('employeeName').value.trim();
    const reportDate = document.getElementById('reportDate').value;

    const activities = [];

    for (let i = 1; i <= activityCount; i++) {
        const activityCard = document.getElementById(`activity-${i}`);
        if (!activityCard) continue;

        // Get selected location
        const locationInput = document.querySelector(`input[name="location-${i}"]:checked`);
        const location = locationInput ? locationInput.value : '';

        // Get activity type (use custom value if Other is selected)
        const typeSelect = document.getElementById(`type-${i}`);
        let activityType = typeSelect.value;
        if (activityType === 'Other (type here)') {
            activityType = document.getElementById(`customType-${i}`).value.trim();
        }

        const activity = {
            number: i,
            location: location,
            place: document.getElementById(`place-${i}`).value.trim(),
            branch_name: document.getElementById(`branchName-${i}`).value.trim(),
            branch_location: document.getElementById(`branchLocation-${i}`).value.trim(),
            type: activityType,
            contact_name: document.getElementById(`contactName-${i}`).value.trim(),
            contact_position: document.getElementById(`contactPosition-${i}`).value.trim(),
            phone: document.getElementById(`phone-${i}`).value.trim(),
            happened: document.getElementById(`happened-${i}`).value.trim(),
            next_move: document.getElementById(`nextMove-${i}`).value.trim()
        };

        activities.push(activity);
    }

    return {
        name: employeeName,
        date: reportDate,
        activities: activities
    };
}

/**
 * Submit data to Google Apps Script
 * @param {Object} data - The data to submit
 * @returns {Promise} - The fetch promise
 */
async function submitToGoogleScript(data) {
    const response = await fetch(getGoogleScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    // Since no-cors mode doesn't give us access to response details,
    // we'll assume success if no network error occurred
    return response;
}

/**
 * Reset the form to initial state
 */
function resetForm() {
    // Reset employee info
    document.getElementById('employeeName').value = '';
    initializeForm();

    // Remove all activity cards
    const container = document.getElementById('activitiesContainer');
    container.innerHTML = '';

    // Reset activity count
    activityCount = 0;

    // Add one empty activity card
    addActivityCard();
}

/**
 * Show loading indicator
 */
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('addActivityBtn').disabled = true;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('addActivityBtn').disabled = false;
}

/**
 * Show success message
 */
function showSuccess() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorMessage.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

/**
 * Hide all messages
 */
function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

/**
 * Google Apps Script web app URL (form submit + transcription). Never put Groq API key in this file.
 * @returns {string}
 */
function getGoogleScriptUrl() {
    const meta = document.querySelector('meta[name="google-script-url"]');
    const fromMeta = meta && meta.getAttribute('content');
    if (fromMeta && fromMeta.trim()) {
        return fromMeta.trim().replace(/\/$/, '');
    }
    return GOOGLE_SCRIPT_URL;
}

/**
 * Same deployment as the form; doPost routes on action: "transcribe".
 * @returns {string}
 */
function getTranscribeApiUrl() {
    const meta = document.querySelector('meta[name="transcribe-api-url"]');
    const fromMeta = meta && meta.getAttribute('content');
    if (fromMeta && fromMeta.trim()) {
        return fromMeta.trim().replace(/\/$/, '');
    }
    return getGoogleScriptUrl();
}

/**
 * @returns {string|null}
 */
function getSupportedRecordingMimeType() {
    if (typeof MediaRecorder === 'undefined') {
        return null;
    }
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg'
    ];
    for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return '';
}

/**
 * @param {HTMLElement} controlsEl
 * @param {string} message
 * @param {'idle'|'busy'|'error'} state
 */
function setVoiceControlStatus(controlsEl, message, state) {
    const statusEl = controlsEl.querySelector('.voice-status');
    if (!statusEl) {
        return;
    }
    statusEl.textContent = message || '';
    statusEl.classList.remove('is-error', 'is-busy');
    if (state === 'error') {
        statusEl.classList.add('is-error');
    } else if (state === 'busy') {
        statusEl.classList.add('is-busy');
    }
}

/**
 * @param {HTMLElement} controlsEl
 * @param {'idle'|'recording'|'transcribing'} uiState
 */
function setVoiceButtonState(controlsEl, uiState) {
    const btn = controlsEl.querySelector('.btn-voice-record');
    const label = controlsEl.querySelector('.voice-btn-label');
    const icon = controlsEl.querySelector('.voice-btn-icon');
    if (!btn || !label) {
        return;
    }
    btn.classList.remove('is-recording');
    if (uiState === 'recording') {
        btn.classList.add('is-recording');
        btn.disabled = false;
        label.textContent = 'Stop';
        if (icon) {
            icon.textContent = '⏹';
        }
        btn.setAttribute('aria-label', 'Stop recording');
        return;
    }
    if (uiState === 'transcribing') {
        btn.disabled = true;
        label.textContent = 'Transcribing…';
        if (icon) {
            icon.textContent = '';
        }
        return;
    }
    btn.disabled = false;
    label.textContent = 'Voice note';
    if (icon) {
        icon.textContent = '🎤';
    }
    btn.setAttribute('aria-label', 'Record voice note');
}

/**
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                reject(new Error('Could not read recording'));
                return;
            }
            const base64 = result.split(',')[1];
            resolve(base64 || '');
        };
        reader.onerror = () => reject(new Error('Could not read recording'));
        reader.readAsDataURL(blob);
    });
}

/**
 * @param {string} textareaId
 * @param {string} text
 */
function applyTranscriptionToField(textareaId, text) {
    const field = document.getElementById(textareaId);
    if (!field || !text) {
        return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
        return;
    }
    const existing = field.value.trim();
    field.value = existing ? `${existing}\n\n${trimmed}` : trimmed;
    field.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * @param {Blob} audioBlob
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
async function transcribeAudioBlob(audioBlob, mimeType) {
    const apiUrl = getTranscribeApiUrl();
    const base64 = await blobToBase64(audioBlob);
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';

    const response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'transcribe',
            audio: base64,
            mimeType: mimeType.split(';')[0],
            filename: `voice-note.${ext}`
        })
    });
    console.log('🎙️ Transcription response status:', response.status);

    let payload = {};
    try {
        payload = await response.json();
    } catch {
        payload = {};
    }

    if (!response.ok) {
        throw new Error(payload.error || 'Transcription failed. Please try again.');
    }

    if (payload.error) {
        throw new Error(payload.error);
    }

    return (payload.text || '').trim();
}

/**
 * Stop any in-progress recording without transcribing
 */
function cancelActiveVoiceSession() {
    if (!activeVoiceSession) {
        return;
    }
    const { recorder, stream, controlsEl } = activeVoiceSession;
    activeVoiceSession = null;
    if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        try {
            recorder.stop();
        } catch {
            /* ignore */
        }
    }
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
    }
    setVoiceButtonState(controlsEl, 'idle');
    setVoiceControlStatus(controlsEl, '', 'idle');
}

/**
 * @param {HTMLElement} controlsEl
 */
async function startVoiceRecording(controlsEl) {
    if (activeVoiceSession && activeVoiceSession.controlsEl !== controlsEl) {
        cancelActiveVoiceSession();
    }
    if (activeVoiceSession) {
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVoiceControlStatus(
            controlsEl,
            'Voice notes are not supported in this browser.',
            'error'
        );
        return;
    }

    const mimeType = getSupportedRecordingMimeType();
    console.log('🎙️ Browser selected recording MIME type:', mimeType);
    if (mimeType === null) {
        setVoiceControlStatus(
            controlsEl,
            'Voice recording is not supported in this browser.',
            'error'
        );
        return;
    }

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        const name = err && err.name;
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setVoiceControlStatus(
                controlsEl,
                'Microphone access was denied. Allow the mic in browser settings.',
                'error'
            );
        } else if (name === 'NotFoundError') {
            setVoiceControlStatus(controlsEl, 'No microphone was found on this device.', 'error');
        } else {
            setVoiceControlStatus(
                controlsEl,
                'Could not access the microphone. Please try again.',
                'error'
            );
        }
        return;
    }

    const chunks = [];
    let recorder;
    try {
        recorder = mimeType
            ? new MediaRecorder(stream, { mimeType })
            : new MediaRecorder(stream);
    } catch {
        stream.getTracks().forEach((track) => track.stop());
        setVoiceControlStatus(controlsEl, 'Could not start recording on this device.', 'error');
        return;
    }

    const targetId = controlsEl.getAttribute('data-target');
    const session = { recorder, stream, controlsEl, targetId, mimeType: recorder.mimeType || mimeType || 'audio/webm' };
    activeVoiceSession = session;

    recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const current = activeVoiceSession;
        activeVoiceSession = null;

        if (!current || current.controlsEl !== controlsEl) {
            return;
        }

        const blob = new Blob(chunks, { type: current.mimeType });

        if (blob.size === 0) {
            setVoiceButtonState(controlsEl, 'idle');
            setVoiceControlStatus(controlsEl, 'Recording was empty. Try again.', 'error');
            return;
        }

        const maxBytes = 3.5 * 1024 * 1024;
        if (blob.size > maxBytes) {
            setVoiceButtonState(controlsEl, 'idle');
            setVoiceControlStatus(
                controlsEl,
                'Recording is too long. Keep voice notes to about 2 minutes or less.',
                'error'
            );
            return;
        }

        setVoiceButtonState(controlsEl, 'transcribing');
        setVoiceControlStatus(
            controlsEl,
            'Transcribing your voice note…',
            'busy'
        );

        try {
            const text = await transcribeAudioBlob(blob, current.mimeType);
            if (!text) {
                setVoiceControlStatus(
                    controlsEl,
                    'No speech detected. Try speaking closer to the mic.',
                    'error'
                );
            } else {
                applyTranscriptionToField(targetId, text);
                setVoiceControlStatus(controlsEl, 'Added to the field above.', 'idle');
            }
        } catch (error) {
            setVoiceControlStatus(
                controlsEl,
                error.message || 'Transcription failed.',
                'error'
            );
        } finally {
            setVoiceButtonState(controlsEl, 'idle');
        }
    };

    recorder.start();
    setVoiceButtonState(controlsEl, 'recording');
    setVoiceControlStatus(controlsEl, 'Recording… tap Stop when finished.', 'busy');
}

/**
 * @param {HTMLElement} controlsEl
 */
function stopVoiceRecording(controlsEl) {
    if (!activeVoiceSession || activeVoiceSession.controlsEl !== controlsEl) {
        return;
    }
    const { recorder } = activeVoiceSession;
    if (recorder && recorder.state === 'recording') {
        recorder.stop();
    }
}

/**
 * @param {Event} event
 */
function handleVoiceControlClick(event) {
    const btn = event.target.closest('[data-voice-action="toggle"]');
    if (!btn) {
        return;
    }
    event.preventDefault();
    const controlsEl = btn.closest('.voice-note-controls');
    if (!controlsEl) {
        return;
    }

    if (activeVoiceSession && activeVoiceSession.controlsEl === controlsEl) {
        stopVoiceRecording(controlsEl);
        return;
    }

    startVoiceRecording(controlsEl);
}
