const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// statički folder
app.use(express.static('public'));

// postavljanje EJS-a
app.set('view engine', 'ejs');

// ruta za galeriju
app.get('/', (req, res) => {
    const data = JSON.parse(fs.readFileSync('images.json'));
    res.render('slike', { images: data });
});

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});

app.get('/slike', (req, res) => {
    const data = JSON.parse(fs.readFileSync('images.json'));
    res.render('slike', { images: data });
});