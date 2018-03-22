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

    const mozDomains = await fetch("resource://pioneer-study-online-news-2/ranking-domains.json");
    domains = await mozDomains.json();

    this.trackedMozHosts = {};
    domains.forEach(d => {
      this.trackedMozHosts[d.domain] = d.mozRank;
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

  isMozTrackedURI(uri) {
    const hostname = this.getHostnameFromURI(uri);
    return Object.keys(this.trackedMozHosts).includes(hostname);
  },

  getMozRatingForURI(uri) {
    const hostname = this.getHostnameFromURI(uri);
    return this.trackedMozHosts[hostname];
  }
};
