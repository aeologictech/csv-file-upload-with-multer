const express = require('express');
const multer = require('multer');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs')
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/csv/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) 
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback, res) {
        var ext = path.extname(file.originalname);
        if(ext !== '.csv') {
            req.fileValidationError = "Only CSV File Extension Allowed";
            return callback(null, false, req.fileValidationError);
        }
        callback(null, true)
    },
});

app.post('/upload-csv', upload.single('file'), async (req, res) => {
    try {
        if(req.fileValidationError) {
            res.status(500).send({
              status: 500,
              message: req.fileValidationError
            })
        }else {
            const jsonArray = await csv().fromFile(req.file.path).then((json) => {
              return json
            });
            const filename = req.file.originalname.split('.',1)[0] // file name
            if(jsonArray) {
              fs.unlink(req.file.path, err => {
                if (err) throw err;
              }); // deleting file after reading file
              res.status(200).send({
                status: 200,
                data: {
                  fileName: filename,
                  fileData: jsonArray
                }
              })
            }else{
              res.status(500).send({
                status: 500,
                message: "Data Not Found"
              })
            }
        }
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: error.message
        })
    }
})

const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server up to ${PORT}`)
})