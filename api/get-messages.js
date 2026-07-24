const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
  const msgFile = path.join('/tmp', 'messages.json');
  if (fs.existsSync(msgFile)) {
    res.json(JSON.parse(fs.readFileSync(msgFile, 'utf8')));
  } else {
    res.json([]);
  }
};