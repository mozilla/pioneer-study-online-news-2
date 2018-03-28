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
  this, "NewsIndexedDB", "resource://pioneer-study-online-news-2/lib/NewsIndexedDB.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Pioneer", "resource://pioneer-study-online-news-2/lib/Pioneer.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "PrefUtils", "resource://pioneer-study-online-news-2/lib/PrefUtils.jsm"
);

this.EXPORTED_SYMBOLS = ["LogStorage"];


this.LogStorage = {
  getStore() {
    return NewsIndexedDB.getStore("log");
  },

  clear() {
    return this.getStore().clear();
  },

  getAll() {
    return this.getStore().getAll();
  },

  async put(ping) {
    return this.getStore().put(ping);
  },
};
