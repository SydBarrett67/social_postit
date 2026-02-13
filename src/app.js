const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// Render pagina /post
app.get('/post', (req, res) => {
    res.send(`
        <form method="POST" action="/post">
            <input type="text" name="title" placeholder="Titolo" required />
            <button type="submit">Salva</button>
        </form>
    `);
});

// Salvataggio su post.json
app.post('/post', (req, res) => {
    const filePath = path.join(__dirname, '/jsons/post.json');
    let data = [];

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath));
    }

    data.push({ title: req.body.title });

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
