/*
 * Uses font face observer to load all fonts needed for the document.
 *
 * Requires font-face observer to be loaded before this script
 * */

const avenir = new FontFaceObserver('Avenir');

let html = document.documentElement;

html.classList.add('fonts-loading');

Promise.all([
  avenir.load(),
]).then(() => {
  html.classList.remove('fonts-loading');
  html.classList.add('fonts-loaded');
  console.log('All fonts have loaded.');
}).catch(() => {
  html.classList.remove('fonts-loading');
  html.classList.add('fonts-failed');
  console.log('One or more fonts failed to load');
});
