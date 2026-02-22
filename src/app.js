const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(express.static(path.join(__dirname, '..', 'public')));

// Configurazione upload immagini con multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);    // estensione
        const uniqueName = Date.now() + ext;            // nome unico
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });



// ROUTE PAGINA /post
app.get('/post', (req, res) => {
    console.log(
        'Login:',
        req.method,
        req.originalUrl,
        'IP:',
        req.ip
    );
    
    res.sendFile(path.join(__dirname, "../public/post.html"));
});



// ROUTE PAGINA /postGallery
app.get('/postGallery', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/postGallery.html"));
});



// ROUTE /home 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/home.html"));
});
app.get('/', (req, res) => {
    res.redirect('/home');
});


// API per visualizzare i post in postGallery
app.get('/api/posts', (req, res) => {
  const filePath = path.join(__dirname, 'jsons', 'post.json');

  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
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


app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});

// Fallback (404)
app.use((req, res) => {
    res.status(404).send("<h1>404 - Pagina non trovata</h1>");
});
