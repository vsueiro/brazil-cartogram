import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import Color from "./Color.js";
import Data from "./Data.js";

class Map {
  constructor(map, options) {
    // Store reference to the <div> element
    this.element = map;

    // If a string was passed, treat it as a CSS selector
    if (typeof map === "string") {
      this.element = document.querySelector(map);
    }

    // Define default values
    this.defaults = {
      dataset: "data/sample.csv",
      id: "id",
      value: "value",
      shape: "hexagonal",
      invert: false,
      labels: false,
    };

    // Create options by defaults if custom value was not passed
    this.options = Object.assign({}, this.defaults, options);

    // Create empty map templates (will be used to save loaded SVG strings)
    this.template = {};

    // Create empty string (will be used to save name of loaded CSV file)
    this.currentDataset = "";

    // Create instance to manipulate color palette
    this.color = new Color();

    // Define list of aliases for state names
    this.aliases = {
      AC: ["Acre"],
      AL: ["Alagoas"],
      AP: ["Amapá"],
      AM: ["Amazonas"],
      BA: ["Bahia"],
      CE: ["Ceará"],
      DF: ["Distrito Federal"],
      ES: ["Espírito Santo"],
      GO: ["Goiás"],
      MA: ["Maranhão"],
      MT: ["Mato Grosso"],
      MS: ["Mato Grosso do Sul"],
      MG: ["Minas Gerais"],
      PA: ["Pará"],
      PB: ["Paraíba"],
      PR: ["Paraná"],
      PE: ["Pernambuco"],
      PI: ["Piauí"],
      RJ: ["Rio de Janeiro"],
      RN: ["Rio Grande do Norte"],
      RS: ["Rio Grande do Sul"],
      RO: ["Rondônia"],
      RR: ["Roraima"],
      SC: ["Santa Catarina"],
      SP: ["São Paulo"],
      SE: ["Sergipe"],
      TO: ["Tocantins"],
    };
  }

  async loadDataset() {
    // Get path to dataset
    const csv = this.options.dataset;

    // If dataset is already loaded
    if (csv === this.currentDataset) {
      // Proceed to loading the blank SVG map template
      console.log("Proceed to loading the blank SVG map template");
      this.loadMap();
    } else {
      // Wait until csv file is loaded
      const set = await d3.csv(csv, (d) => {
        // Convert values from text to number
        return {
          id: d[this.options.id],
          value: Number(d[this.options.value]),
        };
      });

      console.log(set);

      console.log(this.options.id, this.options.value);

      // Create new instance of Data
      this.data = new Data(set);

      // Keep track of most recently loaded dataset
      this.currentDataset = csv;

      // Proceed to loading the blank SVG map template
      this.loadMap();
    }
  }

  async loadMap() {
    // Create alias to make lines shorter
    const shape = this.options.shape;

    // If map has already been loaded
    if (shape in this.template) {
      // Draw blank map based on saved SVG string
      this.draw(this.template[shape]);
    }
    // Otherwise, load map for the first time
    else {
      // Define path
      const file = `maps/${this.options.shape}.svg`;

      // Read desired SVG file as text
      const response = await fetch(file);
      const string = await response.text();

      // Store string for later use
      this.template[shape] = string;

      // Draw blank map based on saved SVG string
      this.draw(this.template[shape]);
    }
  }

  update(options) {
    // Updates current options with new values passed
    this.options = Object.assign({}, this.defaults, options);

    // Load new data (or use existing one)
    this.loadDataset();
  }

  paint() {
    // Pick desired scale based on <select>
    const scale = d3[this.options.palette];

    // Get array with min a max values from dataset
    let extent = d3.extent(this.data.set, (d) => d.value);

    // If checkbox for inverting colors is checked
    if (this.options.invert) {
      // Reverse domain
      extent.reverse();
    }

    // Convert to value from 0 to 1
    let normalize = d3.scaleLinear().domain(extent).range([0, 1]);

    // Color each state
    for (let state of this.states) {
      for (let row of this.data.set) {
        // Define match checks
        const matchesId = row.id.toLowerCase() === state.id.toLowerCase();
        const matchesAlias = this.aliases[state.id].includes(row.id);

        // If data entry matches the state from the map
        if (matchesId || matchesAlias) {
          // Define color
          const color = scale(normalize(row.value));

          // Apply color to element
          state.setAttribute("fill", color);

          // Apply border thickness
          state.setAttribute("stroke-width", this.options.thickness);
        }
      }
    }
  }

  getCenter(state) {
    // Find SVG element bounding box
    const box = state.getBBox();

    // Calculate its geometric center
    return {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
  }

  label() {
    // If user doesn’t want labels, stop executing
    if (this.options.labels === false) {
      return;
    }

    // Loop through each state in the map
    for (let state of this.states) {
      // Obtain coordinates of its center
      const { x, y } = this.getCenter(state);

      // Get current fill color of state
      const color = state.getAttribute("fill");

      // Check if it is a bright or dark color
      const isLight = this.color.isLight(color);

      // Add text label
      // TODO: fix svg selector to work even is multiple <svg> elements exist on page
      d3.select("svg")
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 24)
        .attr("fill", isLight ? "black" : "white")
        .text(state.id);
    }
  }

  draw(template) {
    // Removes previous map
    this.element.replaceChildren();

    // Insert SVG into parent element
    this.element.innerHTML = template;

    // Store each path or circle as a state
    this.states = this.element.querySelectorAll("path[id],circle[id]");

    // Apply colors
    this.paint();

    // Add state labels
    this.label();
  }

  download() {
    // Create temporary <a> element
    const a = document.createElement("a");

    // Define filename
    const filename = `${this.options.shape}-map-of-brazil`;

    // Get SVG as a string
    const svg = this.element.innerHTML.toString();

    // Convert HTML element to blob
    const blob = new Blob([svg]);

    // Convert SVG to URL
    a.href = window.URL.createObjectURL(blob);

    // Build download attribule
    a.download = `${filename}.svg`;

    // Simulate click on <a> element, to trigger download
    a.click();

    // Discard <a> element
    a.remove();
  }
}

export default Map;
