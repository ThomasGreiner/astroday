/**
 * Sunrise/sunset script. By Matt Kane. Adopted for NPM use by Alexey Udivankin.
 * 
 * Based loosely and indirectly on Kevin Boone's SunTimes Java implementation 
 * of the US Naval Observatory's algorithm.
 * 
 * Copyright © 2012 Triggertrap Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General
 * Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful,but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 * You should have received a copy of the GNU Lesser General Public License along with this library; if not, write to
 * the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA,
 * or connect to: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 */

const {acos, asin, atan, ceil, cos, floor, sin, tan, PI} = Math;

const DEFAULT_ZENITH = 90 + 50 / 60;
const CIVIL_TWILIGHT = DEFAULT_ZENITH + 6;
const NAUTICAL_TWILIGHT = DEFAULT_ZENITH + 12;
const ASTRONOMICAL_TWILIGHT = DEFAULT_ZENITH + 18;

const DEGREES_PER_HOUR = 360 / 24;
const MS_PER_HOUR = 60 * 60 * 1000;

const getDayOfYear = (date) => ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 8.64e7);

const toDeg = (rad) => rad * 180 / PI;
const toRad = (deg) => deg * PI / 180;

const acosDeg = (value) => toDeg(acos(value));
const asinDeg = (value) => toDeg(asin(value));
const cosDeg = (value) => cos(toRad(value));
const sinDeg = (value) => sin(toRad(value));
const tanDeg = (value) => tan(toRad(value));

function mod(a, b) {
  const result = a % b;
  return (result < 0) ? result + b : result;
}

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
  const cosLocalHourAngle = ((cosDeg(zenith)) - (sinDec * (sinDeg(latitude)))) / (cosDec * (cosDeg(latitude)));

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
