import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import Form from "./Form.js";
import Data from "./Data.js";
import Map from "./Map.js";
import Color from "./Color.js";

const color = new Color(d3);
const map = new Map(".map", color);
const form = new Form(".form", map);

console.log(form);
