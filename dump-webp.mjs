import fs from 'node:fs';
const b = fs.readFileSync('c:\\Users\\Clement\\Documents\\ChatGPT\\github profolio\\clement-arcade\\dist\\catvolution\\cats\\orange.webp');
console.log(JSON.stringify(Array.from(b.slice(0, 40))));