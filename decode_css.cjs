const fs = require('fs');
const zlib = require('zlib');

try {
    const inputBuffer = fs.readFileSync('gmad_decoded.css');
    console.log("Read " + inputBuffer.length + " bytes.");

    // Try Gunzip
    zlib.gunzip(inputBuffer, (err, buffer) => {
        if (!err) {
            console.log("Gunzip successful.");
            fs.writeFileSync('gmad_final.css', buffer);
            console.log("Saved to gmad_final.css");
        } else {
            console.error("Gunzip error: " + err.message);
            // Try Inflate if Gunzip fails
            zlib.inflate(inputBuffer, (err2, buffer2) => {
                if (!err2) {
                    console.log("Inflate successful.");
                    fs.writeFileSync('gmad_final.css', buffer2);
                } else {
                    console.error("Inflate error: " + err2.message);
                }
            });
        }
    });

} catch (e) {
    console.error("Error: " + e.message);
}
