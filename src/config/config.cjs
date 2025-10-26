const fs = require('fs');
const path = require('path');

// Read the JSON config file
const configJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')
);

module.exports = configJson;
