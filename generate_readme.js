const Mustache = require('mustache');
const fs = require('fs');

const README_TEMPLATE_FILE = './README.mustache';
const README_FILE = './README.md'

const TEMPLATE_DATA = {
  full_name: 'Adrián García'
};

function generateReadme() {
  fs.readFile(README_TEMPLATE_FILE, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), TEMPLATE_DATA);
    fs.writeFileSync(README_FILE, output);
  });
}

generateReadme();
