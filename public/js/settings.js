let settings = {
  version: 1
};

export function forEach(onEach) {
  for (let name in settings) {
    let value = settings[name];
    onEach({name, value});
  }
}

function save() {
  localStorage["astroday-settings"] = JSON.stringify(settings);
}

export function get(name) {
  return settings[name];
}

export function set(name, value) {
  settings[name] = value;
  save();
}

if ("astroday-settings" in localStorage) {
  settings = JSON.parse(localStorage["astroday-settings"]);
}
