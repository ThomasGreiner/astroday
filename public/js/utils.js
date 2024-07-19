// TODO: allow overriding via query string parameter
const DEBUG = false;

export const $ = (selector) => document.querySelector(selector);

export function log(...args)
{
  if (!DEBUG)
    return;
  
  console.log(...args);
}

// Percentage can't be calculated based on start and end of day
// or otherwise it will be wrong on leap days
export function inDay(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return (hours * 60 + minutes) / (24 * 60);
}

export function inYear(date) {
  let dateNow = new Date();
  let year = dateNow.getFullYear();
  let dateStart = new Date(year, 0, 1);
  let dateEnd = new Date(year + 1, 0, 1) - 1;
  let totalTime = dateEnd - dateStart;
  
  return (date - dateStart) / totalTime;
}

export function toCoord(value, radius = 1) {
  let rad = toRad(value);
  return {
    value,
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad )
  };
}

export function toRad(value) {
  return Math.PI * 2 * value;
}
