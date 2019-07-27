import {$} from "./utils.js";

$("aside form").addEventListener("change", (ev) => {
  let input = ev.target;
  document.body.classList.toggle(`setting-${input.name}`, !input.checked);
});
