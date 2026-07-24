const fs = require('fs');
const path = require('path');

module.exports = function(req, res) {
  if (req.method === 'POST') {
    const msgFile = path.join('/tmp', 'messages.json');
    let messages = [];
    if (fs.existsSync(msgFile)) {
      messages = JSON.parse(fs.readFileSync(msgFile, 'utf8'));
    }
    messages.push(req.body);
    fs.writeFileSync(msgFile, JSON.stringify(messages, null, 2));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};