"use strict";

let dateNow = new Date();
let hours = dateNow.getHours();
let minutes = dateNow.getMinutes();
console.log("time", hours, minutes);
let dateStart = new Date();
dateStart.setHours(0, 0, 0);
let dateEnd = new Date();
dateEnd.setHours(23, 59, 59);
console.log("start-end", dateStart, dateEnd);
let totalTime = dateEnd - dateStart;

const $ = (selector) => document.querySelector(selector);

function toRad(date) {
  let fromStart = date - dateStart;
  return Math.PI * 2 * (fromStart / totalTime);
}

function toCoord(date) {
  let rad = toRad(date);
  return {
    value: date,
    x: 1 * Math.cos(rad),
    y: 1 * Math.sin(rad )
  };
}

function setPath(path, from, to) {
  let share = (to.value - from.value) / totalTime;
  let isLarge = (share > 0.5) ? 1 : 0;
  path.setAttribute("d", `M${from.x} ${from.y} A 1 1 0 ${isLarge} 1 ${to.x} ${to.y} L 0 0`);
}

navigator.geolocation.getCurrentPosition((position) => {
  let {coords} = position;
  let lat = coords.latitude;
  let lon = coords.longitude;
  console.log("coords", lat, lon);
  
  let sunrise = SunriseSunsetJS.getSunrise(lat, lon);
  let sunset = SunriseSunsetJS.getSunset(lat, lon);
  console.log("sunrise", sunrise);
  console.log("sunset", sunset);
  
  let daytimeStart = toCoord(sunrise);
  let daytimeEnd = toCoord(sunset);
  console.log(daytimeStart, daytimeEnd);
  
  setPath($(".day"), daytimeStart, daytimeEnd);
  setPath($(".night"), daytimeEnd, daytimeStart);
  
  let now = toCoord(dateNow);
  $(".now").setAttribute("x2", now.x);
  $(".now").setAttribute("y2", now.y);
});
