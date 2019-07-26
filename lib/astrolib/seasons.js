/*
 * Based on:
 * Solunar
 *   Copyright 2005-2016 Kevin Boone
 *   https://github.com/kevinboone/solunar_cmdline
 *   GPL_2.0 License
 */

import {cosDeg} from "./utils.js";

const A = [485, 203, 199, 182, 156, 136, 77, 74, 70, 58, 52, 50, 45, 44, 29, 18,
  17, 16, 14, 12, 12, 12, 9, 8];
const B = [324.96, 337.23, 342.08, 27.85, 73.14, 171.52, 222.54, 296.72, 243.58,
  119.81, 297.17, 21.02, 247.54, 325.15, 60.93, 155.12, 288.79, 198.04, 199.76,
  95.39, 287.11, 320.81, 227.73, 15.45];
const C = [1934.136, 32964.467, 20.186, 445267.112, 45036.886, 22518.443,
  65928.934, 3034.906, 9037.513, 33718.147, 150.678, 2281.226, 29929.562,
  31555.956, 4443.417, 67555.328, 4562.452, 62894.029, 31436.921, 14577.848,
  31931.756, 34777.259, 1222.114, 16859.074];

const fromJulianDate = (julian) => new Date((julian - 2440587.5) * 86400000);

function periodic24(t) {
  let s = 0;
  for (let i = 0; i < 24; i++) {
    s += A[i] * cosDeg(B[i] + C[i] * t);
  }
  return s;
}

export function getVernalEquinox(year) {
  let m = (year - 2000) / 1000;
  let ve = 2451623.80984 + 365242.37404 * m + 0.05169 * m * m - 0.00411 * m * m
    * m - 0.00057 * m * m * m * m ;
  let t = (ve - 2451545.0) / 36525.0;
  let w = 35999.373*t - 2.47;
  let dL = 1 + 0.0334 * cosDeg(w) + 0.0007 * cosDeg(2*w);
  let s = periodic24(t);
  ve = ve + ((0.00001*s) / dL);
  
  return fromJulianDate(ve);
}

// TODO: replace isSouthern with latitude
export function getSummerSolstice(year, isSouthern) {
  let m = (year - 2000) / 1000;
  let ss;
  if (isSouthern) {
    ss = 2451900.05952 + 365242.74049 * m - 0.06223 * m * m - 0.00823 * m * m
      * m + 0.00032 * m * m * m * m;
  } else {
    ss = 2451716.56767 + 365241.62603 * m + 0.00325 * m * m + 0.00888 * m * m
      * m - 0.0003 * m * m * m * m ;
  }
  let t = (ss - 2451545) / 36525;
  let w = 35999.373 * t - 2.47;
  let dL = 1 + 0.0334 * cosDeg(w) + 0.0007 * cosDeg(2 * w);
  let s = periodic24(t);
  ss = ss + ((0.00001 * s) / dL);
  
  return fromJulianDate(ss);
}

export function getAutumnalEquinox(year) {
  let m = (year - 2000) / 1000;
  let ae = 2451810.21715 + 365242.01767 * m - 0.11575 * m * m + 0.00337 * m * m
    * m + 0.00078 * m * m * m * m ;
  let t = (ae - 2451545) / 36525;
  let w = 35999.373 * t - 2.47;
  let dL = 1 + 0.0334 * cosDeg(w) + 0.0007 * cosDeg(2 * w);
  let s = periodic24(t);
  ae = ae + ((0.00001 * s) / dL);
  
  return fromJulianDate(ae);
}

// TODO: replace isSouthern with latitude
export function getWinterSolstice(year, isSouthern) {
  let m = (year - 2000) / 1000;
  let ws;
  if (isSouthern) {
    ws = 2451716.56767 + 365241.62603 * m + 0.00325 * m * m + 0.00888 * m * m
      * m - 0.0003 * m * m * m * m ;
  } else {
    ws = 2451900.05952 + 365242.74049 * m - 0.06223 * m * m - 0.00823 * m * m
      * m + 0.00032 * m * m * m * m ;
  }
  let t = (ws - 2451545) / 36525.0;
  let w = 35999.373 * t - 2.47;
  let dL = 1 + 0.0334 * cosDeg(w) + 0.0007 * cosDeg(2 * w);
  let s = periodic24(t);
  ws = ws + ((0.00001 * s) / dL);
  
  return fromJulianDate(ws);
}
