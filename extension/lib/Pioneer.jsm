const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-study-online-news-2/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "PioneerUtils", "resource://pioneer-study-online-news-2/PioneerUtils.jsm"
);

const Pioneer = {
  startup() {
    this.utils = new PioneerUtils(Config);
  }
};

this.EXPORTED_SYMBOLS = ["Pioneer"];
