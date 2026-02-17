const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// Configurazione upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // prende .jpg/.png
        const uniqueName = Date.now() + ext;         // nome unico
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });



// Render pagina /post
app.get('/post', (req, res) => {
    res.send(`
        <form action="/post" method="POST" enctype="multipart/form-data">
            <input type="text" name="title" placeholder="Titolo" />
            <textarea name="description" placeholder="Descrizione"></textarea>
            <input type="file" name="image" />
            <button type="submit">Invia</button>
        </form>
    `);
});

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
