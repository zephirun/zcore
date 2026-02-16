const fs = require('fs');

const css = fs.readFileSync('gmad_decoded.css', 'utf8');

const terms = ['bg-cinnabar-400', 'bg-green-600', 'bg-secondary-500', 'bg-mainBg', 'bg-lightBg', 'font-family'];

terms.forEach(term => {
    const index = css.indexOf(term);
    if (index !== -1) {
        // Print 50 chars before and 100 after
        const start = Math.max(0, index - 50);
        const end = Math.min(css.length, index + 150);
        console.log(`--- ${term} ---`);
        console.log(css.substring(start, end));
        console.log('-------------------');
    } else {
        console.log(`--- ${term} NOT FOUND ---`);
    }
});
