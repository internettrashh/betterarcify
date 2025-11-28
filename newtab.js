/**
 * New Tab Page - Spotlight Search Interface
 * 
 * Purpose: Custom new tab page that immediately activates the spotlight overlay
 * Uses the shared spotlight overlay system by importing it as a module
 */

import { SpotlightTabMode } from './spotlight/shared/search-types.js';

// Get space color from storage and apply it to background
async function applySpaceTheme() {
    try {
        const result = await chrome.storage.local.get(['spaces', 'activeSpaceId']);
        if (result.spaces && result.activeSpaceId) {
            const activeSpace = result.spaces.find(s => s.id === result.activeSpaceId);
            if (activeSpace && activeSpace.color) {
                const colorMap = {
                    'grey': ['#9CA3AF', '#6B7280'],
                    'blue': ['#60A5FA', '#3B82F6'],
                    'red': ['#F87171', '#EF4444'],
                    'yellow': ['#FBBF24', '#F59E0B'],
                    'green': ['#34D399', '#10B981'],
                    'pink': ['#F472B6', '#EC4899'],
                    'purple': ['#A78BFA', '#8B5CF6'],
                    'cyan': ['#22D3EE', '#06B6D4']
                };
                
                const colors = colorMap[activeSpace.color] || colorMap['grey'];
                document.documentElement.style.setProperty('--space-color-1', colors[0]);
                document.documentElement.style.setProperty('--space-color-2', colors[1]);
            }
        }
    } catch (error) {
        console.error('Error applying space theme:', error);
    }
}

// Initialize and activate spotlight overlay
async function init() {
    // Apply space theme to background
    await applySpaceTheme();
    
    // Set up context for spotlight overlay (same as background.js does for content script injection)
    window.arcifySpotlightTabMode = SpotlightTabMode.NEW_TAB;
    window.arcifyCurrentTabUrl = '';
    
    // Get current tab ID
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            window.arcifyCurrentTabId = tab.id;
        }
    } catch (error) {
        console.error('Error getting tab ID:', error);
    }
    
    // Import the overlay.js module - it will auto-activate based on window.arcifySpotlightTabMode
    try {
        await import('./spotlight/overlay.js');
        // The overlay.js checks for window.arcifySpotlightTabMode and auto-activates (see line 630-632)
    } catch (error) {
        console.error('Error loading spotlight overlay:', error);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
