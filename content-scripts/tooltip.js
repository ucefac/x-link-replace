/**
 * Link Tooltip - Content Script
 *
 * Displays a native tooltip showing the href value when hovering over any link
 */

(function() {
  'use strict';

  // Configuration
  const DEBUG = false;

  // Settings state
  let tooltipEnabled = true;

  /**
   * Log helper
   */
  function log() {
    if (DEBUG) {
      console.log('[link-tooltip]', ...arguments);
    }
  }

  /**
   * Load settings from chrome.storage
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get({
          tooltipEnabled: true
        }, (items) => {
          resolve(items);
        });
      } else {
        resolve({ tooltipEnabled: true });
      }
    });
  }

  /**
   * Apply settings
   */
  async function applySettings() {
    const settings = await loadSettings();
    tooltipEnabled = settings.tooltipEnabled;
    log('Settings applied:', settings);

    if (tooltipEnabled) {
      enableTooltip();
    } else {
      disableTooltip();
    }
  }

  /**
   * Add tooltip to a link
   * @param {HTMLAnchorElement} link
   */
  function addTooltipToLink(link) {
    const href = link.getAttribute('href');
    if (href && !link.hasAttribute('data-tooltip-added')) {
      link.setAttribute('title', href);
      link.setAttribute('data-tooltip-added', 'true');
      log('Tooltip added to link:', href);
    }
  }

  /**
   * Remove tooltip from a link
   * @param {HTMLAnchorElement} link
   */
  function removeTooltipFromLink(link) {
    if (link.hasAttribute('data-tooltip-added')) {
      link.removeAttribute('title');
      link.removeAttribute('data-tooltip-added');
      log('Tooltip removed from link');
    }
  }

  /**
   * Add tooltips to all links
   */
  function addTooltipToAllLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(addTooltipToLink);
  }

  /**
   * Remove tooltips from all links
   */
  function removeTooltipFromAllLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(removeTooltipFromLink);
  }

  /**
   * Enable tooltip functionality
   */
  function enableTooltip() {
    addTooltipToAllLinks();
    startObserver();
    log('Tooltip enabled');
  }

  /**
   * Disable tooltip functionality
   */
  function disableTooltip() {
    removeTooltipFromAllLinks();
    stopObserver();
    log('Tooltip disabled');
  }

  /**
   * MutationObserver for dynamic content
   */
  let observer = null;

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      if (!tooltipEnabled) return;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'A' && node.hasAttribute('href')) {
                addTooltipToLink(node);
              }
              node.querySelectorAll('a[href]').forEach(addTooltipToLink);
            }
          });
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /**
   * Handle messages from popup/background
   */
  function setupMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SETTINGS_UPDATED') {
          tooltipEnabled = message.settings.tooltipEnabled;
          if (tooltipEnabled) {
            enableTooltip();
          } else {
            disableTooltip();
          }
        }
        sendResponse({ success: true });
      });
    }
  }

  /**
   * Initialize
   */
  async function init() {
    log('Link tooltip script initialized');
    await applySettings();
    setupMessageListener();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
