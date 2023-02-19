class Form {
  constructor(form, map, options) {
    // Store reference to <form> element
    this.element = form;

    // If a string was passed, treat it as a CSS selector
    if (typeof form === "string") {
      this.element = document.querySelector(form);
    }

    // Store a reference to the Map the form will control
    this.map = map;

    // When user changes form values
    this.element.addEventListener("input", () => {
      // Update instace of Map
      this.map.update(this.options);
    });

    // Update map based on form default values
    this.map.update(this.options);
  }
  get options() {
    // Extract form data
    const formData = new FormData(this.element);

    // Turn form data into object
    let options = Object.fromEntries(formData);

    // Parse specific properties as numbers or booleans
    const Numbers = ["thickness"];
    const Booleans = ["invert", "labels"];

    // For each value in the form
    for (let key in options) {
      // If it’s supposed to be a number
      if (Numbers.includes(key)) {
        // Convert it to a number
        options[key] = Number(options[key]);
      }
      // If it’s supposed to be a boolean
      else if (Booleans.includes(key)) {
        // Convert it to a boolean
        if (options[key] === "on") {
          options[key] = true;
        }
      }
    }

    // Return converted object
    return options;
  }
}

export default Form;
