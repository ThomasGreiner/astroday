import {$} from "./utils.js";

$("aside button").addEventListener("click", () => {
  $("aside").classList.toggle("expanded");
});

$("aside form").addEventListener("change", (ev) => {
  let input = ev.target;
  document.body.classList.toggle(`setting-${input.name}`, !input.checked);
});
