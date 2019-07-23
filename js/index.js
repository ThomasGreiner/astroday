"use strict";

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
  let share = to.value - from.value;
  let isLarge = (share > 0.5) ? 1 : 0;
  path.setAttribute("d", `M${from.x} ${from.y} A 1 1 0 ${isLarge} 1 ${to.x} ${to.y} L 0 0`);
}

function addHourIndicator(hour) {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let coord1 = toCoord(hour / 24, 0.9);
  line.setAttribute("x1", coord1.x);
  line.setAttribute("y1", coord1.y);
  let coord2 = toCoord(hour / 24);
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
  let sunrise = SunriseSunsetJS.getSunrise(lat, lon);
  let sunset = SunriseSunsetJS.getSunset(lat, lon);
  console.log("sunrise", sunrise);
  console.log("sunset", sunset);
  
  let daytimeStart = toCoord(toPercent(sunrise));
  let daytimeEnd = toCoord(toPercent(sunset));
  
  setPath($(".day"), daytimeStart, daytimeEnd);
  setPath($(".night"), daytimeEnd, daytimeStart);
  
  let now = toCoord(dateNow);
  $(".now").setAttribute("x2", now.x);
  $(".now").setAttribute("y2", now.y);
});
