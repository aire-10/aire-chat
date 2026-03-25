/* db.js: Client-side storage abstraction for Aire Chat */
const StorageDB = (() => {
  const STORAGE_KEY_PREFIX = "AIRE_DB_";

  function getLocal(key) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setLocal(key, value) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function removeLocal(key) {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  }

  function clearLocal() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  return {
    get: getLocal,
    set: setLocal,
    remove: removeLocal,
    clear: clearLocal,

    // Quick fallback helper for localStorage based project data.
    getAppData(key) {
      return getLocal(key) ?? (JSON.parse(localStorage.getItem(key) || "null"));
    },

    setAppData(key, value) {
      setLocal(key, value);
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
})();
