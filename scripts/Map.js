class Map {
  constructor(map, color, options) {
    // Store reference to the <div> element
    this.element = map;

    // If a string was passed, treat it as a CSS selector
    if (typeof map === "string") {
      this.element = document.querySelector(map);
    }

    // Store reference to Color instance
    this.color = color;

    // Define default values
    const defaults = {
      shape: "hexagonal",
    };

    // Create options by defaults if custom value was not passed
    this.options = Object.assign({}, defaults, options);

    // Create empty map templates (will be used to save loaded SVG strings)
    this.template = {};
  }

  clear() {
    this.element.replaceChildren();
  }

  update(options) {
    // Updates current options with new values passed
    this.options = Object.assign({}, this.options, options);

    // Removes previous map
    this.clear();

    // Create alias to make lines shorter
    const shape = this.options.shape;

    // If map has already been loaded
    if (shape in this.template) {
      // Draw blank map based on saved string
      this.draw(this.template[shape]);
    }
    // Otherwise, load map for the first time
    else {
      // Define path
      const file = `maps/${this.options.shape}.svg`;

      // Read desired SVG file as text
      fetch(file)
        .then((response) => response.text())
        .then((string) => {
          // Store string for later use
          this.template[shape] = string;

          // Draw blank map based on saved string
          this.draw(this.template[shape]);
        });
    }
  }

  draw(template) {
    // Insert SVG into parent element
    this.element.innerHTML = template;

    // Store each path or circle as a state
    this.states = this.element.querySelectorAll("path[id],circle[id]");

    // Color each state
    for (let state of this.states) {
      // Define color
      let color = this.color.d3.interpolateYlGn(Math.random());

      // Apply color to element
      state.style.fill = color;
    }
  }
}

export default Map;
