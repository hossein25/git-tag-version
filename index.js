const simpleGit = require('simple-git')();
const fs = require('fs');
const cheerio = require('cheerio');

const args = process.argv.slice(2);
const indexFilePath = args[0];

if (!indexFilePath) {
  console.error('Please provide the path to the index.html file as an argument.');
  process.exit(1);
}

simpleGit.raw(['rev-parse', '--abbrev-ref', 'HEAD'], (err, branch) => {
  if (!err && branch.trim() === 'HEAD') {
    simpleGit.tag((_, tags) => {
      if (tags && tags.all.length > 0) {
        const latestTag = tags.latest;

        fs.readFile(indexFilePath, 'utf8', (err, data) => {
          if (err) throw err;

          const $ = cheerio.load(data);
          $('head').append(`<meta version="${latestTag}">`);

          fs.writeFile(indexFilePath, $.html(), 'utf-8', (err) => {
            if (err) throw err;

            console.log('Text added to index.html successfully.');
          });
        });
      } else {
        console.log('No tags found.');
      }
    });
  } else {
    console.log('Not on main branch.');
  }
});