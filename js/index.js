"use strict";

let date = new Date();
let hours = date.getHours();
let minutes = date.getMinutes();
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
  // Add 90° to start at 50,0 instead of 100,50
  // TODO: flip horizontally
  return {
    x: 50 + 50 * Math.cos(rad + 90),
    y: 50 + 50 * Math.sin(rad + 90)
  };
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
  
  // TODO: set radius for arc or otherwise it will always draw the shortest possible arc
  $(".day").setAttribute("d", `M50 50 L ${daytimeStart.x} ${daytimeStart.y} A 50 50 0 0 0 ${daytimeEnd.x} ${daytimeEnd.y}`);
  $(".night").setAttribute("d", `M50 50 L ${daytimeEnd.x} ${daytimeEnd.y} A 50 50 0 0 0 ${daytimeStart.x} ${daytimeStart.y}`);
});
