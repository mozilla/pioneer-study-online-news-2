/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
