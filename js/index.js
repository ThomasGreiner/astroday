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

function setPath(path, from, to, radius = 1) {
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

function render(lat, lon) {
  function perDay(date) {
    let dateStart = new Date();
    dateStart.setHours(0, 0, 0);
    let dateEnd = new Date();
    dateEnd.setHours(23, 59, 59);
    let totalTime = dateEnd - dateStart;
    
    return (date - dateStart) / totalTime;
  }
  
  function perYear(date) {
    let year = dateNow.getFullYear();
    let dateStart = new Date(year, 0, 1);
    let dateEnd = new Date(year + 1, 0, 1) - 1;
    let totalTime = dateEnd - dateStart;
    
    return (date - dateStart) / totalTime;
  }
  
  let dateNow = new Date();
  let hours = dateNow.getHours();
  let minutes = dateNow.getMinutes();
  console.log("time", hours, minutes);
  
  // Sun
  let now = toCoord(perDay(dateNow), 0.85);
  let dawnA = toCoord(perDay(sun.getAstronomicalDawn(lat, lon)));
  let dawnN = toCoord(perDay(sun.getNauticalDawn(lat, lon)));
  let dawnC = toCoord(perDay(sun.getCivilDawn(lat, lon)));
  let sunrise = toCoord(perDay(sun.getSunrise(lat, lon)));
  let sunset = toCoord(perDay(sun.getSunset(lat, lon)));
  let duskC = toCoord(perDay(sun.getCivilDusk(lat, lon)));
  let duskN = toCoord(perDay(sun.getNauticalDusk(lat, lon)));
  let duskA = toCoord(perDay(sun.getAstronomicalDusk(lat, lon)));
  console.log("now", now.value);
  console.log("dawn", dawnA.value, dawnN.value, dawnC.value);
  console.log("sunrise", sunrise.value);
  console.log("sunset", sunset.value);
  console.log("dusk", duskC.value, duskN.value, duskA.value);
  
  // Determine current phase independent of their order
  let phase = getPrevious(now, [
    dawnA, dawnN, dawnC,
    sunrise, sunset,
    duskC, duskN, duskA
  ]);
  
  let phaseNow;
  switch (phase) {
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
  let spring = toCoord(perYear(seasons.getVernalEquinox(yearNow)));
  let summer = toCoord(perYear(seasons.getSummerSolstice(yearNow, lat < 0)));
  let autumn = toCoord(perYear(seasons.getAutumnalEquinox(yearNow)));
  let winter = toCoord(perYear(seasons.getWinterSolstice(yearNow, lat < 0)));
  console.log("spring", spring);
  console.log("summer", summer);
  console.log("autumn", autumn);
  console.log("winter", winter);
  
  let today = toCoord(perYear(dateNow));
  let seasonStart = toCoord(perDay(sun.getSunrise(lat, lon)), 0.1);
  let seasonEnd = toCoord(perDay(sun.getSunset(lat, lon)), 0.1);
  setPath($(".season"), seasonStart, seasonEnd, 0.1);
  let season = getPrevious(today, [spring, summer, autumn, winter]);
  
  let seasonNow;
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
  console.log("season", seasonNow);
  document.body.dataset.season = seasonNow;
  
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
