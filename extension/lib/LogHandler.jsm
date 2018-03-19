/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Timer.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this, "Config", "resource://pioneer-study-online-news-2/Config.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "LogStorage", "resource://pioneer-study-online-news-2/lib/LogStorage.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "Pioneer", "resource://pioneer-study-online-news-2/lib/Pioneer.jsm"
);
XPCOMUtils.defineLazyModuleGetter(
  this, "PrefUtils", "resource://pioneer-study-online-news-2/lib/PrefUtils.jsm"
);

this.EXPORTED_SYMBOLS = ["LogHandler"];

const UPLOAD_DATE_PREF = "extensions.pioneer-online-news-2.lastLogUploadDate";
const UPLOAD_LIMIT = 400000;

let padding = 0.95;


this.LogHandler = {
  startup() {
    this.uploadPings();
    setInterval(this.uploadPings.bind(this), Config.logUploadAttemptInterval)
  },

  async uploadPings() {
    // upload ping dataset at the most once a day
    let entries = await LogStorage.getAll();
    const lastUploadDate = PrefUtils.getLongPref(UPLOAD_DATE_PREF, 0);
    const timesinceLastUpload = Date.now() - lastUploadDate;

    if (timesinceLastUpload > Config.logSubmissionInterval) {
      let payload = { entries };
      const entriesPingSize = await Pioneer.utils.getEncryptedPingSize(
        "online-news-log", 1, payload
      );

      if (entriesPingSize < UPLOAD_LIMIT) {
        // If the ping is small enough, just submit it directly
        await Pioneer.utils.submitEncryptedPing("online-news-log", 1, payload);
        PrefUtils.setLongPref(UPLOAD_DATE_PREF, Date.now());
      } else {
        // Otherwise, break it into batches below the minimum size
        const reduceRatio = UPLOAD_LIMIT / entriesPingSize;
        const originalEntriesLength = entries.length;
        let batch = [];

        while (entries.length > 0) {
          const batchSize = Math.floor(originalEntriesLength * reduceRatio * padding);
          if (batchSize < 1) {
            throw new Error('could not submit batch of any size');
          }

          batch = entries.splice(0, batchSize);
          payload = { entries: batch };
          const batchPingSize = await Pioneer.utils.getEncryptedPingSize(
            "online-news-log", 1, payload
          );

          if (batchPingSize >= UPLOAD_LIMIT) {
            // not small enough, put the batch back in the pool,
            // reduce the batch size and try again
            padding -= 0.05;
            entries = batch.concat(entries);
            continue;
          }

          await Pioneer.utils.submitEncryptedPing("online-news-log", 1, payload);
        }

        PrefUtils.setLongPref(UPLOAD_DATE_PREF, Date.now());

        // Delete the keys that were uploaded
        const lastEntry = batch.pop();
        if (lastEntry) {
          const keys = await LogStorage.getAllKeys();
          for (const key of keys) {
            if (key <= lastEntry.timestamp) {
              LogStorage.delete(key);
            } else {
              break;
            }
          }
        }
      }
    }
  },
};
