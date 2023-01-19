const express = require('express');
const app = express();
const sequelize = require('./database');
const pug = require('pug');
app.set('view engine', 'pug');
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

app.post('reserveRoom', async (req, res) => {
    // insert reservation into reserved table by room type and hotel id
    var hotel_id = req.body.hotel_id
    var roomtype = req.body.roomtype
    var begin = req.body.begindate
    var end = req.body.enddate
    // todo
    try {
        const andmed = await sequelize.query("INSERT INTO reservations a VALUES (SELECT)", { replacements: {hotel_id: hotel_id, end: end, begin: begin, roomtype: roomtype},type: sequelize.QueryTypes.SELECT });
        res.send(andmed);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying query'});
    }
});

// returns all avilable room types by hotel id, begindate and enddate
app.post('/getAvailableRooms', async (req, res) => {
    var hotel_id = req.body.hotel_id
    var begin = req.body.begindate
    var end = req.body.enddate

    try {
        const andmed = await sequelize.query("SELECT DISTINCT r.type FROM rooms r WHERE r.hotell_id = :hotel_id AND NOT EXISTS (SELECT 1 FROM reservations b WHERE b.room_id = r.room_id AND ((:begin >= b.begindate AND :begin < b.enddate) OR (:end > b.begindate AND :end <= b.enddate) OR (:begin <= b.begindate AND :end >= b.enddate)))", { replacements: {hotel_id: hotel_id, end: end, begin: begin},type: sequelize.QueryTypes.SELECT });
        res.send(andmed);
        console.log("Siia jõuan")
        //res.redirect(`/hotel/${hotel_id}`);
        console.log("Siia ei jõua")
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying query'});
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


app.post('/hotelregister', async (req, res) => {
    var hotelname = req.body.hotelname;
    var hotel_address = req.body.hotel_address;
    var stars = req.body.stars;

    console.log(stars)
    console.log(hotel_address)
    console.log(hotelname)
    try {
        await sequelize.query('INSERT INTO hotell (address, description) VALUES (:address, :description)',
            {replacements: {address: req.body.hotel_address, description: req.body.description}, type: sequelize.QueryTypes.INSERT });
        //res.status(200).send('Successfuly registered')
        res.redirect('/');
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