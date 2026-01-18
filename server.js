const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const kodeAcak = crypto.randomBytes(3).toString('hex'); 
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, kodeAcak + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ success: false });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = protocol + '://' + host + '/uploads/' + req.file.filename;

    res.send({
        success: true,
        url: imageUrl
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server Aktif!');
    console.log('Alamat: http://localhost:3000');
});
