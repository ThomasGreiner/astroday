"use strict";

import * as seasons from "../lib/astrolib/seasons.js";
import * as sun from "../lib/astrolib/sun.js";

const $ = (selector) => document.querySelector(selector);

function toRad(value) {
  return Math.PI * 2 * value;
}

function toCoord(value, radius = 1) {
  let rad = toRad(value);
  return {
    value,
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad )
  };
}

function setPath(path, from, to) {
  let share = 0;
  if (to.value > from.value) {
    share = to.value - from.value;
  } else {
    share += to.value + (1 - from.value);
  }
  let isLarge = (share > 0.5) ? 1 : 0;
  path.setAttribute("d", `M${from.x} ${from.y} A 1 1 0 ${isLarge} 1 ${to.x} ${to.y} L 0 0`);
}

function addHourIndicator(hour) {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let coord1 = toCoord(hour / 24, 0.9);
  line.setAttribute("x1", coord1.x);
  line.setAttribute("y1", coord1.y);
  let coord2 = toCoord(hour / 24, 0.95);
  line.setAttribute("x2", coord2.x);
  line.setAttribute("y2", coord2.y);
  $("svg .labels").appendChild(line);
}

for (let i = 0; i < 24; i++) {
  addHourIndicator(i);
}

function render(lat, lon) {
  function toPercent(date) {
    return (date - dateStart) / totalTime;
  }
  
  let dateNow = new Date();
  let hours = dateNow.getHours();
  let minutes = dateNow.getMinutes();
  console.log("time", hours, minutes);
  
  let dateStart = new Date();
  dateStart.setHours(0, 0, 0);
  let dateEnd = new Date();
  dateEnd.setHours(23, 59, 59);
  let totalTime = dateEnd - dateStart;
  
  // Sun
  let now = toCoord(toPercent(dateNow), 0.85);
  let dawnA = toCoord(toPercent(sun.getAstronomicalDawn(lat, lon)));
  let dawnN = toCoord(toPercent(sun.getNauticalDawn(lat, lon)));
  let dawnC = toCoord(toPercent(sun.getCivilDawn(lat, lon)));
  let sunrise = toCoord(toPercent(sun.getSunrise(lat, lon)));
  let sunset = toCoord(toPercent(sun.getSunset(lat, lon)));
  let duskC = toCoord(toPercent(sun.getCivilDusk(lat, lon)));
  let duskN = toCoord(toPercent(sun.getNauticalDusk(lat, lon)));
  let duskA = toCoord(toPercent(sun.getAstronomicalDusk(lat, lon)));
  console.log("now", now.value);
  console.log("dawn", dawnA.value, dawnN.value, dawnC.value);
  console.log("sunrise", sunrise.value);
  console.log("sunset", sunset.value);
  console.log("dusk", duskC.value, duskN.value, duskA.value);
  
  // Determine current phase independent of their order
  let events = [
    now,
    dawnA, dawnN, dawnC,
    sunrise, sunset,
    duskC, duskN, duskA
  ];
  events = events
    .filter((event) => !!event.value)
    .sort((a, b) => a.value % 1 - b.value % 1);
  
  let eventPrev;
  let idxNow = events.indexOf(now);
  if (idxNow === 0) {
    eventPrev = events[events.length - 1];
  } else {
    eventPrev = events[idxNow - 1];
  }
  
  let phaseNow;
  switch (eventPrev) {
    case dawnA:
    case duskN:
      // Skip if there's no astronomical twilight
      phaseNow = (duskA.value) ? "twilight-astronomical" : "night";
      break;
    case dawnN:
    case duskC:
      phaseNow = "twilight-nautical";
      break;
    case dawnC:
    case sunset:
      phaseNow = "twilight-civil";
      break;
    case sunrise:
      phaseNow = "day";
      break;
    case duskA:
      phaseNow = "night";
  }
  document.body.dataset.phase = phaseNow;
  
  // Phases
  if (dawnA.value) {
    setPath($(".dawn.astronomical"), dawnA, dawnN);
  } else {
    // Skip if there's no astronomical twilight
    dawnA = dawnN;
  }
  setPath($(".dawn.nautical"), dawnN, dawnC);
  setPath($(".dawn.civil"), dawnC, sunrise);
  setPath($(".day"), sunrise, sunset);
  setPath($(".dusk.civil"), sunset, duskC);
  setPath($(".dusk.nautical"), duskC, duskN);
  if (duskA.value) {
    setPath($(".dusk.astronomical"), duskN, duskA);
  } else {
    // Skip if there's no astronomical twilight
    duskA = duskN;
  }
  setPath($(".night"), duskA, dawnA);
  
  // Seasons
  let yearNow = dateNow.getFullYear();
  let spring = seasons.getVernalEquinox(yearNow);
  let summer = seasons.getSummerSolstice(yearNow, false);
  let autumn = seasons.getAutumnalEquinox(yearNow);
  let winter = seasons.getWinterSolstice(yearNow, false);
  console.log("spring", spring);
  console.log("summer", summer);
  console.log("autumn", autumn);
  console.log("winter", winter);
  
  // Now
  $(".now").setAttribute("transform", `rotate(${now.value * 360})`);
}

function onInterval() {
  navigator.geolocation.getCurrentPosition((position) => {
    let {coords} = position;
    let lat = coords.latitude;
    let lon = coords.longitude;
    console.log("coords", lat, lon);
    
    render(lat, lon);
  });
}

setInterval(onInterval, 60 * 1000);
onInterval();
