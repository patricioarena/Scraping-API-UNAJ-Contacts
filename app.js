const port = process.env.PORT || 3000

const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
// const opn = require('opn');
const app = express();

app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


function remove(array, element) {
    return array.filter(e => e !== element);
}

const escapeRegExp = (string) => {
    return string.replace(/\n/g, ' ');
}

async function withPupperteer() {
    const collection = [] ;
    const browser = await puppeteer.launch({
        'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    var URL = 'https://www.unaj.edu.ar/contacto/';
    await page.goto(URL);

    let table = await page.evaluate(() => {

        const Sedes = [
            ...document.querySelectorAll('.wpb_wrapper')
        ].map((nodoSede) => nodoSede.innerText);

        return Sedes.map((sede, i) => ({ Sede: sede }))
    });

    await browser.close();

    for (let index = 0; index < table.length; index += 2) {
        let element = table[index];
        table = remove(table, element);
    }

    for (let index = 0; index < table.length; index += 2) {
        let element = table[index];
        let regExp = escapeRegExp(element.Sede);
        if (regExp !== '') {
            collection.push({property: regExp});
        }
    }
    return collection;
}

app.get("/", function (req, res) {
    withPupperteer().then(function (resultado) {
        res.status(200).send(resultado);
    });
});

app.listen(port, () => {
    // const host = '127.0.0.1';
    // console.log(`Server running on => http://${host}:${port}`);
    // opn(`http://${host}:${port}` + '/withPupperteer', { app: 'opera' }); // Cambiar browser
});