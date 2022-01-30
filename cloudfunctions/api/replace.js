const fs = require('fs')

 let content = fs.readFileSync('dist/worker.js').toString();
    content = content.replace('mode: "cors"', '//mode: "cors"');
    content = content.replace('cache: "no-cache"', '//cache: "no-cache"');
    content = content.replace('credentials: "same-origin"', '//credentials: "same-origin"');
    content = content.replace('referrer: "client"', '//referrer: "client"');
    fs.writeFileSync('dist/worker.js', content);

