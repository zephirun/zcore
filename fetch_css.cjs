const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const url = "https://gmad.fbitsstatic.net/sf/bundle/?type=css&paths=navbar,footer,mini_cart,user_login,spot,product,output_base,swiffy-slider,swiper&theme=main&v=202602021652";
const file = fs.createWriteStream("gmad_decoded.css");

https.get(url, function (response) {
    const encoding = response.headers['content-encoding'];

    let stream = response;
    if (encoding === 'gzip') {
        stream = response.pipe(zlib.createGunzip());
    } else if (encoding === 'deflate') {
        stream = response.pipe(zlib.createInflate());
    }

    stream.pipe(file);

    stream.on('end', () => {
        console.log('Download complete.');
    });
}).on('error', function (err) {
    console.error("Error: " + err.message);
});
