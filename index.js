"use strict";

const site = requireLib("site");

const {map} = site;

site.add(site.hosts.default, {
  "webapps": {
    "astroday": {
      "": map("index.htm"),
      "css": {
        "index.css": map("css/index.css"),
        "start.css": map("css/start.css")
      },
      "data": {
        "locations.js": map("data/locations.js")
      },
      "img": {
        "app192.png": map("img/app192.png"),
        "app512.png": map("img/app512.png")
      },
      "js": {
        "emitter.js": map("js/emitter.js"),
        "index.js": map("js/index.js"),
        "location.js": map("js/location.js"),
        "settings.js": map("js/settings.js"),
        "sidebar.js": map("js/sidebar.js"),
        "start.js": map("js/start.js"),
        "utils.js": map("js/utils.js")
      },
      "lib": {
        "astrolib": {
          "seasons.js": map("lib/astrolib/seasons.js"),
          "sun.js": map("lib/astrolib/sun.js"),
          "utils.js": map("lib/astrolib/utils.js")
        }
      },
      "manifest.json": map("manifest.json"),
      "start": map("start.htm")
    }
  }
});
