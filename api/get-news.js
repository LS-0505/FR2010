const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
  const newsFile = path.join('/tmp', 'news-data.json');
  if (fs.existsSync(newsFile)) {
    res.json(JSON.parse(fs.readFileSync(newsFile, 'utf8')));
  } else {
    res.json([]);
  }
};