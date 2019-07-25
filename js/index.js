"use strict";

import * as SunriseSunsetJS from "../lib/sunrise-sunset.js";

let dateNow = new Date();
let hours = dateNow.getHours();
let minutes = dateNow.getMinutes();
console.log("time", hours, minutes);
let dateStart = new Date();
dateStart.setHours(0, 0, 0);
let dateEnd = new Date();
dateEnd.setHours(23, 59, 59);
let totalTime = dateEnd - dateStart;

const $ = (selector) => document.querySelector(selector);

function toPercent(date) {
  return (date - dateStart) / totalTime;
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

navigator.geolocation.getCurrentPosition((position) => {
  let {coords} = position;
  let lat = coords.latitude;
  let lon = coords.longitude;
  console.log("coords", lat, lon);
  
  // https://github.com/kevinboone/solunar_cmdline/blob/master/suntimes.c
  let dawn = SunriseSunsetJS.getCivilDawn(lat, lon);
  let sunrise = SunriseSunsetJS.getSunrise(lat, lon);
  let sunset = SunriseSunsetJS.getSunset(lat, lon);
  let dusk = SunriseSunsetJS.getCivilDusk(lat, lon);
  console.log("dawn", dawn);
  console.log("sunrise", sunrise);
  console.log("dusk", dusk);
  console.log("sunset", sunset);
  
  let dawnStart = toCoord(toPercent(dawn));
  let daytimeStart = toCoord(toPercent(sunrise));
  let duskStart = toCoord(toPercent(dusk));
  let daytimeEnd = toCoord(toPercent(sunset));
  console.log(dawnStart, daytimeStart, duskStart, daytimeEnd);
  
  setPath($(".sunrise"), dawnStart, daytimeStart);
  setPath($(".day"), daytimeStart, duskStart);
  setPath($(".sunset"), daytimeEnd, duskStart);
  setPath($(".night"), duskStart, dawnStart);
  
  if (dateNow > daytimeStart && dateNow < daytimeEnd) {
    document.body.dataset.phase = "day";
  } else {
    document.body.dataset.phase = "night";
  }
  
  let now = toCoord(toPercent(dateNow), 0.85);
  $(".now").setAttribute("x2", now.x);
  $(".now").setAttribute("y2", now.y);
});
