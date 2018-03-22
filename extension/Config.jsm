const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const EXPORTED_SYMBOLS = ["Config"];

const TELEMETRY_ENV_PREF = "extensions.pioneer-online-news-2.telemetryEnv";
const UPDATE_TIMER_PREF = "extensions.pioneer-online-news-2.updateTimerInterval";
const DOORHANGER_INTERVAL_PREF = "extensions.pioneer-online-news-2.showDoorhangerInterval";
const LOG_INTERVAL_PREF = "extensions.pioneer-online-news-2.logSubmissionInterval";
const PRETREATMENT_DURATION_PREF = "extensions.pioneer-online-news-2.preTreatmentDuration";
const TREATMENT_DURATION_PREF = "extensions.pioneer-online-news-2.treatmentDuration";
const POSTTREATMENT_DURATION_PREF = "extensions.pioneer-online-news-2.postTreatmentDuration";
const POSTSTUDY_DURATION_PREF = "extensions.pioneer-online-news-2.postStudyDuration";
const IDLE_DELAY_PREF = "extensions.pioneer-online-news-2.idleDelaySeconds";
const LOG_UPLOAD_ATTEMPT_PREF = "extensions.pioneer-online-news-2.logUploadAttemptInterval";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const Config = {
  addonId: "online-news@pioneer.mozilla.org",
  studyName: "online-news",
  branches: [
    { name: "control", weight: 1 },
    { name: "treatment-bias", weight: 1, showDoorhanger: "bias" },
    { name: "treatment-ranking", weight: 1, showDoorhanger: "ranking" },
  ],
  telemetryEnv: Services.prefs.getCharPref(TELEMETRY_ENV_PREF, "prod"),

  updateTimerInterval: Services.prefs.getIntPref(UPDATE_TIMER_PREF, 6 * HOUR),
  showDoorhangerInterval: Services.prefs.getIntPref(DOORHANGER_INTERVAL_PREF, 1 * DAY),
  logSubmissionInterval: Services.prefs.getIntPref(LOG_INTERVAL_PREF, 3 * HOUR),
  logUploadAttemptInterval: Services.prefs.getIntPref(LOG_UPLOAD_ATTEMPT_PREF, 30 * MINUTE),

  // Note: This is set in seconds not milliseconds
  idleDelaySeconds: Services.prefs.getIntPref(IDLE_DELAY_PREF, 5),

  /**
   * @typedef {Object} Phase
   * @property {number?} duration
   *    Time before automatically transitioning to the next phase, in
   *    milliseconds. If null or not specified, no automatic
   *    transition will occur. Set to 0 to show the postUrl
   *    immediately.
   * @property {string?} next
   *    Optional. Phase to transition to next. If null or not
   *    specified, no automatic transition will occur.
   * @property {string?} surveyURL
   *    Optional. Url of a page tied to this phase. If specified, at
   *    the start of the phase, a prompt to view this page will be
   *    shown. Will be repeated one a day, up to promptRepeat times.
   * @property {number?} promptRepeat
   *    Optional. Number of times to prompt the user to view the
   *    surveyURL. Defaults to 3.
   * @property {boolean?} surveyOnly
   *    Once a survey has been given to the user, go to the next
   *    phase, regardless of the time spend.
   * @property {boolean?} lastPhase
   *    Optional. If true, upon reaching this state the study will end.
   * @property {boolean?} treatment
   *    Optional. If the treatment should be shown during this phase.
   */

  firstPhase: "preTreatment",

  phases: {
    preTreatment: {
      duration: Services.prefs.getIntPref(PRETREATMENT_DURATION_PREF, 1 * WEEK),
      next: "treatment",
      surveyURL: "https://qsurvey.mozilla.com/s3/pioneer-1",
    },

    treatment: {
      duration: Services.prefs.getIntPref(TREATMENT_DURATION_PREF, 1 * WEEK),
      next: "postTreatment",
      treatment: true,
    },

    postTreatment: {
      duration: Services.prefs.getIntPref(POSTTREATMENT_DURATION_PREF, 1 * WEEK),
      next: "postStudy",
    },

    postStudy: {
      duration: Services.prefs.getIntPref(POSTSTUDY_DURATION_PREF, 1 * WEEK),
      surveyOnly: true,
      next: "studyEnd",
      surveyURL: "https://qsurvey.mozilla.com/s3/pioneer-2",
    },

    studyEnd: {
      lastPhase: true,
    }
  }
};
