// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// const _ = require('lodash');
const text = window.clipboard.get();
const lines = text.split('\n');
const snippet = lines => `
class MyThing {
  string toString() {${
    lines.map(line => `
    if (inner.enum == InnerEnum::${_.camelCase(line)}) {
      return "${_.snakeCase(line).toUpperCase()}";
    }`).join('')}
  }
}
`;
const transformed = snippet(lines);
document.getElementById('out-txt').innerText = transformed;

document.getElementById('copy-btn').addEventListener('click', () => {
  window.clipboard.send(transformed);
})