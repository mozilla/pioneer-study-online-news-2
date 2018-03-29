/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-study-online-news-2/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "LogStorage", "resource://pioneer-study-online-news-2/lib/LogStorage.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "ActiveURIService", "resource://pioneer-study-online-news-2/lib/ActiveURIService.jsm",
);
XPCOMUtils.defineLazyServiceGetter(
  this, "IdleService", "@mozilla.org/widget/idleservice;1", "nsIIdleService",
);

this.EXPORTED_SYMBOLS = ["DwellTime"];

const ACCEPTED_SCHEMES = new Set(["http", "https"]);
const STUDY_BRANCH_PREF = "extensions.pioneer-online-news-2.studyBranch";


this.DwellTime = {
  dwellStartTime: null, // Timestamp when the idle state or focused host last changed
  focusedUrl: null, // URL of the currently-focused URI

  startup() {
    IdleService.addIdleObserver(this, Config.idleDelaySeconds);
    ActiveURIService.addObserver(this);
    this.onFocusURI(ActiveURIService.focusedURI);
  },

  shutdown() {
    ActiveURIService.removeObserver(this);

    try {
      IdleService.removeIdleObserver(this, Config.idleDelaySeconds);
    } catch (err) {
      // It must already be removed!
    }
  },

  /**
   * Called before the idle state or the currently focused URI changes. Logs the
   * dwell time on the previous hostname.
   */
  logPreviousDwell(idle_tag, now) {
    // dwellStartTime is null on startup
    // focusedUrl is null if the user was looking at a non-browser window
    // If this is the case, we don't log activity.
    if (!this.focusedUrl) {
      return;
    }

    const unixTs = Math.round(now / 1000);
    const branchName = Services.prefs.getCharPref(STUDY_BRANCH_PREF, "");

    const obj = {
      url: this.focusedUrl,
      details: idle_tag,
      timestamp: unixTs,
      branch: branchName,
    };

    LogStorage.put(obj);
  },

  onFocusURI(data) {
    const uri = data.uri;
    const now = Date.now();
    this.logPreviousDwell("focus-end", now);

    let url = null;
    if (uri && ACCEPTED_SCHEMES.has(uri.scheme)) {
      url = uri.spec;
    }

    this.focusedUrl = url;
    this.logPreviousDwell("focus-start", now);
  },

  onIdle() {
    const now = Date.now();
    this.logPreviousDwell("idle-start", now);
  },

  onIdleBack() {
    const now = Date.now();
    this.logPreviousDwell("idle-end", now);
  },

  observe(subject, topic, data) {
    switch (topic) {
      case "uriFocused":
        this.onFocusURI(data);
        break;
      case "idle":
        this.onIdle();
        break;
      case "active":
        this.onIdleBack();
        break;
    }
  }
};
