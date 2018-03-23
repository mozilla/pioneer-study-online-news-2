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
    if(data.uri && this.uriMatchesSurveyURL(data.uri)) {
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
