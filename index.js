"use strict";

const site = requireLib("site");

const {map} = site;

site.add(site.hosts.default, {
  "webapps": {
    "astroday": {
      "": map("index.htm"),
      "css": {
        "index.css": map("css/index.css")
      },
      "data": {
        "locations.js": map("data/locations.js")
      },
      "js": {
        "index.js": map("js/index.js"),
        "location.js": map("js/location.js"),
        "sidebar.js": map("js/sidebar.js"),
        "utils.js": map("js/utils.js")
      },
      "lib": {
        "astrolib": {
          "seasons.js": map("lib/astrolib/seasons.js"),
          "sun.js": map("lib/astrolib/sun.js"),
          "utils.js": map("lib/astrolib/utils.js")
        }
      }
    }
  }
});
