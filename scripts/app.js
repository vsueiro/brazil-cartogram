import Form from "./Form.js";
import Map from "./Map.js";

const map = new Map(".map");
const form = new Form(".form", map);

// Select <button> for downloading SVG map
const download = document.querySelector("button.download");

// When buttons is clicked, =all download method on the map
download.addEventListener("click", () => {
  map.download();
});
