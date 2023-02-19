import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

class Data {
  constructor(array, options) {
    // Store loaded dataset
    this.set = array;
    // Define default values
    const defaults = {};

    // Create options by defaults if custom value was not passed
    this.options = Object.assign({}, defaults, options);
  }
}

export default Data;
