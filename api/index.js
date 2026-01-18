const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const supabaseUrl = 'https://zdtxhtjrnoirthhyzxmb.supabase.co';
const supabaseKey = 'sb_publishable_Yb3oTqrzZwgxCbphMtcByg__nm8jVsf';
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, '../')));

app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).send({ success: false });

    const kodeAcak = crypto.randomBytes(3).toString('hex');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = kodeAcak + ext;

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, req.file.buffer, { 
                contentType: req.file.mimetype,
                upsert: true 
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        const { error: dbError } = await supabase
            .from('tourl')
            .insert([{ nama_file: fileName, url: publicUrl }]);

        if (dbError) throw dbError;

        res.send({ success: true, url: publicUrl });

    } catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }
});

module.exports = app;

