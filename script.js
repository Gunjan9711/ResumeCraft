/* ============================================================
   ResumeCraft — Premium Resume Builder
   Complete Application Logic
   ============================================================
   TABLE OF CONTENTS
   ------------------
   1.  Constants & DOM Cache
   2.  Application State
   3.  Utility Functions
   4.  Toast Notifications
   5.  Local Storage
   6.  Theme Management
   7.  Font & Template Management
   8.  Accent Color Management
   9.  Photo Upload
   10. Validation
   11. Personal Information
   12. Professional Summary
   13. Dynamic Entry Management
   14. Education
   15. Skills
   16. Projects
   17. Experience
   18. Certificates
   19. Achievements
   20. Languages
   21. Hobbies
   22. References
   23. Custom Sections
   24. Resume Preview Engine
   25. Progress Bar
   26. PDF Download
   27. Print Resume
   28. Reset Resume
   29. Event Listeners
   30. Initialization
   ============================================================ */

"use strict";

/* ==========================================================
   1. CONSTANTS & DOM CACHE
   ========================================================== */
const STORAGE_KEY = "resumecraft_data";
const STORAGE_SETTINGS_KEY = "resumecraft_settings";
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_SKILLS = 40;
const DEBOUNCE_DELAY = 300;
const TOAST_DURATION = 3500;

// Cache frequently used DOM elements
const DOM = {
    // Header controls
    themeToggle: document.getElementById("theme-toggle"),
    themeIcon: document.getElementById("theme-icon"),
    fontSelector: document.getElementById("font-selector"),
    templateSelector: document.getElementById("template-selector"),
    accentColorPicker: document.getElementById("accent-color-picker"),

    // Progress
    progressBar: document.getElementById("progress-bar"),
    progressText: document.getElementById("progress-text"),
    progressChecklist: document.getElementById("progress-checklist"),

    // Personal fields
    fullName: document.getElementById("full-name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    state: document.getElementById("state"),
    country: document.getElementById("country"),
    dob: document.getElementById("dob"),
    linkedin: document.getElementById("linkedin"),
    github: document.getElementById("github"),
    portfolio: document.getElementById("portfolio"),
    profilePhoto: document.getElementById("profile-photo"),
    photoPreview: document.getElementById("photo-preview"),

    // Summary
    summary: document.getElementById("summary"),
    summaryCounter: document.getElementById("summary-counter"),

    // Dynamic entry containers
    educationEntries: document.getElementById("education-entries"),
    projectEntries: document.getElementById("project-entries"),
    experienceEntries: document.getElementById("experience-entries"),
    certificateEntries: document.getElementById("certificate-entries"),
    achievementEntries: document.getElementById("achievement-entries"),
    languageEntries: document.getElementById("language-entries"),
    referenceEntries: document.getElementById("reference-entries"),
    customEntries: document.getElementById("custom-entries"),

    // Skills / Hobbies
    skillInput: document.getElementById("skill-input"),
    skillsBadges: document.getElementById("skills-badges"),
    hobbyInput: document.getElementById("hobby-input"),
    hobbiesBadges: document.getElementById("hobbies-badges"),

    // Add buttons
    addEducationBtn: document.getElementById("add-education-btn"),
    addSkillBtn: document.getElementById("add-skill-btn"),
    addProjectBtn: document.getElementById("add-project-btn"),
    addExperienceBtn: document.getElementById("add-experience-btn"),
    addCertificateBtn: document.getElementById("add-certificate-btn"),
    addAchievementBtn: document.getElementById("add-achievement-btn"),
    addLanguageBtn: document.getElementById("add-language-btn"),
    addHobbyBtn: document.getElementById("add-hobby-btn"),
    addReferenceBtn: document.getElementById("add-reference-btn"),
    addCustomBtn: document.getElementById("add-custom-btn"),

    // Action buttons
    downloadBtn: document.getElementById("download-btn"),
    printBtn: document.getElementById("print-btn"),
    resetBtn: document.getElementById("reset-btn"),
    mobileDownloadBtn: document.getElementById("mobile-download-btn"),
    mobilePrintBtn: document.getElementById("mobile-print-btn"),
    mobileResetBtn: document.getElementById("mobile-reset-btn"),

    // Modal
    resetModal: document.getElementById("reset-modal"),
    resetConfirmBtn: document.getElementById("reset-confirm-btn"),
    resetCancelBtn: document.getElementById("reset-cancel-btn"),

    // Spinner
    downloadSpinner: document.getElementById("download-spinner"),

    // Toast
    toastContainer: document.getElementById("toast-container"),

    // Resume preview elements
    resumePage: document.getElementById("resume-page"),
    resumeEmptyState: document.getElementById("resume-empty-state"),
    resumeContent: document.getElementById("resume-content"),
    resumeHeader: document.getElementById("resume-header"),
    resumeName: document.getElementById("resume-name"),
    resumeContact: document.getElementById("resume-contact"),
    resumePhoto: document.getElementById("resume-photo"),
    resumeSummarySection: document.getElementById("resume-summary-section"),
    resumeSummaryText: document.getElementById("resume-summary-text"),
    resumeEducationSection: document.getElementById("resume-education-section"),
    resumeEducationList: document.getElementById("resume-education-list"),
    resumeSkillsSection: document.getElementById("resume-skills-section"),
    resumeSkillsList: document.getElementById("resume-skills-list"),
    resumeProjectsSection: document.getElementById("resume-projects-section"),
    resumeProjectsList: document.getElementById("resume-projects-list"),
    resumeExperienceSection: document.getElementById("resume-experience-section"),
    resumeExperienceList: document.getElementById("resume-experience-list"),
    resumeCertificatesSection: document.getElementById("resume-certificates-section"),
    resumeCertificatesList: document.getElementById("resume-certificates-list"),
    resumeAchievementsSection: document.getElementById("resume-achievements-section"),
    resumeAchievementsList: document.getElementById("resume-achievements-list"),
    resumeLanguagesSection: document.getElementById("resume-languages-section"),
    resumeLanguagesList: document.getElementById("resume-languages-list"),
    resumeHobbiesSection: document.getElementById("resume-hobbies-section"),
    resumeHobbiesList: document.getElementById("resume-hobbies-list"),
    resumeReferencesSection: document.getElementById("resume-references-section"),
    resumeReferencesList: document.getElementById("resume-references-list"),
    resumeCustomSections: document.getElementById("resume-custom-sections"),

    // Footer
    footerYear: document.getElementById("footer-year"),
};


/* ==========================================================
   2. APPLICATION STATE
   ========================================================== */
const AppState = {
    theme: "dark",
    font: "Poppins",
    template: "modern",
    accentColor: "#00D9FF",
    photoData: null, // base64 string

    resumeData: {
        personal: {
            fullName: "", email: "", phone: "", address: "",
            city: "", state: "", country: "", dob: "",
            linkedin: "", github: "", portfolio: "",
        },
        summary: "",
        education: [],
        skills: [],
        projects: [],
        experience: [],
        certificates: [],
        achievements: [],
        languages: [],
        hobbies: [],
        references: [],
        custom: [],
    },
};

// Track debounce timers
let saveTimer = null;
let previewTimer = null;


/* ==========================================================
   3. UTILITY FUNCTIONS
   ========================================================== */

/**
 * Creates a DOM element safely with attributes and children
 */
function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key === "className") {
            el.className = value;
        } else if (key === "textContent") {
            el.textContent = value;
        } else if (key === "innerHTML" && typeof value === "string") {
            // Only use for trusted content (icons etc.)
            el.innerHTML = value;
        } else {
            el.setAttribute(key, value);
        }
    }
    children.forEach(child => {
        if (typeof child === "string") {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    });
    return el;
}

/**
 * Debounce function to limit rapid calls
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Sanitize URL — allow only http/https protocols
 */
function sanitizeURL(url) {
    if (!url) return "";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return "";
}

/**
 * Escape HTML entities for safe text display
 */
function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Count words in a string
 */
function countWords(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).length;
}

/**
 * Smoothly scroll an element into view
 */
function scrollToElement(element) {
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/**
 * Set current year in footer
 */
function setFooterYear() {
    if (DOM.footerYear) {
        DOM.footerYear.textContent = new Date().getFullYear();
    }
}


/* ==========================================================
   4. TOAST NOTIFICATIONS
   ========================================================== */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 */
function showToast(message, type = "success") {
    const iconMap = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
    };

    const toast = createElement("div", { className: `toast toast-${type}` }, [
        createElement("span", { className: "toast-icon", innerHTML: `<i class="${iconMap[type] || iconMap.info}"></i>` }),
        createElement("span", { className: "toast-message", textContent: message }),
        createElement("button", { className: "toast-close", innerHTML: '<i class="fas fa-times"></i>', "aria-label": "Close notification" }),
    ]);

    // Close button handler
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => dismissToast(toast));

    DOM.toastContainer.appendChild(toast);

    // Auto-dismiss after duration
    setTimeout(() => dismissToast(toast), TOAST_DURATION);
}

/**
 * Dismiss a toast with exit animation
 */
function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add("toast-exit");
    toast.addEventListener("animationend", () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });
}


/* ==========================================================
   5. LOCAL STORAGE
   ========================================================== */

/**
 * Save all data to Local Storage (debounced)
 */
function saveToLocalStorage() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            // Save settings separately (lightweight)
            const settings = {
                theme: AppState.theme,
                font: AppState.font,
                template: AppState.template,
                accentColor: AppState.accentColor,
            };
            localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));

            // Save resume data including photo
            const data = {
                resumeData: AppState.resumeData,
                photoData: AppState.photoData,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn("ResumeCraft: Could not save to Local Storage.", e);
            if (e.name === "QuotaExceededError") {
                showToast("Storage is full. Consider removing your photo or some data.", "warning");
            }
        }
    }, DEBOUNCE_DELAY);
}

/**
 * Load data from Local Storage
 */
function loadFromLocalStorage() {
    try {
        // Load settings
        const settingsStr = localStorage.getItem(STORAGE_SETTINGS_KEY);
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            if (settings.theme) AppState.theme = settings.theme;
            if (settings.font) AppState.font = settings.font;
            if (settings.template) AppState.template = settings.template;
            if (settings.accentColor) AppState.accentColor = settings.accentColor;
        }

        // Load resume data
        const dataStr = localStorage.getItem(STORAGE_KEY);
        if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data.resumeData) {
                // Merge with defaults to handle newly added fields
                AppState.resumeData = { ...AppState.resumeData, ...data.resumeData };
                if (data.resumeData.personal) {
                    AppState.resumeData.personal = { ...AppState.resumeData.personal, ...data.resumeData.personal };
                }
            }
            if (data.photoData) {
                AppState.photoData = data.photoData;
            }
        }
    } catch (e) {
        console.warn("ResumeCraft: Could not load from Local Storage.", e);
    }
}

/**
 * Clear all stored data
 */
function clearLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_SETTINGS_KEY);
    } catch (e) {
        console.warn("ResumeCraft: Could not clear Local Storage.", e);
    }
}


/* ==========================================================
   6. THEME MANAGEMENT
   ========================================================== */

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);

    if (DOM.themeIcon) {
        DOM.themeIcon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
    }
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    const newTheme = AppState.theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    saveToLocalStorage();
    showToast(`Switched to ${newTheme === "dark" ? "Dark" : "Light"} Mode`, "info");
}


/* ==========================================================
   7. FONT & TEMPLATE MANAGEMENT
   ========================================================== */

/**
 * Apply selected font to resume preview
 */
function applyFont(fontName) {
    AppState.font = fontName;
    if (DOM.resumePage) {
        DOM.resumePage.style.fontFamily = `'${fontName}', sans-serif`;
    }
    if (DOM.fontSelector) {
        DOM.fontSelector.value = fontName;
    }
}

/**
 * Apply selected template to resume preview
 */
function applyTemplate(templateName) {
    AppState.template = templateName;
    if (DOM.resumePage) {
        // Remove all template classes
        DOM.resumePage.classList.remove(
            "template-modern", "template-professional",
            "template-minimal", "template-creative"
        );
        DOM.resumePage.classList.add(`template-${templateName}`);
    }
    if (DOM.templateSelector) {
        DOM.templateSelector.value = templateName;
    }
}


/* ==========================================================
   8. ACCENT COLOR MANAGEMENT
   ========================================================== */

/**
 * Apply accent color across the application
 */
function applyAccentColor(color) {
    AppState.accentColor = color;
    document.documentElement.style.setProperty("--color-accent", color);

    // Compute hover color (slightly darker)
    const hoverColor = adjustBrightness(color, -15);
    document.documentElement.style.setProperty("--color-accent-hover", hoverColor);

    // Compute glow color (transparent version)
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty("--color-accent-glow", `rgba(${r}, ${g}, ${b}, 0.25)`);

    if (DOM.accentColorPicker) {
        DOM.accentColorPicker.value = color;
    }
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16) + amount;
    let g = parseInt(hex.slice(3, 5), 16) + amount;
    let b = parseInt(hex.slice(5, 7), 16) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}


/* ==========================================================
   9. PHOTO UPLOAD
   ========================================================== */

/**
 * Handle profile photo upload
 */
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
        showToast("Please upload a PNG, JPG, or JPEG image.", "error");
        event.target.value = "";
        return;
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
        showToast("Photo must be smaller than 2MB.", "error");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        AppState.photoData = e.target.result;
        renderPhotoPreview();
        updateResumePreview();
        saveToLocalStorage();
        showToast("Profile photo uploaded successfully!", "success");
    };
    reader.onerror = function () {
        showToast("Could not read the image file. Please try again.", "error");
    };
    reader.readAsDataURL(file);
}

/**
 * Render photo in the form preview circle
 */
function renderPhotoPreview() {
    if (!DOM.photoPreview) return;

    if (AppState.photoData) {
        DOM.photoPreview.innerHTML = "";
        const img = createElement("img", { src: AppState.photoData, alt: "Profile photo" });
        DOM.photoPreview.appendChild(img);
        DOM.photoPreview.classList.add("has-photo");
    } else {
        DOM.photoPreview.innerHTML = '<i class="fas fa-camera"></i><span>Upload Photo</span>';
        DOM.photoPreview.classList.remove("has-photo");
    }
}


/* ==========================================================
   10. VALIDATION
   ========================================================== */

/**
 * Validate a single field and show error
 * @returns {boolean} whether the field is valid
 */
function validateField(input, errorEl, rules) {
    const value = input.value.trim();
    let errorMsg = "";

    if (rules.required && !value) {
        errorMsg = rules.requiredMsg || "This field cannot be empty.";
    } else if (value && rules.minLength && value.length < rules.minLength) {
        errorMsg = `Must be at least ${rules.minLength} characters.`;
    } else if (value && rules.maxLength && value.length > rules.maxLength) {
        errorMsg = `Must be no more than ${rules.maxLength} characters.`;
    } else if (value && rules.pattern && !rules.pattern.test(value)) {
        errorMsg = rules.patternMsg || "Invalid format.";
    } else if (value && rules.noNumbers && /\d/.test(value)) {
        errorMsg = "Numbers are not allowed in this field.";
    } else if (value && rules.urlRequired && !value.startsWith("https://")) {
        errorMsg = "URL must begin with https://";
    } else if (value && rules.custom) {
        errorMsg = rules.custom(value);
    }

    if (errorEl) {
        errorEl.textContent = errorMsg;
    }

    // Visual state on the input
    const inputEl = input.closest(".input-wrapper") ? input : input;
    if (errorMsg) {
        inputEl.classList.add("input-error");
        inputEl.classList.remove("input-success");
    } else if (value) {
        inputEl.classList.remove("input-error");
        inputEl.classList.add("input-success");
    } else {
        inputEl.classList.remove("input-error", "input-success");
    }

    return !errorMsg;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone (digits only, 10-15 length)
 */
function isValidPhone(phone) {
    return /^\d{10,15}$/.test(phone);
}

/**
 * Validate personal information fields
 */
function validatePersonalFields() {
    validateField(DOM.fullName, document.getElementById("error-full-name"), {
        required: true, minLength: 3, maxLength: 60, noNumbers: true,
        requiredMsg: "Please enter your full name.",
    });

    validateField(DOM.email, document.getElementById("error-email"), {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMsg: "Please enter a valid email address (e.g. john@example.com).",
        requiredMsg: "Please enter your email address.",
    });

    validateField(DOM.phone, document.getElementById("error-phone"), {
        required: true,
        pattern: /^\d{10,15}$/,
        patternMsg: "Please enter a valid phone number (10-15 digits, numbers only).",
        requiredMsg: "Please enter your phone number.",
    });

    // Optional URL fields
    const urlFields = [
        { input: DOM.linkedin, error: document.getElementById("error-linkedin") },
        { input: DOM.github, error: document.getElementById("error-github") },
        { input: DOM.portfolio, error: document.getElementById("error-portfolio") },
    ];

    urlFields.forEach(({ input, error }) => {
        if (input.value.trim()) {
            validateField(input, error, {
                urlRequired: true,
            });
        } else if (error) {
            error.textContent = "";
            input.classList.remove("input-error", "input-success");
        }
    });
}


/* ==========================================================
   11. PERSONAL INFORMATION
   ========================================================== */

/**
 * Collect personal data from form inputs
 */
function collectPersonalData() {
    AppState.resumeData.personal = {
        fullName: DOM.fullName.value.trim(),
        email: DOM.email.value.trim(),
        phone: DOM.phone.value.trim(),
        address: DOM.address.value.trim(),
        city: DOM.city.value.trim(),
        state: DOM.state.value.trim(),
        country: DOM.country.value.trim(),
        dob: DOM.dob.value,
        linkedin: DOM.linkedin.value.trim(),
        github: DOM.github.value.trim(),
        portfolio: DOM.portfolio.value.trim(),
    };
}

/**
 * Populate form inputs from stored personal data
 */
function populatePersonalFields() {
    const p = AppState.resumeData.personal;
    DOM.fullName.value = p.fullName || "";
    DOM.email.value = p.email || "";
    DOM.phone.value = p.phone || "";
    DOM.address.value = p.address || "";
    DOM.city.value = p.city || "";
    DOM.state.value = p.state || "";
    DOM.country.value = p.country || "";
    DOM.dob.value = p.dob || "";
    DOM.linkedin.value = p.linkedin || "";
    DOM.github.value = p.github || "";
    DOM.portfolio.value = p.portfolio || "";
}


/* ==========================================================
   12. PROFESSIONAL SUMMARY
   ========================================================== */

/**
 * Update word counter for the summary textarea
 */
function updateSummaryCounter() {
    const words = countWords(DOM.summary.value);
    DOM.summaryCounter.textContent = `${words} / 300 words`;
    DOM.summaryCounter.classList.toggle("over-limit", words > 300);
}

/**
 * Collect summary data
 */
function collectSummaryData() {
    AppState.resumeData.summary = DOM.summary.value.trim();
}

/**
 * Populate summary field
 */
function populateSummaryField() {
    DOM.summary.value = AppState.resumeData.summary || "";
    updateSummaryCounter();
}


/* ==========================================================
   13. DYNAMIC ENTRY MANAGEMENT (Generic)
   ========================================================== */

/**
 * Clone a <template> element and return the first child element
 */
function cloneTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return null;
    const clone = template.content.cloneNode(true);
    return clone.firstElementChild;
}

/**
 * Update entry numbers within a container
 */
function updateEntryNumbers(container, label) {
    const entries = container.querySelectorAll(".dynamic-entry");
    entries.forEach((entry, index) => {
        const numEl = entry.querySelector(".entry-number");
        if (numEl) {
            numEl.textContent = `${label} #${index + 1}`;
        }
        entry.setAttribute("data-index", index);
    });
}

/**
 * Attach a delete handler to an entry
 */
function attachDeleteHandler(entry, container, label, onDelete) {
    const deleteBtn = entry.querySelector(".btn-delete");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            entry.style.opacity = "0";
            entry.style.transform = "translateY(-10px)";
            entry.style.transition = "all 0.25s ease";
            setTimeout(() => {
                if (entry.parentNode) entry.parentNode.removeChild(entry);
                updateEntryNumbers(container, label);
                if (onDelete) onDelete();
                showToast(`${label} entry removed.`, "info");
            }, 250);
        });
    }
}

/**
 * Attach input listeners that auto-save and update preview
 */
function attachEntryInputListeners(entry, collectFn) {
    const inputs = entry.querySelectorAll("input, textarea, select");
    const debouncedUpdate = debounce(() => {
        collectFn();
        updateResumePreview();
        saveToLocalStorage();
    }, DEBOUNCE_DELAY);

    inputs.forEach(input => {
        input.addEventListener("input", debouncedUpdate);
        input.addEventListener("change", debouncedUpdate);
    });
}


/* ==========================================================
   14. EDUCATION
   ========================================================== */

/**
 * Add a new education entry to the form
 */
function addEducationEntry(data = null) {
    const entry = cloneTemplate("template-education-entry");
    if (!entry) return;

    // Pre-fill if restoring from storage
    if (data) {
        entry.querySelector(".edu-degree").value = data.degree || "";
        entry.querySelector(".edu-college").value = data.college || "";
        entry.querySelector(".edu-university").value = data.university || "";
        entry.querySelector(".edu-location").value = data.location || "";
        entry.querySelector(".edu-start-year").value = data.startYear || "";
        entry.querySelector(".edu-end-year").value = data.endYear || "";
        entry.querySelector(".edu-grade").value = data.grade || "";
    }

    DOM.educationEntries.appendChild(entry);
    updateEntryNumbers(DOM.educationEntries, "Education");

    attachDeleteHandler(entry, DOM.educationEntries, "Education", () => {
        collectEducationData();
        updateResumePreview();
        saveToLocalStorage();
        updateProgress();
    });

    attachEntryInputListeners(entry, () => {
        collectEducationData();
        updateProgress();
    });

    // Validate end year >= start year
    const startYearInput = entry.querySelector(".edu-start-year");
    const endYearInput = entry.querySelector(".edu-end-year");
    const errorEl = entry.querySelector(".entry-error");

    function validateYears() {
        const start = parseInt(startYearInput.value);
        const end = parseInt(endYearInput.value);
        if (start && end && end < start) {
            errorEl.textContent = "End year cannot be before start year.";
        } else {
            errorEl.textContent = "";
        }
    }

    startYearInput.addEventListener("input", validateYears);
    endYearInput.addEventListener("input", validateYears);

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".edu-degree").focus();
    }
}

/**
 * Collect all education data from entries
 */
function collectEducationData() {
    const entries = DOM.educationEntries.querySelectorAll(".education-entry");
    AppState.resumeData.education = Array.from(entries).map(entry => ({
        degree: entry.querySelector(".edu-degree").value.trim(),
        college: entry.querySelector(".edu-college").value.trim(),
        university: entry.querySelector(".edu-university").value.trim(),
        location: entry.querySelector(".edu-location").value.trim(),
        startYear: entry.querySelector(".edu-start-year").value.trim(),
        endYear: entry.querySelector(".edu-end-year").value.trim(),
        grade: entry.querySelector(".edu-grade").value.trim(),
    }));
}


/* ==========================================================
   15. SKILLS
   ========================================================== */

/**
 * Add a skill to the list
 */
function addSkill(skillName = null) {
    const name = skillName || DOM.skillInput.value.trim();
    if (!name) {
        showToast("Please enter a skill name.", "warning");
        return;
    }

    // Check duplicates (case-insensitive)
    if (AppState.resumeData.skills.some(s => s.toLowerCase() === name.toLowerCase())) {
        showToast("This skill has already been added.", "warning");
        DOM.skillInput.value = "";
        return;
    }

    // Check max limit
    if (AppState.resumeData.skills.length >= MAX_SKILLS) {
        showToast(`Maximum ${MAX_SKILLS} skills allowed.`, "warning");
        return;
    }

    AppState.resumeData.skills.push(name);
    renderSkillBadges();
    updateResumePreview();
    saveToLocalStorage();
    updateProgress();

    DOM.skillInput.value = "";
    DOM.skillInput.focus();

    if (!skillName) {
        showToast(`Skill "${name}" added!`, "success");
    }
}

/**
 * Remove a skill by name
 */
function removeSkill(skillName) {
    AppState.resumeData.skills = AppState.resumeData.skills.filter(
        s => s.toLowerCase() !== skillName.toLowerCase()
    );
    renderSkillBadges();
    updateResumePreview();
    saveToLocalStorage();
    updateProgress();
}

/**
 * Render skill badges in the form
 */
function renderSkillBadges() {
    DOM.skillsBadges.innerHTML = "";
    AppState.resumeData.skills.forEach(skill => {
        const badge = createElement("span", { className: "skill-badge" }, [
            document.createTextNode(skill),
            createElement("button", {
                className: "badge-remove",
                innerHTML: '<i class="fas fa-times"></i>',
                "aria-label": `Remove ${skill}`,
            }),
        ]);

        badge.querySelector(".badge-remove").addEventListener("click", () => removeSkill(skill));
        DOM.skillsBadges.appendChild(badge);
    });
}


/* ==========================================================
   16. PROJECTS
   ========================================================== */

/**
 * Add a new project entry
 */
function addProjectEntry(data = null) {
    const entry = cloneTemplate("template-project-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".proj-title").value = data.title || "";
        entry.querySelector(".proj-tech").value = data.tech || "";
        entry.querySelector(".proj-description").value = data.description || "";
        entry.querySelector(".proj-github").value = data.github || "";
        entry.querySelector(".proj-demo").value = data.demo || "";
        entry.querySelector(".proj-duration").value = data.duration || "";
    }

    DOM.projectEntries.appendChild(entry);
    updateEntryNumbers(DOM.projectEntries, "Project");

    attachDeleteHandler(entry, DOM.projectEntries, "Project", () => {
        collectProjectData();
        updateResumePreview();
        saveToLocalStorage();
        updateProgress();
    });

    attachEntryInputListeners(entry, () => {
        collectProjectData();
        updateProgress();
    });

    // Character counter for description
    const descInput = entry.querySelector(".proj-description");
    const charCounter = entry.querySelector(".proj-char-counter");
    if (descInput && charCounter) {
        function updateCharCount() {
            const len = descInput.value.length;
            charCounter.textContent = `${len} / 250`;
            charCounter.classList.toggle("over-limit", len > 250);
        }
        descInput.addEventListener("input", updateCharCount);
        updateCharCount();
    }

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".proj-title").focus();
    }
}

/**
 * Collect all project data
 */
function collectProjectData() {
    const entries = DOM.projectEntries.querySelectorAll(".project-entry");
    AppState.resumeData.projects = Array.from(entries).map(entry => ({
        title: entry.querySelector(".proj-title").value.trim(),
        tech: entry.querySelector(".proj-tech").value.trim(),
        description: entry.querySelector(".proj-description").value.trim(),
        github: entry.querySelector(".proj-github").value.trim(),
        demo: entry.querySelector(".proj-demo").value.trim(),
        duration: entry.querySelector(".proj-duration").value.trim(),
    }));
}


/* ==========================================================
   17. EXPERIENCE
   ========================================================== */

function addExperienceEntry(data = null) {
    const entry = cloneTemplate("template-experience-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".exp-company").value = data.company || "";
        entry.querySelector(".exp-title").value = data.title || "";
        entry.querySelector(".exp-duration").value = data.duration || "";
        entry.querySelector(".exp-location").value = data.location || "";
        entry.querySelector(".exp-description").value = data.description || "";
    }

    DOM.experienceEntries.appendChild(entry);
    updateEntryNumbers(DOM.experienceEntries, "Experience");

    attachDeleteHandler(entry, DOM.experienceEntries, "Experience", () => {
        collectExperienceData();
        updateResumePreview();
        saveToLocalStorage();
        updateProgress();
    });

    attachEntryInputListeners(entry, () => {
        collectExperienceData();
        updateProgress();
    });

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".exp-company").focus();
    }
}

function collectExperienceData() {
    const entries = DOM.experienceEntries.querySelectorAll(".experience-entry");
    AppState.resumeData.experience = Array.from(entries).map(entry => ({
        company: entry.querySelector(".exp-company").value.trim(),
        title: entry.querySelector(".exp-title").value.trim(),
        duration: entry.querySelector(".exp-duration").value.trim(),
        location: entry.querySelector(".exp-location").value.trim(),
        description: entry.querySelector(".exp-description").value.trim(),
    }));
}


/* ==========================================================
   18. CERTIFICATES
   ========================================================== */

function addCertificateEntry(data = null) {
    const entry = cloneTemplate("template-certificate-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".cert-name").value = data.name || "";
        entry.querySelector(".cert-org").value = data.org || "";
        entry.querySelector(".cert-year").value = data.year || "";
        entry.querySelector(".cert-url").value = data.url || "";
    }

    DOM.certificateEntries.appendChild(entry);
    updateEntryNumbers(DOM.certificateEntries, "Certificate");

    attachDeleteHandler(entry, DOM.certificateEntries, "Certificate", () => {
        collectCertificateData();
        updateResumePreview();
        saveToLocalStorage();
    });

    attachEntryInputListeners(entry, collectCertificateData);

    // Validate year not exceeding current year
    const yearInput = entry.querySelector(".cert-year");
    yearInput.addEventListener("input", () => {
        const year = parseInt(yearInput.value);
        const currentYear = new Date().getFullYear();
        if (year && year > currentYear) {
            yearInput.classList.add("input-error");
        } else {
            yearInput.classList.remove("input-error");
        }
    });

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".cert-name").focus();
    }
}

function collectCertificateData() {
    const entries = DOM.certificateEntries.querySelectorAll(".certificate-entry");
    AppState.resumeData.certificates = Array.from(entries).map(entry => ({
        name: entry.querySelector(".cert-name").value.trim(),
        org: entry.querySelector(".cert-org").value.trim(),
        year: entry.querySelector(".cert-year").value.trim(),
        url: entry.querySelector(".cert-url").value.trim(),
    }));
}


/* ==========================================================
   19. ACHIEVEMENTS
   ========================================================== */

function addAchievementEntry(data = null) {
    const entry = cloneTemplate("template-achievement-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".achv-title").value = data.title || "";
        entry.querySelector(".achv-description").value = data.description || "";
        entry.querySelector(".achv-year").value = data.year || "";
    }

    DOM.achievementEntries.appendChild(entry);
    updateEntryNumbers(DOM.achievementEntries, "Achievement");

    attachDeleteHandler(entry, DOM.achievementEntries, "Achievement", () => {
        collectAchievementData();
        updateResumePreview();
        saveToLocalStorage();
    });

    attachEntryInputListeners(entry, collectAchievementData);

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".achv-title").focus();
    }
}

function collectAchievementData() {
    const entries = DOM.achievementEntries.querySelectorAll(".achievement-entry");
    AppState.resumeData.achievements = Array.from(entries).map(entry => ({
        title: entry.querySelector(".achv-title").value.trim(),
        description: entry.querySelector(".achv-description").value.trim(),
        year: entry.querySelector(".achv-year").value.trim(),
    }));
}


/* ==========================================================
   20. LANGUAGES
   ========================================================== */

function addLanguageEntry(data = null) {
    const entry = cloneTemplate("template-language-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".lang-name").value = data.name || "";
        entry.querySelector(".lang-proficiency").value = data.proficiency || "Advanced";
    }

    DOM.languageEntries.appendChild(entry);
    updateEntryNumbers(DOM.languageEntries, "Language");

    attachDeleteHandler(entry, DOM.languageEntries, "Language", () => {
        collectLanguageData();
        updateResumePreview();
        saveToLocalStorage();
    });

    attachEntryInputListeners(entry, collectLanguageData);

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".lang-name").focus();
    }
}

function collectLanguageData() {
    const entries = DOM.languageEntries.querySelectorAll(".language-entry");
    AppState.resumeData.languages = Array.from(entries).map(entry => ({
        name: entry.querySelector(".lang-name").value.trim(),
        proficiency: entry.querySelector(".lang-proficiency").value,
    }));
}


/* ==========================================================
   21. HOBBIES
   ========================================================== */

function addHobby(hobbyName = null) {
    const name = hobbyName || DOM.hobbyInput.value.trim();
    if (!name) {
        showToast("Please enter a hobby.", "warning");
        return;
    }

    if (AppState.resumeData.hobbies.some(h => h.toLowerCase() === name.toLowerCase())) {
        showToast("This hobby has already been added.", "warning");
        DOM.hobbyInput.value = "";
        return;
    }

    AppState.resumeData.hobbies.push(name);
    renderHobbyBadges();
    updateResumePreview();
    saveToLocalStorage();

    DOM.hobbyInput.value = "";
    DOM.hobbyInput.focus();

    if (!hobbyName) {
        showToast(`Hobby "${name}" added!`, "success");
    }
}

function removeHobby(hobbyName) {
    AppState.resumeData.hobbies = AppState.resumeData.hobbies.filter(
        h => h.toLowerCase() !== hobbyName.toLowerCase()
    );
    renderHobbyBadges();
    updateResumePreview();
    saveToLocalStorage();
}

function renderHobbyBadges() {
    DOM.hobbiesBadges.innerHTML = "";
    AppState.resumeData.hobbies.forEach(hobby => {
        const badge = createElement("span", { className: "skill-badge" }, [
            document.createTextNode(hobby),
            createElement("button", {
                className: "badge-remove",
                innerHTML: '<i class="fas fa-times"></i>',
                "aria-label": `Remove ${hobby}`,
            }),
        ]);
        badge.querySelector(".badge-remove").addEventListener("click", () => removeHobby(hobby));
        DOM.hobbiesBadges.appendChild(badge);
    });
}


/* ==========================================================
   22. REFERENCES
   ========================================================== */

function addReferenceEntry(data = null) {
    const entry = cloneTemplate("template-reference-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".ref-name").value = data.name || "";
        entry.querySelector(".ref-position").value = data.position || "";
        entry.querySelector(".ref-company").value = data.company || "";
        entry.querySelector(".ref-email").value = data.email || "";
        entry.querySelector(".ref-phone").value = data.phone || "";
    }

    DOM.referenceEntries.appendChild(entry);
    updateEntryNumbers(DOM.referenceEntries, "Reference");

    attachDeleteHandler(entry, DOM.referenceEntries, "Reference", () => {
        collectReferenceData();
        updateResumePreview();
        saveToLocalStorage();
    });

    attachEntryInputListeners(entry, collectReferenceData);

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".ref-name").focus();
    }
}

function collectReferenceData() {
    const entries = DOM.referenceEntries.querySelectorAll(".reference-entry");
    AppState.resumeData.references = Array.from(entries).map(entry => ({
        name: entry.querySelector(".ref-name").value.trim(),
        position: entry.querySelector(".ref-position").value.trim(),
        company: entry.querySelector(".ref-company").value.trim(),
        email: entry.querySelector(".ref-email").value.trim(),
        phone: entry.querySelector(".ref-phone").value.trim(),
    }));
}


/* ==========================================================
   23. CUSTOM SECTIONS
   ========================================================== */

function addCustomEntry(data = null) {
    const entry = cloneTemplate("template-custom-entry");
    if (!entry) return;

    if (data) {
        entry.querySelector(".custom-title").value = data.title || "";
        entry.querySelector(".custom-content").value = data.content || "";
    }

    DOM.customEntries.appendChild(entry);
    updateEntryNumbers(DOM.customEntries, "Custom Section");

    attachDeleteHandler(entry, DOM.customEntries, "Custom Section", () => {
        collectCustomData();
        updateResumePreview();
        saveToLocalStorage();
    });

    attachEntryInputListeners(entry, collectCustomData);

    if (!data) {
        scrollToElement(entry);
        entry.querySelector(".custom-title").focus();
    }
}

function collectCustomData() {
    const entries = DOM.customEntries.querySelectorAll(".custom-entry");
    AppState.resumeData.custom = Array.from(entries).map(entry => ({
        title: entry.querySelector(".custom-title").value.trim(),
        content: entry.querySelector(".custom-content").value.trim(),
    }));
}


/* ==========================================================
   24. RESUME PREVIEW ENGINE
   ========================================================== */

/**
 * Master function — updates the entire resume preview
 */
function updateResumePreview() {
    const data = AppState.resumeData;

    // Determine if there is any data at all
    const hasAnyData =
        data.personal.fullName ||
        data.personal.email ||
        data.summary ||
        data.education.length > 0 ||
        data.skills.length > 0 ||
        data.projects.length > 0 ||
        data.experience.length > 0 ||
        data.certificates.length > 0 ||
        data.achievements.length > 0 ||
        data.languages.length > 0 ||
        data.hobbies.length > 0 ||
        data.references.length > 0 ||
        data.custom.length > 0 ||
        AppState.photoData;

    // Toggle empty state vs content
    if (hasAnyData) {
        DOM.resumeEmptyState.style.display = "none";
        DOM.resumeContent.style.display = "block";
    } else {
        DOM.resumeEmptyState.style.display = "flex";
        DOM.resumeContent.style.display = "none";
        return;
    }

    renderResumeHeader();
    renderResumeSummary();
    renderResumeEducation();
    renderResumeSkills();
    renderResumeProjects();
    renderResumeExperience();
    renderResumeCertificates();
    renderResumeAchievements();
    renderResumeLanguages();
    renderResumeHobbies();
    renderResumeReferences();
    renderResumeCustom();
}

/**
 * Render the resume header (name, photo, contact info)
 */
function renderResumeHeader() {
    const p = AppState.resumeData.personal;

    // Name
    DOM.resumeName.textContent = p.fullName || "Your Name";

    // Photo
    DOM.resumePhoto.innerHTML = "";
    if (AppState.photoData) {
        const img = createElement("img", { src: AppState.photoData, alt: "Profile photo" });
        DOM.resumePhoto.appendChild(img);
    } else {
        DOM.resumePhoto.innerHTML = '<i class="fas fa-user-circle"></i>';
    }

    // Contact items
    DOM.resumeContact.innerHTML = "";
    const contactItems = [];

    if (p.email) {
        contactItems.push({ icon: "fas fa-envelope", text: p.email, href: `mailto:${p.email}` });
    }
    if (p.phone) {
        contactItems.push({ icon: "fas fa-phone", text: p.phone, href: `tel:${p.phone}` });
    }

    // Build location string
    const locationParts = [p.address, p.city, p.state, p.country].filter(Boolean);
    if (locationParts.length > 0) {
        contactItems.push({ icon: "fas fa-map-marker-alt", text: locationParts.join(", ") });
    }

    if (p.linkedin) {
        contactItems.push({ icon: "fab fa-linkedin", text: "LinkedIn", href: sanitizeURL(p.linkedin) });
    }
    if (p.github) {
        contactItems.push({ icon: "fab fa-github", text: "GitHub", href: sanitizeURL(p.github) });
    }
    if (p.portfolio) {
        contactItems.push({ icon: "fas fa-globe", text: "Portfolio", href: sanitizeURL(p.portfolio) });
    }

    contactItems.forEach(item => {
        const span = createElement("span", { className: "resume-contact-item" });
        span.innerHTML = `<i class="${item.icon}"></i>`;
        if (item.href) {
            const a = createElement("a", { href: item.href, target: "_blank", rel: "noopener noreferrer", textContent: item.text });
            span.appendChild(a);
        } else {
            span.appendChild(document.createTextNode(item.text));
        }
        DOM.resumeContact.appendChild(span);
    });
}

/**
 * Render the summary/objective section
 */
function renderResumeSummary() {
    const summary = AppState.resumeData.summary;
    if (summary) {
        DOM.resumeSummarySection.style.display = "block";
        DOM.resumeSummaryText.textContent = summary;
    } else {
        DOM.resumeSummarySection.style.display = "none";
    }
}

/**
 * Render education section (newest first)
 */
function renderResumeEducation() {
    const education = AppState.resumeData.education.filter(e => e.degree || e.college);

    if (education.length === 0) {
        DOM.resumeEducationSection.style.display = "none";
        return;
    }

    DOM.resumeEducationSection.style.display = "block";
    DOM.resumeEducationList.innerHTML = "";

    // Reverse to show newest first
    [...education].reverse().forEach(edu => {
        const item = createElement("div", { className: "resume-edu-item" });

        const left = createElement("div", { className: "resume-edu-left" });
        if (edu.degree) left.appendChild(createElement("div", { className: "resume-edu-degree", textContent: edu.degree }));
        if (edu.college) left.appendChild(createElement("div", { className: "resume-edu-college", textContent: edu.college }));
        if (edu.university) left.appendChild(createElement("div", { className: "resume-edu-university", textContent: edu.university }));

        const right = createElement("div", { className: "resume-edu-right" });
        if (edu.startYear || edu.endYear) {
            right.appendChild(createElement("div", { className: "resume-edu-years", textContent: `${edu.startYear || "?"} – ${edu.endYear || "Present"}` }));
        }
        if (edu.grade) right.appendChild(createElement("div", { className: "resume-edu-grade", textContent: edu.grade }));
        if (edu.location) right.appendChild(createElement("div", { className: "resume-edu-location", textContent: edu.location }));

        item.appendChild(left);
        item.appendChild(right);
        DOM.resumeEducationList.appendChild(item);
    });
}

/**
 * Render skills badges in preview
 */
function renderResumeSkills() {
    const skills = AppState.resumeData.skills;

    if (skills.length === 0) {
        DOM.resumeSkillsSection.style.display = "none";
        return;
    }

    DOM.resumeSkillsSection.style.display = "block";
    DOM.resumeSkillsList.innerHTML = "";

    skills.forEach(skill => {
        DOM.resumeSkillsList.appendChild(
            createElement("span", { className: "resume-skill-badge", textContent: skill })
        );
    });
}

/**
 * Render projects section
 */
function renderResumeProjects() {
    const projects = AppState.resumeData.projects.filter(p => p.title || p.tech);

    if (projects.length === 0) {
        DOM.resumeProjectsSection.style.display = "none";
        return;
    }

    DOM.resumeProjectsSection.style.display = "block";
    DOM.resumeProjectsList.innerHTML = "";

    projects.forEach(proj => {
        const item = createElement("div", { className: "resume-project-item" });

        // Header row: title + duration
        const header = createElement("div", { className: "resume-project-header" });
        if (proj.title) header.appendChild(createElement("span", { className: "resume-project-title", textContent: proj.title }));
        if (proj.duration) header.appendChild(createElement("span", { className: "resume-project-duration", textContent: proj.duration }));
        item.appendChild(header);

        if (proj.tech) item.appendChild(createElement("div", { className: "resume-project-tech", textContent: proj.tech }));
        if (proj.description) item.appendChild(createElement("p", { className: "resume-project-desc", textContent: proj.description }));

        // Links
        const safeGithub = sanitizeURL(proj.github);
        const safeDemo = sanitizeURL(proj.demo);
        if (safeGithub || safeDemo) {
            const links = createElement("div", { className: "resume-project-links" });
            if (safeGithub) {
                const a = createElement("a", { href: safeGithub, target: "_blank", rel: "noopener noreferrer" });
                a.innerHTML = '<i class="fab fa-github"></i> GitHub';
                links.appendChild(a);
            }
            if (safeDemo) {
                const a = createElement("a", { href: safeDemo, target: "_blank", rel: "noopener noreferrer" });
                a.innerHTML = '<i class="fas fa-external-link-alt"></i> Live Demo';
                links.appendChild(a);
            }
            item.appendChild(links);
        }

        DOM.resumeProjectsList.appendChild(item);
    });
}

/**
 * Render experience section
 */
function renderResumeExperience() {
    const experience = AppState.resumeData.experience.filter(e => e.company || e.title);

    DOM.resumeExperienceSection.style.display = "block";
    DOM.resumeExperienceList.innerHTML = "";

    // If no experience at all and no entries exist, show "Fresher"
    if (experience.length === 0) {
        // Check if there are any empty entries in the form
        const formEntries = DOM.experienceEntries.querySelectorAll(".experience-entry");
        if (formEntries.length === 0) {
            // Only show fresher if user hasn't added any experience entries
            DOM.resumeExperienceSection.style.display = "none";
            return;
        }
        DOM.resumeExperienceList.appendChild(
            createElement("span", { className: "resume-fresher-badge", textContent: "Fresher — No professional experience yet" })
        );
        return;
    }

    experience.forEach(exp => {
        const item = createElement("div", { className: "resume-exp-item" });

        const header = createElement("div", { className: "resume-exp-header" });
        const left = createElement("div");
        if (exp.title) left.appendChild(createElement("div", { className: "resume-exp-title", textContent: exp.title }));
        if (exp.company) left.appendChild(createElement("div", { className: "resume-exp-company", textContent: exp.company }));
        header.appendChild(left);

        const right = createElement("div", { className: "resume-exp-right" });
        if (exp.duration) right.appendChild(createElement("div", { className: "resume-exp-duration", textContent: exp.duration }));
        if (exp.location) right.appendChild(createElement("div", { className: "resume-exp-location", textContent: exp.location }));
        header.appendChild(right);

        item.appendChild(header);
        if (exp.description) item.appendChild(createElement("p", { className: "resume-exp-desc", textContent: exp.description }));

        DOM.resumeExperienceList.appendChild(item);
    });
}

/**
 * Render certificates section
 */
function renderResumeCertificates() {
    const certs = AppState.resumeData.certificates.filter(c => c.name);

    if (certs.length === 0) {
        DOM.resumeCertificatesSection.style.display = "none";
        return;
    }

    DOM.resumeCertificatesSection.style.display = "block";
    DOM.resumeCertificatesList.innerHTML = "";

    certs.forEach(cert => {
        const item = createElement("div", { className: "resume-cert-item" });

        const left = createElement("div");
        left.appendChild(createElement("div", { className: "resume-cert-name", textContent: cert.name }));
        if (cert.org) left.appendChild(createElement("div", { className: "resume-cert-org", textContent: cert.org }));
        item.appendChild(left);

        const right = createElement("div", { className: "resume-cert-right" });
        if (cert.year) right.appendChild(createElement("div", { className: "resume-cert-year", textContent: cert.year }));
        if (cert.url) {
            const safeUrl = sanitizeURL(cert.url);
            if (safeUrl) {
                const link = createElement("a", { href: safeUrl, target: "_blank", rel: "noopener noreferrer", className: "resume-cert-link", textContent: "View Credential" });
                right.appendChild(link);
            }
        }
        item.appendChild(right);

        DOM.resumeCertificatesList.appendChild(item);
    });
}

/**
 * Render achievements section
 */
function renderResumeAchievements() {
    const achievements = AppState.resumeData.achievements.filter(a => a.title);

    if (achievements.length === 0) {
        DOM.resumeAchievementsSection.style.display = "none";
        return;
    }

    DOM.resumeAchievementsSection.style.display = "block";
    DOM.resumeAchievementsList.innerHTML = "";

    achievements.forEach(achv => {
        const li = createElement("li");
        let text = achv.title;
        if (achv.description) text += ` — ${achv.description}`;
        li.appendChild(document.createTextNode(text));
        if (achv.year) {
            li.appendChild(createElement("span", { className: "resume-achv-year", textContent: `(${achv.year})` }));
        }
        DOM.resumeAchievementsList.appendChild(li);
    });
}

/**
 * Render languages section
 */
function renderResumeLanguages() {
    const languages = AppState.resumeData.languages.filter(l => l.name);

    if (languages.length === 0) {
        DOM.resumeLanguagesSection.style.display = "none";
        return;
    }

    DOM.resumeLanguagesSection.style.display = "block";
    DOM.resumeLanguagesList.innerHTML = "";

    languages.forEach(lang => {
        const item = createElement("span", { className: "resume-lang-item" });
        item.appendChild(document.createTextNode(lang.name));
        if (lang.proficiency) {
            item.appendChild(createElement("span", { className: "resume-lang-proficiency", textContent: ` — ${lang.proficiency}` }));
        }
        DOM.resumeLanguagesList.appendChild(item);
    });
}

/**
 * Render hobbies section
 */
function renderResumeHobbies() {
    const hobbies = AppState.resumeData.hobbies;

    if (hobbies.length === 0) {
        DOM.resumeHobbiesSection.style.display = "none";
        return;
    }

    DOM.resumeHobbiesSection.style.display = "block";
    DOM.resumeHobbiesList.innerHTML = "";

    hobbies.forEach(hobby => {
        DOM.resumeHobbiesList.appendChild(
            createElement("span", { className: "resume-hobby-badge", textContent: hobby })
        );
    });
}

/**
 * Render references section
 */
function renderResumeReferences() {
    const refs = AppState.resumeData.references.filter(r => r.name);

    if (refs.length === 0) {
        DOM.resumeReferencesSection.style.display = "none";
        return;
    }

    DOM.resumeReferencesSection.style.display = "block";
    DOM.resumeReferencesList.innerHTML = "";

    refs.forEach(ref => {
        const item = createElement("div", { className: "resume-ref-item" });

        item.appendChild(createElement("div", { className: "resume-ref-name", textContent: ref.name }));

        const positionParts = [ref.position, ref.company].filter(Boolean).join(" at ");
        if (positionParts) {
            item.appendChild(createElement("div", { className: "resume-ref-position", textContent: positionParts }));
        }

        const contactDiv = createElement("div", { className: "resume-ref-contact" });
        if (ref.email) {
            const emailSpan = createElement("span");
            emailSpan.innerHTML = `<i class="fas fa-envelope"></i> `;
            emailSpan.appendChild(document.createTextNode(ref.email));
            contactDiv.appendChild(emailSpan);
        }
        if (ref.phone) {
            const phoneSpan = createElement("span");
            phoneSpan.innerHTML = `<i class="fas fa-phone"></i> `;
            phoneSpan.appendChild(document.createTextNode(ref.phone));
            contactDiv.appendChild(phoneSpan);
        }
        if (contactDiv.children.length > 0) {
            item.appendChild(contactDiv);
        }

        DOM.resumeReferencesList.appendChild(item);
    });
}

/**
 * Render custom sections
 */
function renderResumeCustom() {
    DOM.resumeCustomSections.innerHTML = "";
    const customs = AppState.resumeData.custom.filter(c => c.title && c.content);

    customs.forEach(section => {
        const sectionEl = createElement("section", { className: "resume-section resume-custom-section" });

        const title = createElement("h2", { className: "resume-section-title" });
        title.innerHTML = `<i class="fas fa-star"></i> `;
        title.appendChild(document.createTextNode(section.title));
        sectionEl.appendChild(title);

        sectionEl.appendChild(createElement("div", { className: "resume-divider" }));
        sectionEl.appendChild(createElement("p", { className: "resume-custom-content", textContent: section.content }));

        DOM.resumeCustomSections.appendChild(sectionEl);
    });
}


/* ==========================================================
   25. PROGRESS BAR
   ========================================================== */

/**
 * Calculate and update the progress bar
 */
function updateProgress() {
    const data = AppState.resumeData;

    // Define sections to track with their completion criteria
    const sections = [
        { key: "personal", completed: !!(data.personal.fullName && data.personal.email && data.personal.phone) },
        { key: "summary", completed: !!(data.summary && data.summary.length >= 40) },
        { key: "education", completed: data.education.some(e => e.degree && e.college) },
        { key: "skills", completed: data.skills.length >= 1 },
        { key: "projects", completed: data.projects.some(p => p.title && p.tech) },
        { key: "experience", completed: data.experience.some(e => e.company || e.title) },
    ];

    const completedCount = sections.filter(s => s.completed).length;
    const percentage = Math.round((completedCount / sections.length) * 100);

    // Update progress bar width
    DOM.progressBar.style.width = `${percentage}%`;
    DOM.progressText.textContent = `${percentage}% Complete`;

    // Update aria
    const progressSection = document.querySelector(".progress-section");
    if (progressSection) {
        progressSection.setAttribute("aria-valuenow", percentage);
    }

    // Update checklist items
    sections.forEach(section => {
        const item = DOM.progressChecklist.querySelector(`[data-section="${section.key}"]`);
        if (item) {
            if (section.completed) {
                item.classList.add("completed");
                item.querySelector("i").className = "fas fa-check-circle";
            } else {
                item.classList.remove("completed");
                item.querySelector("i").className = "far fa-circle";
            }
        }
    });
}


/* ==========================================================
   26. PDF DOWNLOAD
   ========================================================== */

/**
 * Generate and download resume as PDF using html2pdf.js
 */
function downloadResume() {
    // Verify html2pdf is loaded
    if (typeof html2pdf === "undefined") {
        showToast("PDF library is not loaded. Please check your internet connection and refresh.", "error");
        return;
    }

    // Check if there is content to download
    if (DOM.resumeContent.style.display === "none") {
        showToast("Please fill in some resume details before downloading.", "warning");
        return;
    }

    // Show spinner
    DOM.downloadSpinner.style.display = "flex";

    const resumeElement = DOM.resumePage;

    const options = {
        margin: 0,
        filename: `${AppState.resumeData.personal.fullName || "Resume"}_ResumeCraft.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Add a class for PDF-specific styling
    resumeElement.classList.add("pdf-generating");

    html2pdf()
        .set(options)
        .from(resumeElement)
        .save()
        .then(() => {
            DOM.downloadSpinner.style.display = "none";
            resumeElement.classList.remove("pdf-generating");
            showToast("Resume downloaded successfully!", "success");
        })
        .catch((err) => {
            console.error("PDF generation error:", err);
            DOM.downloadSpinner.style.display = "none";
            resumeElement.classList.remove("pdf-generating");
            showToast("Could not generate PDF. Please try again.", "error");
        });
}


/* ==========================================================
   27. PRINT RESUME
   ========================================================== */

/**
 * Open the browser print dialog (print styles hide everything but the resume)
 */
function printResume() {
    if (DOM.resumeContent.style.display === "none") {
        showToast("Please fill in some resume details before printing.", "warning");
        return;
    }
    window.print();
}


/* ==========================================================
   28. RESET RESUME
   ========================================================== */

/**
 * Show the reset confirmation modal
 */
function showResetModal() {
    DOM.resetModal.style.display = "flex";
}

/**
 * Hide the reset confirmation modal
 */
function hideResetModal() {
    DOM.resetModal.style.display = "none";
}

/**
 * Perform the actual reset — clear everything
 */
function resetResume() {
    hideResetModal();

    // Clear stored data
    clearLocalStorage();

    // Reset application state
    AppState.photoData = null;
    AppState.resumeData = {
        personal: {
            fullName: "", email: "", phone: "", address: "",
            city: "", state: "", country: "", dob: "",
            linkedin: "", github: "", portfolio: "",
        },
        summary: "",
        education: [],
        skills: [],
        projects: [],
        experience: [],
        certificates: [],
        achievements: [],
        languages: [],
        hobbies: [],
        references: [],
        custom: [],
    };

    // Clear all form fields
    populatePersonalFields();
    populateSummaryField();
    renderPhotoPreview();

    // Clear dynamic entries
    DOM.educationEntries.innerHTML = "";
    DOM.projectEntries.innerHTML = "";
    DOM.experienceEntries.innerHTML = "";
    DOM.certificateEntries.innerHTML = "";
    DOM.achievementEntries.innerHTML = "";
    DOM.languageEntries.innerHTML = "";
    DOM.referenceEntries.innerHTML = "";
    DOM.customEntries.innerHTML = "";

    // Clear badges
    renderSkillBadges();
    renderHobbyBadges();

    // Clear validation states
    document.querySelectorAll(".input-error, .input-success").forEach(el => {
        el.classList.remove("input-error", "input-success");
    });
    document.querySelectorAll(".error-msg").forEach(el => {
        el.textContent = "";
    });

    // Reset file input
    DOM.profilePhoto.value = "";

    // Update preview and progress
    updateResumePreview();
    updateProgress();

    showToast("Resume has been reset successfully.", "info");
}


/* ==========================================================
   29. EVENT LISTENERS
   ========================================================== */

function attachEventListeners() {
    // --- Theme ---
    DOM.themeToggle.addEventListener("click", toggleTheme);

    // --- Font Selector ---
    DOM.fontSelector.addEventListener("change", (e) => {
        applyFont(e.target.value);
        saveToLocalStorage();
        showToast(`Font changed to ${e.target.value}`, "info");
    });

    // --- Template Selector ---
    DOM.templateSelector.addEventListener("change", (e) => {
        applyTemplate(e.target.value);
        saveToLocalStorage();
        showToast(`Template changed to ${e.target.value}`, "info");
    });

    // --- Accent Color ---
    DOM.accentColorPicker.addEventListener("input", (e) => {
        applyAccentColor(e.target.value);
    });
    DOM.accentColorPicker.addEventListener("change", (e) => {
        applyAccentColor(e.target.value);
        saveToLocalStorage();
        showToast("Accent color updated!", "info");
    });

    // --- Photo Upload ---
    DOM.photoPreview.addEventListener("click", () => DOM.profilePhoto.click());
    DOM.profilePhoto.addEventListener("change", handlePhotoUpload);

    // --- Personal Fields (live update + validation) ---
    const personalInputs = [
        DOM.fullName, DOM.email, DOM.phone, DOM.address,
        DOM.city, DOM.state, DOM.country, DOM.dob,
        DOM.linkedin, DOM.github, DOM.portfolio,
    ];

    const debouncedPersonalUpdate = debounce(() => {
        collectPersonalData();
        validatePersonalFields();
        updateResumePreview();
        saveToLocalStorage();
        updateProgress();
    }, DEBOUNCE_DELAY);

    personalInputs.forEach(input => {
        input.addEventListener("input", debouncedPersonalUpdate);
        input.addEventListener("change", debouncedPersonalUpdate);
    });

    // --- Summary (live update + word counter) ---
    const debouncedSummaryUpdate = debounce(() => {
        collectSummaryData();
        updateResumePreview();
        saveToLocalStorage();
        updateProgress();
    }, DEBOUNCE_DELAY);

    DOM.summary.addEventListener("input", () => {
        updateSummaryCounter();
        debouncedSummaryUpdate();
    });

    // Validate summary on blur
    DOM.summary.addEventListener("blur", () => {
        const value = DOM.summary.value.trim();
        const errorEl = document.getElementById("error-summary");
        if (value && value.length < 40) {
            errorEl.textContent = "Summary should be at least 40 characters for a professional impression.";
        } else if (value && countWords(value) > 300) {
            errorEl.textContent = "Summary should not exceed 300 words.";
        } else {
            errorEl.textContent = "";
        }
    });

    // --- Add buttons for dynamic sections ---
    DOM.addEducationBtn.addEventListener("click", () => {
        addEducationEntry();
        collectEducationData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addProjectBtn.addEventListener("click", () => {
        addProjectEntry();
        collectProjectData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addExperienceBtn.addEventListener("click", () => {
        addExperienceEntry();
        collectExperienceData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addCertificateBtn.addEventListener("click", () => {
        addCertificateEntry();
        collectCertificateData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addAchievementBtn.addEventListener("click", () => {
        addAchievementEntry();
        collectAchievementData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addLanguageBtn.addEventListener("click", () => {
        addLanguageEntry();
        collectLanguageData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addReferenceBtn.addEventListener("click", () => {
        addReferenceEntry();
        collectReferenceData();
        updateResumePreview();
        saveToLocalStorage();
    });

    DOM.addCustomBtn.addEventListener("click", () => {
        addCustomEntry();
        collectCustomData();
        updateResumePreview();
        saveToLocalStorage();
    });

    // --- Skills ---
    DOM.addSkillBtn.addEventListener("click", () => addSkill());
    DOM.skillInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    });

    // --- Hobbies ---
    DOM.addHobbyBtn.addEventListener("click", () => addHobby());
    DOM.hobbyInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addHobby();
        }
    });

    // --- Download / Print / Reset ---
    DOM.downloadBtn.addEventListener("click", downloadResume);
    DOM.printBtn.addEventListener("click", printResume);
    DOM.resetBtn.addEventListener("click", showResetModal);

    // Mobile buttons
    DOM.mobileDownloadBtn.addEventListener("click", downloadResume);
    DOM.mobilePrintBtn.addEventListener("click", printResume);
    DOM.mobileResetBtn.addEventListener("click", showResetModal);

    // Modal
    DOM.resetConfirmBtn.addEventListener("click", resetResume);
    DOM.resetCancelBtn.addEventListener("click", hideResetModal);

    // Close modal on overlay click
    DOM.resetModal.addEventListener("click", (e) => {
        if (e.target === DOM.resetModal) hideResetModal();
    });

    // Close modal on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && DOM.resetModal.style.display === "flex") {
            hideResetModal();
        }
    });
}


/* ==========================================================
   30. INITIALIZATION
   ========================================================== */

/**
 * Initialize the entire application
 */
function initializeApp() {
    // Set footer year
    setFooterYear();

    // Load saved data from Local Storage
    loadFromLocalStorage();

    // Apply saved settings
    applyTheme(AppState.theme);
    applyFont(AppState.font);
    applyTemplate(AppState.template);
    applyAccentColor(AppState.accentColor);

    // Populate form fields with saved data
    populatePersonalFields();
    populateSummaryField();
    renderPhotoPreview();

    // Restore dynamic entries
    restoreDynamicEntries();

    // Restore badge lists
    renderSkillBadges();
    renderHobbyBadges();

    // Render the full preview
    updateResumePreview();

    // Update progress bar
    updateProgress();

    // Attach all event listeners
    attachEventListeners();
}

/**
 * Restore all dynamic entries from saved state
 */
function restoreDynamicEntries() {
    const data = AppState.resumeData;

    // Education
    if (data.education && data.education.length > 0) {
        data.education.forEach(edu => addEducationEntry(edu));
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        data.projects.forEach(proj => addProjectEntry(proj));
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        data.experience.forEach(exp => addExperienceEntry(exp));
    }

    // Certificates
    if (data.certificates && data.certificates.length > 0) {
        data.certificates.forEach(cert => addCertificateEntry(cert));
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach(achv => addAchievementEntry(achv));
    }

    // Languages
    if (data.languages && data.languages.length > 0) {
        data.languages.forEach(lang => addLanguageEntry(lang));
    }

    // References
    if (data.references && data.references.length > 0) {
        data.references.forEach(ref => addReferenceEntry(ref));
    }

    // Custom sections
    if (data.custom && data.custom.length > 0) {
        data.custom.forEach(section => addCustomEntry(section));
    }
}

// Launch the application when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
