/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-study-online-news-2/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "ActiveURIService", "resource://pioneer-study-online-news-2/lib/ActiveURIService.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "State", "resource://pioneer-study-online-news-2/lib/State.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "StudyAddonManager", "resource://pioneer-study-online-news-2/lib/StudyAddonManager.jsm"
);

this.EXPORTED_SYMBOLS = ["SurveyWatcher"];


this.SurveyWatcher = {
  startup() {
    ActiveURIService.addObserver(this);
  },

  endSurvey() {
    const state = State.load();
    state.promptsRemaining[state.phaseName] = 0;
    State.save(state);
  },

  async onFocusURI(data) {
    const isStudyInstalled = await StudyAddonManager.isInstalled();
    if (isStudyInstalled && data.uri && this.uriMatchesSurveyURL(data.uri)) {
      this.endSurvey();
    }
  },

  uriMatchesSurveyURL(uri) {
    const state = State.load();
    const { surveyURL } = Config.phases[state.phaseName];
    return uri.spec.startsWith(surveyURL);
  },

  observe(subject, topic, data) {
    switch (topic) {
      case "uriFocused":
        this.onFocusURI(data);
        break;
    }
  },
};
