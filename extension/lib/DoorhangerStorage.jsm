/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "NewsIndexedDB", "resource://pioneer-study-online-news-2/lib/NewsIndexedDB.jsm"
);

this.EXPORTED_SYMBOLS = ["DoorhangerStorage"];


this.DoorhangerStorage = {
  getStore() {
    return NewsIndexedDB.getStore("doorhanger");
  },

  async getStats(hostname) {
    return await this.getStore().get(hostname) || { timestamp: 0 };
  },

  async getTimestamp(hostname) {
    const stats = await this.get(hostname) || { timestamp: 0 };
    return stats.timestamp;
  },

  async setStats(hostname, neverAgain) {
    const data = {
      timestamp: Date.now(),
      neverAgain: !!neverAgain,
    };
    return this.getStore().put(data, hostname);
  },

  async unsetStats(hostname) {
    return this.getStore().delete(hostname);
  }
};
