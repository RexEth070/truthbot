const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('server/public/test-service.html', 'utf8');
const $ = cheerio.load(html);
const textBlocks = [];
$('h1, h2, h3, h4, p, li').each((_, el) => {
  const text = $(el).text().replace(/\s+/g, ' ').trim();
  if (text.length > 20) {
    textBlocks.push(text);
  }
});
let fullText = textBlocks.join('\n\n');
if (fullText.length < 100) {
  fullText = $('body').text().replace(/\s+/g, ' ').trim();
}
console.log('FULL TEXT:');
console.log(fullText);

console.log('\n--- SPLIT TEST ---');
const oldLines = fullText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 20);
console.log('NUMBER OF BLOCKS:', oldLines.length);
console.log(oldLines);
