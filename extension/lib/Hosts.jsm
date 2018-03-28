/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { utils: Cu } = Components;
Cu.importGlobalProperties(["fetch"]);

this.EXPORTED_SYMBOLS = ["Hosts"];

const Hosts = {
  async startup() {
    const biasDomains = await fetch("resource://pioneer-study-online-news-2/bias-domains.json");
    let domains = await biasDomains.json();

    this.trackedBiasHosts = {};
    domains.forEach(d => {
      this.trackedBiasHosts[d.domain] = d.avgAlign;
    });

    const whoisDomains = await fetch("resource://pioneer-study-online-news-2/whois-domains.json");
    domains = await whoisDomains.json();

    this.trackedWhoisHosts = {};
    domains.forEach(d => {
      this.trackedWhoisHosts[d.domain] = d.date;
    });
  },

  getHostnameFromURI(uri) {
    return uri ? uri.host : null;
  },

  isBiasTrackedURI(uri) {
    const hostname = this.getHostnameFromURI(uri);
    return Object.keys(this.trackedBiasHosts).includes(hostname);
  },

  getBiasRatingForURI(uri) {
    const hostname = this.getHostnameFromURI(uri);
    return this.trackedBiasHosts[hostname];
  },

  getWhoisTrackedDomain(uri) {
    let hostname = this.getHostnameFromURI(uri);

    while (hostname.indexOf(".") > -1) {
      if (Object.keys(this.trackedWhoisHosts).includes(hostname)) {
        return hostname;
      }
      const parts = hostname.split(".");
      hostname = parts.slice(1).join(".");
    }

    return null;
  },

  isWhoisTrackedURI(uri) {
    return !!this.getWhoisTrackedDomain(uri);
  },

  getWhoisDateForURI(uri) {
    const domain = this.getWhoisTrackedDomain(uri);
    return this.trackedWhoisHosts[domain];
  }
};
