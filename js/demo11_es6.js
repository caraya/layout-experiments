// 1. Capture the slider we want to use
// 2. Get the value for that slider. We can retrieve by getting
// the value from the input element we captured
const weight = document.getElementById('robotoWeight');
const weightSlider = document.querySelector('.weightSlider');
weightSlider.innerHTML = weight.value;

const width = document.getElementById('robotoWidth');
const widthSlider = document.querySelector('.widthSlider');
widthSlider.innerHTML = width.value;

const lineHeight = document.getElementById('lineHeight');
const lineHeightSlider = document.querySelector('.lineHeightSlider');
lineHeightSlider.innerHTML = lineHeight.value;

// 3. Set the value of the slider as the value of the corresponding css element
// 4. Display the value under the corresponding slider

/**
 * @name setRootVar
 *
 * @param {string} name
 * @param {number} value
 */
function setRootVar(name, value) {
  let rootStyles = document.styleSheets[0].cssRules[1].style;
  rootStyles.setProperty('--' + name, value);
}

weight.oninput = function() {
  weightSlider.innerHTML = weight.value;
  // setting the style
  setRootVar('font-weight', ' "wght" ' + weight.value);
};

width.oninput = function() {
  widthSlider.innerHTML = width.value;
  setRootVar('font-width', ' "wdth" ' + width.value);
};

lineHeight.oninput = function() {
  lineHeightSlider.innerHTML = lineHeight.value;
  setRootVar('line-height', lineHeight.value);
};
