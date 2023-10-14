const fs = require('fs');
const _fileHandler = function (file, options) {
  if (!file) throw new Error('no file');

  const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);

  const orignalname = file.hapi.filename.split(' ').join('_');
  const filename = unique + orignalname;
  const path = `${options.dest}${filename}`;
  const fileStream = fs.createWriteStream(path);

  return new Promise((resolve, reject) => {
    file.on('error', function (err) {
      reject(err);
    });

    file.pipe(fileStream);

    file.on('end', function (err) {
      const fileDetails = {
        fieldname: file.hapi.name,
        originalname: file.hapi.filename,
        filename,
        destination: `${options.dest}`,
        path,
        // size: fs.statSync(path).size,
      };

      resolve(fileDetails);
    });
  });
};

module.exports = _fileHandler;
