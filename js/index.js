"use strict";

import * as seasons from "../lib/astrolib/seasons.js";
import * as sun from "../lib/astrolib/sun.js";
import * as location from "./location.js";
import {$} from "./utils.js";

const DEBUG = false;

function log(...args)
{
  if (!DEBUG)
    return;
  
  console.log(...args);
}

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

function setPath(path, from, to, radius = 1) {
  if (!from.value && !to.value) {
    path.removeAttribute("d");
    return;
  }
  
  let share = 0;
  if (to.value > from.value) {
    share = to.value - from.value;
  } else {
    share += to.value + (1 - from.value);
  }
  let isLarge = (share > 0.5) ? 1 : 0;
  path.setAttribute("d", `M${from.x} ${from.y} A ${radius} ${radius} 0 ${isLarge} 1 ${to.x} ${to.y} L 0 0`);
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

function getPrevious(current, items) {
  items = [current, ...items]
    .filter((item) => !!item.value)
    .sort((a, b) => a.value % 1 - b.value % 1);
  
  let prev;
  let idx = items.indexOf(current);
  if (idx === 0) {
    prev = items[items.length - 1];
  } else {
    prev = items[idx - 1];
  }
  return prev;
}

// Percentage can't be calculated based on start and end of day
// or otherwise it will be wrong on leap days
function perDay(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return (hours * 60 + minutes) / (24 * 60);
}

function perYear(date) {
  let dateNow = new Date();
  let year = dateNow.getFullYear();
  let dateStart = new Date(year, 0, 1);
  let dateEnd = new Date(year + 1, 0, 1) - 1;
  let totalTime = dateEnd - dateStart;
  
  return (date - dateStart) / totalTime;
}

function render(phases, seasons, seasonEdges) {
  let dateNow = new Date();
  let hours = dateNow.getHours();
  let minutes = dateNow.getMinutes();
  log("time", hours, minutes);
  
  let now = toCoord(perDay(dateNow), 0.85);
  log("now", now.value);
  
  // Phases
  // Determine current phase independent of their order
  phases = phases
    .map((date) => perDay(date))
    .map((rel) => toCoord(rel))
  let [
    dawnA, dawnN, dawnC,
    sunrise, sunset,
    duskC, duskN, duskA
  ] = phases;
  log("dawn", dawnA.value, dawnN.value, dawnC.value);
  log("sunrise", sunrise.value);
  log("sunset", sunset.value);
  log("dusk", duskC.value, duskN.value, duskA.value);
  
  let phaseNow;
  let phase = getPrevious(now, phases);
  switch (phase) {
    case dawnA:
    case duskN:
      phaseNow = "twilight-astronomical";
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
  
  setPath($(".dawn.astronomical"), (dawnA.value) ? dawnA : duskN, dawnN);
  setPath($(".dawn.nautical"), dawnN, dawnC);
  setPath($(".dawn.civil"), dawnC, sunrise);
  setPath($(".day"), sunrise, sunset);
  setPath($(".dusk.civil"), sunset, duskC);
  setPath($(".dusk.nautical"), duskC, duskN);
  setPath($(".dusk.astronomical"), duskN, (duskA.value) ? duskA : dawnN);
  setPath($(".night"), duskA, dawnA);
  
  // Seasons
  let [spring, summer, autumn, winter] = seasons
    .map((date) => perYear(date))
    .map((rel) => toCoord(rel, 0.1));
  let [seasonStart, seasonEnd] = seasonEdges
    .map((date) => perDay(date))
    .map((rel) => toCoord(rel, 0.1));
  log("spring", spring);
  log("summer", summer);
  log("autumn", autumn);
  log("winter", winter);
  
  setPath($(".season"), seasonStart, seasonEnd, 0.1);
  
  let seasonNow;
  let today = toCoord(perYear(dateNow));
  let season = getPrevious(today, [spring, summer, autumn, winter]);
  switch (season) {
    case spring:
      seasonNow = "spring";
      break;
    case summer:
      seasonNow = "summer";
      break;
    case autumn:
      seasonNow = "autumn";
      break;
    case winter:
      seasonNow = "winter";
      break;
  }
  log("season", seasonNow);
  document.body.dataset.season = seasonNow;
  
  // Now
  $(".now").setAttribute("transform", `rotate(${now.value * 360})`);
}

function renderWithCoords(lat, lon) {
  // Phases
  let dawnA = sun.getAstronomicalDawn(lat, lon);
  let dawnN = sun.getNauticalDawn(lat, lon);
  let dawnC = sun.getCivilDawn(lat, lon);
  let sunrise = sun.getSunrise(lat, lon);
  let sunset = sun.getSunset(lat, lon);
  let duskC = sun.getCivilDusk(lat, lon);
  let duskN = sun.getNauticalDusk(lat, lon);
  let duskA = sun.getAstronomicalDusk(lat, lon);
  
  // Seasons
  let dateNow = new Date();
  let yearNow = dateNow.getFullYear();
  
  let spring = seasons.getVernalEquinox(yearNow);
  let summer = seasons.getSummerSolstice(yearNow, lat < 0);
  let autumn = seasons.getAutumnalEquinox(yearNow);
  let winter = seasons.getWinterSolstice(yearNow, lat < 0);
  
  let seasonStart = sun.getSunrise(lat, lon);
  let seasonEnd = sun.getSunset(lat, lon);
  
  render(
    [
      dawnA, dawnN, dawnC,
      sunrise, sunset,
      duskC, duskN, duskA
    ],
    [spring, summer, autumn, winter],
    [seasonStart, seasonEnd]
  );
}

function renderWithoutCoords() {
  // TODO: NYI
}

function onUpdate() {
  location.getCoords()
    .then(([lat, lon]) => {
      log("coords", lat, lon);
      renderWithCoords(lat, lon);
    })
    .catch((err) => {
      console.error(err.message);
      switch (err.code) {
        case location.ERROR_PERMISSION:
          // TODO: noop, ask for permission again
          break;
        case location.ERROR_POSITION:
        case location.ERROR_TIMEOUT:
          // TODO: noop, try again later
          break;
        case location.ERROR_UNKNOWN:
          // TODO: noop, select other location
          break;
      }
      renderWithCoords();
    });
}

setInterval(onUpdate, 60 * 1000);
location.on("change", onUpdate);
onUpdate();
