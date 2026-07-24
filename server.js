var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var PORT = 8080;
var BASE_DIR = __dirname;

var mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon'
};

var server = http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var pathname = parsedUrl.pathname;

  if (pathname === '/upload' && req.method === 'POST') {
    var chunks = [];
    req.on('data', function(chunk) { chunks.push(chunk); });
    req.on('end', function() {
      var buffer = Buffer.concat(chunks);
      var dataStr = buffer.toString('binary');
      var contentType = req.headers['content-type'];
      var boundary = '--' + contentType.split('boundary=')[1];
      var parts = dataStr.split(boundary);

      for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('filename=') > -1 && parts[i].indexOf('Content-Type:') > -1) {
          var nameMatch = parts[i].match(/filename="(.+?)"/);
          var filename = nameMatch ? Date.now() + '_' + nameMatch[1] : 'file_' + Date.now();
          var headerEnd = parts[i].indexOf('\r\n\r\n');
          if (headerEnd === -1) headerEnd = parts[i].indexOf('\n\n');
          var fileStart = headerEnd + 4;
          var fileData = parts[i].substring(fileStart);
          fileData = fileData.replace(/\r\n$/, '').replace(/\n$/, '');

          var folder = 'uploads/';
          if (filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) folder = 'image/news/';
          else if (filename.match(/\.(mp4|webm|mov|avi)$/i)) folder = 'video/news/';

          if (!fs.existsSync(BASE_DIR + '/' + folder)) {
            fs.mkdirSync(BASE_DIR + '/' + folder, { recursive: true });
          }

          fs.writeFileSync(BASE_DIR + '/' + folder + filename, Buffer.from(fileData, 'binary'));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, url: folder + filename }));
          return;
        }
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'no file' }));
    });
    return;
  }

  if (pathname === '/save-news' && req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      fs.writeFileSync(BASE_DIR + '/news-data.json', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }
  if (pathname === '/save-message' && req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      var msgFile = BASE_DIR + '/messages.json';
      var messages = [];
      if (fs.existsSync(msgFile)) {
        messages = JSON.parse(fs.readFileSync(msgFile, 'utf8'));
      }
      messages.push(JSON.parse(body));
      fs.writeFileSync(msgFile, JSON.stringify(messages, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (pathname === '/get-messages') {
    var msgFile = BASE_DIR + '/messages.json';
    if (fs.existsSync(msgFile)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(msgFile, 'utf8'));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }
  if (pathname === '/get-news') {
    var newsFile = BASE_DIR + '/news-data.json';
    if (fs.existsSync(newsFile)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(newsFile, 'utf8'));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  if (pathname === '/') pathname = '/index.html';

  var filePath = BASE_DIR + pathname;
  var ext = path.extname(filePath);

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 Not Found: ' + pathname);
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, function() {
  console.log('========================================');
  console.log('  🚀 服务器启动成功！');
  console.log('  网站地址：http://localhost:' + PORT);
  console.log('  按 Ctrl+C 停止');
  console.log('========================================');
});