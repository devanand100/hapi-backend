const _fileHandler = function (file , options) {
    const arrayFileName = [];

    if (!file ) throw new Error('no file');

    const unique= Date.now() + '_' + Math.round(Math.random() * 1E9);
    const orignalname = request.payload.image.hapi.filename.split(" ").join('_');

    const filename = orignalname + unique;
    const path = `${options.dest}${orignalname}`;
    const fileStream = fs.createWriteStream(path);
    
    
    return new Promise((resolve, reject) => {
        file.on('error', function (err) {
            reject(err);
        });
        
        file.pipe(fileStream);
        
        file.on('end', function (err) {
            const fileDetails = {
                fieldname: file.hapi.name,
                originalname: file.hapi.filename, filename,
                // mimetype: file.hapi.headers['content-type'],
                destination: `${options.dest}`, path,
                // size: fs.statSync(path).size,
            }
            
            if(isMultiple) {
                resolve(fileDetails, filename);
            } else {
                arrayFileName.push(fileDetails);
                resolve(arrayFileName);
            }
        })
    })
}

module.exports = _fileHandler;