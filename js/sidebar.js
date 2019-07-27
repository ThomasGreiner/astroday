import * as location from "./location.js";
import {$} from "./utils.js";

$("aside button").addEventListener("click", () => {
  $("aside").classList.toggle("expanded");
});

$("aside form").addEventListener("change", (ev) => {
  let input = ev.target;
  if (input.type == "checkbox") {
    document.body.classList.toggle(`setting-${input.name}`, !input.checked);
  } else {
    location.setId(input.value);
  }
});

let eLocation = $("select[name='location']");
location.forEach(({id, name}) => {
  let eOption = document.createElement("option");
  eOption.value = id;
  eOption.textContent = name;
  eLocation.appendChild(eOption);
});
