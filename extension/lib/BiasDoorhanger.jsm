/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-study-online-news-2/Config.jsm",
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Panels", "resource://pioneer-study-online-news-2/lib/Panels.jsm",
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Hosts", "resource://pioneer-study-online-news-2/lib/Hosts.jsm",
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Phases", "resource://pioneer-study-online-news-2/lib/Phases.jsm",
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Pioneer", "resource://pioneer-study-online-news-2/lib/Pioneer.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "DoorhangerStorage", "resource://pioneer-study-online-news-2/lib/DoorhangerStorage.jsm"
);

const DOORHANGER_URL = "resource://pioneer-study-online-news-2/content/doorhanger/doorhanger-bias.html";
const FRAME_SCRIPT_URL = "resource://pioneer-study-online-news-2/content/doorhanger/doorhanger-bias.js";
const LEARN_MORE_URL = "chrome://pioneer-study-online-news-2/content/learn-more.html";
const STUDY_BRANCH_PREF = "extensions.pioneer-online-news-2.studyBranch";

const MESSAGES = {
  DISMISS: "PioneerOnlineNews::dismiss",
  LEARN_MORE: "PioneerOnlineNews::learn-more",
};


class BiasDoorhanger {
  constructor(browserWindow) {
    this.browserWindow = browserWindow;
    this.panel = Panels.create(browserWindow, "online-news-bias-panel", DOORHANGER_URL);
    this.panelBrowser = Panels.getEmbeddedBrowser(this.panel);

    const mm = this.panelBrowser.messageManager;
    const self = this;

    Object.values(MESSAGES).forEach(message => {
      mm.addMessageListener(message, self);
    });

    mm.loadFrameScript(`${FRAME_SCRIPT_URL}?${Math.random()}`, false);
    mm.sendAsyncMessage("PioneerOnlineNews::load", {});
  }

  show(anchor) {
    Panels.ensureStyleSheetsLoaded();
    const document = this.browserWindow.window.document;
    if (!anchor) {
      const urlBar = document.getElementById("urlbar"); // Address bar
      const burgerButton = document.getElementById("PanelUI-menu-button"); // Hamburger button
      anchor = urlBar || burgerButton;
    }
    this.panelBrowser.messageManager.sendAsyncMessage("PioneerOnlineNews::update", {
      rating: Hosts.getBiasRatingForURI(this.focusedURI)
    });
    this.panel.openPopup(anchor, "bottomleft topleft", 16, -6, false, false);
  }

  hide() {
    if (this.panel && this.panel.hidePopup) {
      this.panel.hidePopup();
    }
  }

  hideForever() {
    const hostname = Hosts.getHostnameFromURI(this.focusedURI);
    DoorhangerStorage.setStats(hostname, true);
    this.hide();
  }

  async showLearnMore() {
    const hostname = Hosts.getHostnameFromURI(this.focusedURI);

    const browser = this.browserWindow.gBrowser;
    browser.selectedTab = browser.addTab(LEARN_MORE_URL);
    this.hide();

    // Unset the last shown timestamp so that the doorhanger shows again
    // when returning to the original tab.
    await DoorhangerStorage.unsetStats(hostname);
  }

  logInteraction(details) {
    const entry = {
      url: this.focusedURI.spec,
      timestamp: Math.round(Date.now() / 1000),
      details,
    };
    Pioneer.utils.submitEncryptedPing("online-news-log", 1, {entries: [entry]});
  }

  onDismiss() {
    this.logInteraction("dismiss");
    this.hideForever();
  }

  receiveMessage(message) {
    switch (message.name) {
      case MESSAGES.LEARN_MORE:
        this.showLearnMore();
        break;

      case MESSAGES.DISMISS:
        this.onDismiss();
        break;

      default:
        break;
    }
  }

  async onFocusURI(data) {
    if (data.window === this.browserWindow && data.uri) {
      this.focusedURI = data.uri;

      const isTracked = Hosts.isBiasTrackedURI(data.uri);
      const hostname = Hosts.getHostnameFromURI(data.uri);
      const isTreatmentPhase = Phases.getCurrentPhase().treatment;

      const stats = await DoorhangerStorage.getStats(hostname);
      const timeSinceShown = Date.now() - stats.timestamp;
      const hiddenTooQuickly = timeSinceShown < 1000;
      const enoughTimePassed = timeSinceShown > Config.showDoorhangerInterval;
      const shouldShow = !stats.neverAgain && (hiddenTooQuickly || enoughTimePassed);

      const branchName = Services.prefs.getCharPref(STUDY_BRANCH_PREF, "");
      let branch = Config.branches.find(b => b.name === branchName);
      if (!branch) {
        branch = await Pioneer.utils.chooseBranch();
        Services.prefs.setCharPref(STUDY_BRANCH_PREF, branch.name);
      }
      const inTreatmentBranch = branch.showDoorhanger === "bias";

      if (hostname && isTreatmentPhase && isTracked && shouldShow && inTreatmentBranch) {
        DoorhangerStorage.setStats(hostname);
        this.show();
      } else {
        this.hide();
      }
    }
  }

  observe(subject, topic, data) {
    switch (topic) {
      case "uriFocused":
        this.onFocusURI(data);
        break;
    }
  }
}

this.EXPORTED_SYMBOLS = ["BiasDoorhanger"];
