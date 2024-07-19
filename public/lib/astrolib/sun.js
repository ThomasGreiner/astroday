import {
  getDayOfYear,
  acosDeg, asinDeg, cosDeg, sinDeg, mod, tanDeg,
  toDeg, toRad
} from "./utils.js";

const {atan, cos, floor} = Math;

const DEFAULT_ZENITH = 90 + 50 / 60;
const CIVIL_TWILIGHT = DEFAULT_ZENITH + 6;
const NAUTICAL_TWILIGHT = DEFAULT_ZENITH + 12;
const ASTRONOMICAL_TWILIGHT = DEFAULT_ZENITH + 18;

const DEGREES_PER_HOUR = 360 / 24;
const MS_PER_HOUR = 60 * 60 * 1000;

/*
 * Based on:
 * Sunrise-Sunset-Js by Matt Kane
 *   Copyright 2012 Triggertrap Ltd.
 *   https://github.com/udivankin/sunrise-sunset
 *   LGPL-2.1 License
 * Solunar
 *   Copyright 2005-2016 Kevin Boone
 *   https://github.com/kevinboone/solunar_cmdline
 *   GPL_2.0 License
 */
function getDate(isSunrise, zenith, latitude, longitude, date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  const hoursFromMeridian = longitude / DEGREES_PER_HOUR;
  const approxTimeOfEventInDays = isSunrise
    ? dayOfYear + ((6 - hoursFromMeridian) / 24)
    : dayOfYear + ((18 - hoursFromMeridian) / 24);
  
  const sunMeanAnomaly = (0.9856 * approxTimeOfEventInDays) - 3.289;
  const sunTrueLongitude = mod(sunMeanAnomaly + (1.916 * sinDeg(sunMeanAnomaly)) + (0.02 * sinDeg(2 * sunMeanAnomaly)) + 282.634, 360);
  const ascension = 0.91764 * tanDeg(sunTrueLongitude);
  
  let rightAscension;
  rightAscension = toDeg(atan(ascension));
  rightAscension = mod(rightAscension, 360);
  
  const lQuadrant = floor(sunTrueLongitude / 90) * 90;
  const raQuadrant = floor(rightAscension / 90) * 90;
  rightAscension = rightAscension + (lQuadrant - raQuadrant);
  rightAscension /= DEGREES_PER_HOUR;
  
  const sinDec = 0.39782 * sinDeg(sunTrueLongitude);
  const cosDec = cosDeg(asinDeg(sinDec));
  const cosLocalHourAngle = (cosDeg(zenith) - (sinDec * sinDeg(latitude))) / (cosDec * cosDeg(latitude));
  
  // FIXME: NaN for ASTRONOMICAL_TWILIGHT if there is none
  const localHourAngle = isSunrise
    ? 360 - acosDeg(cosLocalHourAngle)
    : acosDeg(cosLocalHourAngle);
  
  const localHour = localHourAngle / DEGREES_PER_HOUR;
  const localMeanTime = localHour + rightAscension - (0.06571 * approxTimeOfEventInDays) - 6.622;
  const time = mod(localMeanTime - (longitude / DEGREES_PER_HOUR), 24);
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Created date will be set to local (system) time zone.
  return new Date(utcMidnight + (time * MS_PER_HOUR));
}

export const getAstronomicalDawn = getDate.bind(null, true, ASTRONOMICAL_TWILIGHT);
export const getNauticalDawn = getDate.bind(null, true, NAUTICAL_TWILIGHT);
export const getCivilDawn = getDate.bind(null, true, CIVIL_TWILIGHT);
export const getSunrise = getDate.bind(null, true, DEFAULT_ZENITH);
export const getSunset = getDate.bind(null, false, DEFAULT_ZENITH);
export const getCivilDusk = getDate.bind(null, false, CIVIL_TWILIGHT);
export const getNauticalDusk = getDate.bind(null, false, NAUTICAL_TWILIGHT);
export const getAstronomicalDusk = getDate.bind(null, false, ASTRONOMICAL_TWILIGHT);
