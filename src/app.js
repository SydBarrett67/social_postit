const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const { error } = require('console');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.static(path.join(__dirname, 'public')));

// Configurazione upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "images"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);    // estensione
        const uniqueName = Date.now() + ext;            // nome unico
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });



// Render pagina /post
app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/post.html"));
});

// PostGallery
app.get('/postGallery', (req,res) => {
    res.sendFile(path.join(__dirname, "../public/postGallery.html"));
    // Specifica percors
    const imageDirPath = path.join(__dirname, "../images/");

    // Leggi file da percorso
    fs.readdir(

        imageDirPath,

        function (err, files) {
            console.error(err);
            if (err) return res.status(500).json({error: 'Errore nella lettura immagini.'});

            res.json(files);
        }
    );
})

// Salvataggio su post.json
app.post('/post', upload.single("image"), (req, res) => {
    const filePath = path.join(__dirname, 'jsons', 'post.json');
    let data = [];

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        data = fileContent ? JSON.parse(fileContent) : [];
    }

    data.push({ 
        title: req.body.title,
        description: req.body.description,
        image: req.file ? req.file.filename : null
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.send("Salvato su post.json");
});

// Rendi pubblica la cartella uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});

// Fallback (404)
app.use((req, res) => {
    res.status(404).send("<h1>404 - Pagina non trovata</h1>");
});
