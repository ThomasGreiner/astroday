import * as location from "./location.js";
import * as settings from "./settings.js";
import {$} from "./utils.js";

$("aside button").addEventListener("click", () => {
  $("aside").classList.toggle("expanded");
});

function onChange(input) {
  if (input.type == "checkbox") {
    document.body.classList.toggle(`setting-${input.name}`, !input.checked);
    settings.set(input.name, !input.checked);
    return;
  }
  
  switch (input.name) {
    case "location":
      location.setId(input.value);
      break;
    case "midnight-direction":
      document.body.dataset.midnightDir = input.value;
      break;
  }
  settings.set(input.name, input.value);
}

$("aside form").addEventListener("change", (ev) => {
  let input = ev.target;
  onChange(input);
});

let eLocation = $("select[name='location']");
location.forEach(({id, name}) => {
  let eOption = document.createElement("option");
  eOption.value = id;
  eOption.textContent = name;
  eLocation.appendChild(eOption);
});

settings.forEach(({name, value}) => {
  let input = $(`[name="${name}"]`);
  if (!input)
    return;
  
  if (typeof value == "boolean") {
    input.checked = !value;
  } else {
    input.value = value;
  }
  onChange(input);
});
