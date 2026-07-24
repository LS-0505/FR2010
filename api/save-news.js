const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
  if (req.method === 'POST') {
    fs.writeFileSync(path.join('/tmp', 'news-data.json'), JSON.stringify(req.body));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};