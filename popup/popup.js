/**
 * Popup Settings Page Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tooltipEnabledCheckbox = document.getElementById('tooltipEnabled');
  const linkReplaceEnabledCheckbox = document.getElementById('linkReplaceEnabled');
  const versionSpan = document.getElementById('version');

  // Get manifest version using chrome.runtime.getManifest()
  const manifest = chrome.runtime.getManifest();
  versionSpan.textContent = manifest.version;

  // Load saved settings
  const settings = await loadSettings();
  tooltipEnabledCheckbox.checked = settings.tooltipEnabled;
  linkReplaceEnabledCheckbox.checked = settings.linkReplaceEnabled;

  // Save settings on change
  tooltipEnabledCheckbox.addEventListener('change', async () => {
    await saveSettings({
      tooltipEnabled: tooltipEnabledCheckbox.checked,
      linkReplaceEnabled: linkReplaceEnabledCheckbox.checked
    });
  });

  linkReplaceEnabledCheckbox.addEventListener('change', async () => {
    await saveSettings({
      tooltipEnabled: tooltipEnabledCheckbox.checked,
      linkReplaceEnabled: linkReplaceEnabledCheckbox.checked
    });
  });
});

/**
 * Load settings from chrome.storage
 * @returns {Promise<{tooltipEnabled: boolean, linkReplaceEnabled: boolean}>}
 */
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      tooltipEnabled: true,
      linkReplaceEnabled: true
    }, (items) => {
      resolve(items);
    });
  });
}

/**
 * Save settings to chrome.storage
 * @param {{tooltipEnabled: boolean, linkReplaceEnabled: boolean}} settings
 */
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, () => {
      resolve();
      // Notify content scripts about settings change
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            settings: settings
          }, () => {
            // Ignore errors for tabs that don't have the content script
          });
        });
      });
    });
  });
}
