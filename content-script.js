/**
 * x-link-replace - Content Script
 *
 * Replaces Twitter/X t.co short links with real URLs
 * extracted from link text content
 */

(function() {
  'use strict';

  // Track processed links to avoid duplicates
  const processedLinks = new WeakSet();

  // Configuration
  const DEBUG = false; // Set to true for development logging

  /**
   * Log helper - only logs when DEBUG is enabled
   */
  function log() {
    if (DEBUG) {
      console.log('[x-link-replace]', ...arguments);
    }
  }

  /**
   * Extract real URL from link's text content
   * @param {HTMLAnchorElement} link - The anchor element
   * @returns {string|null} - The extracted URL or null if invalid
   */
  function extractRealUrl(link) {
    // Get text content from all child nodes
    const children = link.childNodes;

    if (children.length === 0) {
      return null;
    }

    // Collect text from all child nodes
    let urlParts = [];
    children.forEach((node) => {
      let text = '';

      if (node.nodeType === Node.TEXT_NODE) {
        text = node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        text = node.textContent || '';
      } else {
        return;
      }

      if (text.trim()) {
        urlParts.push(text.trim());
      }
    });

    if (urlParts.length === 0) {
      return null;
    }

    // Join all parts
    let url = urlParts.join('');

    // Remove trailing ellipsis (… or ... or ...+)
    url = url.replace(/[…]+$/, '');
    url = url.replace(/\.\.\.+$/, '');
    url = url.replace(/\.\.\.\+$/, '');

    // Ensure URL starts with protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Basic URL validation
    try {
      new URL(url);
      return url;
    } catch (e) {
      return null;
    }
  }

  /**
   * Process a single link element
   * @param {HTMLAnchorElement} link - The anchor element to process
   */
  function processLink(link) {
    // Skip if already processed
    if (processedLinks.has(link)) {
      return;
    }

    // Skip if no href attribute
    if (!link.hasAttribute('href')) {
      return;
    }

    const originalHref = link.href;

    // Only process t.co links
    if (!originalHref.includes('t.co')) {
      return;
    }

    const realUrl = extractRealUrl(link);

    if (realUrl && realUrl !== originalHref) {
      link.href = realUrl;
      link.setAttribute('href', realUrl);
      processedLinks.add(link);
    }
  }

  /**
   * Process all links in a container
   * @param {Element} container - The container element
   */
  function processAllLinks(container) {
    const links = container.querySelectorAll('a[href*="t.co"]');
    links.forEach((link) => processLink(link));
  }

  /**
   * Initialize the link replacer
   */
  function init() {
    log('Content script initialized');

    // Process existing links on page load
    processAllLinks(document.body);

    // Create MutationObserver for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }

      if (shouldProcess) {
        requestAnimationFrame(() => {
          processAllLinks(document.body);
        });
      }
    });

    // Start observing - Twitter/X is an SPA, watch the entire body
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      log('Observer started on document.body');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
