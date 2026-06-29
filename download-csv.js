const https = require('https');
const fs = require('fs');

const url = 'https://drive.google.com/uc?export=download&id=1TmdbFM0QPNJYKBdjJjfUllSiNe9L-rai';
const file = fs.createWriteStream('lms_content.csv');

function download(url) {
  https.get(url, (response) => {
    // Follow redirect
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      console.log('Redirecting to:', response.headers.location);
      return download(response.headers.location);
    }
    
    if (response.statusCode === 200) {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed.');
      });
    } else {
      console.error(`Failed to download: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error:', err.message);
    fs.unlink('lms_content.csv', () => {});
  });
}

download(url);
