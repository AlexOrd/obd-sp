/**
 * Main JavaScript file for OBD-SP project
 * Additional functionality for the main page
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('OBD-SP Education System v1.0 loaded');

    // Add cursor effect to main title if needed
    addCursorEffect();

    // Track lecture clicks
    trackLectureClicks();
});

/**
 * Add blinking cursor effect to specific elements
 */
function addCursorEffect() {
    const titles = document.querySelectorAll('.cursor');
    titles.forEach(title => {
        // Cursor effect is handled via CSS
        // This function can be extended for additional effects
    });
}

/**
 * Track when users click on lectures
 */
function trackLectureClicks() {
    const lectureLinks = document.querySelectorAll('.list-group-item:not(.disabled)');

    lectureLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const lectureName = this.querySelector('h3').textContent;
            console.log(`Opening lecture: ${lectureName}`);

            // You can add analytics or other tracking here
        });
    });
}

/**
 * Future: Add search functionality
 */
function searchLectures(query) {
    // To be implemented
    console.log(`Searching for: ${query}`);
}

/**
 * Future: Add progress tracking
 */
function trackProgress() {
    // To be implemented
    // Could store in localStorage which lectures have been viewed
}
