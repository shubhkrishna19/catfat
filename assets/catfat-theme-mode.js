(function() {
  var STORAGE_KEY = 'catfat-theme-mode';
  var root = document.documentElement;
  var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getSystemMode() {
    return mediaQuery && mediaQuery.matches ? 'dark' : 'light';
  }

  function getSavedMode() {
    if (!window.localStorage) return null;
    var saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  }

  function getDefaultMode(toggle) {
    return (toggle && toggle.getAttribute('data-default-mode')) || 'light';
  }

  function resolveMode(toggle) {
    var saved = getSavedMode();
    if (saved) return saved;
    var fallback = getDefaultMode(toggle);
    return fallback === 'system' ? getSystemMode() : fallback;
  }

  function syncToggle(toggle, mode) {
    var lightLabel = toggle.getAttribute('data-light-label') || 'Light';
    var darkLabel = toggle.getAttribute('data-dark-label') || 'Dark';
    var nextMode = mode === 'dark' ? 'light' : 'dark';
    var nextLabel = nextMode === 'dark' ? darkLabel : lightLabel;
    var actionText = 'Switch to ' + nextLabel.toLowerCase() + ' mode';

    toggle.dataset.currentMode = mode;
    toggle.classList.toggle('is-dark', mode === 'dark');
    toggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', actionText);
    toggle.setAttribute('title', actionText);
  }

  function applyMode(mode) {
    root.setAttribute('data-catfat-theme', mode);
    root.style.colorScheme = mode;
    document.querySelectorAll('[data-catfat-theme-toggle]').forEach(function(toggle) {
      syncToggle(toggle, mode);
    });
  }

  function persistMode(mode) {
    if (!window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }

  function bindToggle(toggle) {
    toggle.addEventListener('click', function() {
      var currentMode = root.getAttribute('data-catfat-theme') || resolveMode(toggle);
      var nextMode = currentMode === 'dark' ? 'light' : 'dark';
      persistMode(nextMode);
      applyMode(nextMode);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var toggles = document.querySelectorAll('[data-catfat-theme-toggle]');
    if (!toggles.length) return;

    var initialMode = resolveMode(toggles[0]);
    applyMode(initialMode);
    toggles.forEach(bindToggle);

    if (mediaQuery) {
      mediaQuery.addEventListener('change', function() {
        var saved = getSavedMode();
        if (saved) return;
        if (getDefaultMode(toggles[0]) !== 'system') return;
        applyMode(getSystemMode());
      });
    }
  });
})();