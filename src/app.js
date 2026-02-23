const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const session = require('express-session');

const { requireLogin } = require('./utils');

const app = express();
const PORT = 3000;

app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));

app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(express.static(path.join(__dirname, '..', 'public')));

// upload immagini con multer
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



// ROUTE /post
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



// ROUTE /postGallery
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



// ROUTE /profile
app.get('/profile', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/profile.html"));
});



// Login methods
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/profile');
    }
    res.sendFile(path.join(__dirname, "../public/login.html"));
});
app.post('/login', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.redirect('/login');
    }

    req.session.user = { username };

    console.log('User \'', username, '\' logged in from IP:', req.ip);

    res.redirect('/profile');
});



// Logout method
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


/*

    API

*/

// Post API
app.get('/api/posts', (req, res) => {
  const filePath = path.join(__dirname, 'jsons', 'post.json');

  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
});

// API user login status
app.get('/api/me', (req, res) => {
    if (!req.session.user) {
        return res.json({ logged: false });
    }

    res.json({
        logged: true,
        username: req.session.user.username
    });
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



// Avvio del server e listener
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});



// Fallback (404)
app.use((req, res) => {
    res.status(404).send("<h1>404 - Pagina non trovata</h1>");
});
