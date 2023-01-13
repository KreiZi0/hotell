const express = require('express');
const app = express();
const sequelize = require('./database');
const pug = require('pug');
app.set('view engine', 'pug');
app.use(express.static('public'))
const bodyParser = require('body-parser')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', async (req, res) => {
    try {
        const hotell = await sequelize.query('SELECT * FROM hotell', { type: sequelize.QueryTypes.SELECT });
        res.render('index', {hotell});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to select * from hotell' });
    }
});


app.get('/register', (req, res) => {
        res.render('register');
});

app.get('/faq', (req, res) => {
    res.render('faq');
});

app.get('/clientregister', (req, res) => {
    res.render('clientregister');
});



app.get('/hotel/:id', async (req, res) => {
    try {
        const andmed = await sequelize.query('SELECT * FROM hotelli_andmed where hotelli_id_fk = :id', { replacements: {id: req.params.id},type: sequelize.QueryTypes.SELECT });
        const sendable = andmed[0]
        res.render('hotel', {sendable});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to select * from hotellid' });
    }
});

app.post('/registering', async (req, res) => {
    var eesnimi = req.body.eesnimi;
    var perenimi = req.body.perenimi;
    var email = req.body.email;
    var password = req.body.password;
    var isikukood = req.body.isikukood;
    console.log(eesnimi)
    console.log(perenimi)
    console.log(email)
    console.log(password)
    console.log(isikukood)
    console.log('INSERT INTO omanikud (eesnimi, perenimi, email, password, isikukood) VALUES (?,?,?,?,?)', [eesnimi, perenimi, email, password, isikukood])
    try {
        await sequelize.query('INSERT INTO omanikud (perenimi, eesnimi, email, password, isikukood) VALUES (:perenimi, :eesnimi, :email, :password, :isikukood)',
            {replacements: {eesnimi: req.body.eesnimi, perenimi: req.body.perenimi, email: req.body.email, password: req.body.password, isikukood: req.body.isikukood}, type: sequelize.QueryTypes.INSERT });
        //res.status(200).send('Successfuly registered')
        res.render('hotel-register');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to register' });
    }
});


app.post('/reserve', async (req, res) => {
    try {
        await sequelize.query('INSERT INTO omanikud (perenimi, eesnimi, email, password, isikukood) VALUES (:perenimi, :eesnimi, :email, :password, :isikukood)',
            {replacements: {eesnimi: req.body.eesnimi, perenimi: req.body.perenimi, email: req.body.email, password: req.body.password, isikukood: req.body.isikukood}, type: sequelize.QueryTypes.INSERT });
        res.status(200).send('Successfuly reserved')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to register' });
    }
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000.');
});