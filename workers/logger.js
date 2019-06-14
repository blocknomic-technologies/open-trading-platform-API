const fs = require('fs');
process.on('message', data => {
    switch(data.type) {
        case 'controller': 
            createDirIfNotExist(`logs/`, (err, res) => {
                if(err) console.error(err);
                else createDirIfNotExist(`logs/${data.data.controller}`, (err, res) => {
                    if(err) console.error(err);
                    else logToFile(`logs/${data.data.controller}/${(data.data.uri.pathname || '').split('/').join("")}`, JSON.stringify(data, null, 2) + '\n\n\n\n', (err, res) => {
                        console.log(err, res)
                    })
                });
            });
            break;

        case 'uncaught': 
            createDirIfNotExist(`logs/`, (err, res) => {
                if(err) console.error(err);
                else createDirIfNotExist(`logs/uncaught`, (err, res) => {
                    if(err) console.error(err);
                    else logToFile(`logs/uncaught/uncaught.log`, JSON.stringify(data, null, 2) + '\n\n\n\n', (err, res) => {
                        console.log(err, res)
                    })
                });
            });
            break;
    }
})

function createDirIfNotExist(dirName, cb) {
    fs.stat(`${dirName}`, (err, res) => {
        if(!err) {
            return cb(null);            
        } else if(err.code === "ENOENT") {
            fs.mkdir(dirName, (err, res) => {
                if(err) {
                    return cb(err);
                } else {
                    return cb(null);
                }
            })
        } else if(err) {
            return cb(err);            
        }
    });
}

function logToFile(path, data, cb) {
    fs.appendFile(path, data, (err, res) => {
        cb(err, res);
    })
}