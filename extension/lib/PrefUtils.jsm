/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");

const PrefUtils = {
  setLongPref(name, value) {
    return Services.prefs.setCharPref(name, `${value}`);
  },

  getLongPref(name, defaultValue) {
    return parseInt(Services.prefs.getCharPref(name, `${defaultValue}`), 10);
  }
};

this.EXPORTED_SYMBOLS = ["PrefUtils"];
