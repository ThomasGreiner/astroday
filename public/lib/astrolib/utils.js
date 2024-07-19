const {acos, asin, ceil, cos, sin, tan, PI} = Math;

export const getDayOfYear = (date) => ceil((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 8.64e7);

export const toDeg = (rad) => rad * 180 / PI;
export const toRad = (deg) => deg * PI / 180;

// TODO: rename
export const acosDeg = (value) => toDeg(acos(value));
export const asinDeg = (value) => toDeg(asin(value));
export const cosDeg = (value) => cos(toRad(value));
export const sinDeg = (value) => sin(toRad(value));
export const tanDeg = (value) => tan(toRad(value));

export function mod(a, b) {
  const result = a % b;
  return (result < 0) ? result + b : result;
}
