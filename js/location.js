import * as locations from "../data/locations.js";

let currentId = null;
let listenersByName = new Map([
  ["change", []]
]);

class Location {
  get coords() {
    return this._coords;
  }
  
  get id() {
    return this._id;
  }
  
  get name() {
    let name = [];
    
    name.push(locations.names.country[this._country] || this._country);
    if (this._state) {
      name.push(locations.names.state[this._state] || this._state);
    }
    name.push(locations.names.city[this._city] || this._city);
    
    return name.join(" - ");
  }
  
  constructor(id) {
    this._id = id;
    
    let [country, state, city] = id.split(".", 3);
    if (!city) {
      city = state;
      state = null;
    }
    this._country = country;
    this._state = state;
    this._city = city;
    
    let coords = locations.coords[this._country];
    if (!coords)
      throw new Error("Unknown country");
    
    if (this._state) {
      coords = coords[this._state];
      if (!coords)
        throw new Error("Unknown state");
    }
    
    coords = coords[this._city];
    if (!coords)
      throw new Error("Unknown city");
    
    if (!(coords instanceof Array))
      throw new Error("Invalid location");
    
    this._coords = coords;
  }
}

function byId(id) {
  if (!id)
    return null;
  
  return new Location(id);
}

export function forEach(fn) {
  let {coords} = locations;
  for (let country in coords) {
    for (let stateOrCity in coords[country]) {
      let cityOrCoord = coords[country][stateOrCity];
      if (cityOrCoord instanceof Array) {
        fn(byId(`${country}.${stateOrCity}`));
      } else {
        for (let city in coords[country][stateOrCity]) {
          fn(byId(`${country}.${stateOrCity}.${city}`));
        }
      }
    }
  }
}

function dispatch(name) {
  let listeners = listenersByName.get(name);
  if (!listeners)
    throw new Error("Invalid event name");
  
  for (let listener of listeners) {
    listener();
  }
}

export function getCoords() {
  if (currentId) {
    try {
      let location = byId(currentId);
      return Promise.resolve(location.coords);
    } catch (ex) {
      console.error(ex);
    }
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      let {coords} = position;
      resolve([
        coords.latitude,
        coords.longitude
      ]);
    });
  });
}

export function on(name, listener) {
  let listeners = listenersByName.get(name);
  if (!listeners)
    throw new Error("Invalid event name");
  
  listeners.push(listener);
}

export function setId(id) {
  currentId = id || null;
  dispatch("change");
}
