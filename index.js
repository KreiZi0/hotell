const express = require('express');
const app = express();
const sequelize = require('./database');
const pug = require('pug');
const jwt = require('jsonwebtoken');
app.set('view engine', 'pug');
app.use(express.static('public'))
const bodyParser = require('body-parser')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const dotenv = require('dotenv');
dotenv.config();
const crypto = require("crypto");
const { type } = require('os');

function generateAccessToken(email) {
    // Return a signed JWT token that lasts 30 minutes
    return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  }


function authenticateToken(req, res, next) {
    // Check if supplied token is not expired and generated by our server
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, email) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.email = email
        next()
    })
}

app.post('/createJWT', async (req, res) => {
    // Generate JWT token for specified username
    try {
        const emailResponse = await sequelize.query('SELECT email from omanikud WHERE password = :hash AND email = :email', { replacements: {hash: crypto.createHash("sha256").update(req.body.password).digest("hex"), email: req.body.email}, type: sequelize.QueryTypes.SELECT });
        const email = emailResponse[0]
        console.log(generateAccessToken(email))
        res.status(200).json(generateAccessToken(email))
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went a-wucky :(')
    }
});

app.get('/', async (req, res) => {
    // Return the index view with all hotel data
    console.log(process.env.TOKEN_SECRET)
    try {
        const hotell = await sequelize.query('SELECT * FROM hotell', { type: sequelize.QueryTypes.SELECT });
        res.render('index', {hotell});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to return all the hotels' });
    }
});

app.post('/reserveRoom', async (req, res) => {
    // Reserve a random room of specified hotel and roomtype
    try {
        await sequelize.query("INSERT INTO reservations (room_id, begindate, enddate, comments) SELECT room_id, :begin, :end, :comment FROM rooms WHERE hotell_id = 1 AND type = :roomtype AND room_id NOT IN (SELECT room_id FROM reservations WHERE begindate <= :begin AND enddate >= :end)", { replacements: {roomtype: req.body.roomtype, comment: req.body.comment, hotel_id: req.body.hotel_id, end: req.body.enddate, begin: req.body.begindate, roomtype: req.body.roomtype}, type: sequelize.QueryTypes.INSERT });
        res.status(200).send('Successful reservation');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'That date seems to be already taken, sorry'});
    }
});

app.post('/getAvailableRooms', async (req, res) => {
    // Get all available roomtypes that are not in a time conflict from specified hotel
    try {
        const andmed = await sequelize.query("SELECT DISTINCT r.type FROM rooms r WHERE r.hotell_id = :hotel_id AND NOT EXISTS (SELECT 1 FROM reservations b WHERE b.room_id = r.room_id AND ((:begin >= b.begindate AND :begin < b.enddate) OR (:end > b.begindate AND :end <= b.enddate) OR (:begin <= b.begindate AND :end >= b.enddate)))", { replacements: {hotel_id: req.body.hotel_id, end: req.body.enddate, begin: req.body.begindate},type: sequelize.QueryTypes.SELECT });
        res.status(200).send(andmed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying query'});
    }

});

app.get('/hotel/:id', async (req, res) => {
    // Return a specific hotel sub-page by ID
    try {
        const andmed = await sequelize.query('SELECT * FROM hotelli_andmed where hotelli_id_fk = :id', { replacements: {id: req.params.id},type: sequelize.QueryTypes.SELECT });
        const sendable = andmed[0]
        res.render('hotel', {sendable});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to select * from hotellid' });
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

app.post('/registering', async (req, res) => {
    // Register as a owner of a hotel
    try {
        await sequelize.query('INSERT INTO omanikud (perenimi, eesnimi, email, password, isikukood) VALUES (:perenimi, :eesnimi, :email, :password, :isikukood)',
            {replacements: {eesnimi: req.body.eesnimi, perenimi: req.body.perenimi, email: req.body.email, password: crypto.createHash("sha256").update(req.body.password).digest("hex"), isikukood: req.body.isikukood}, type: sequelize.QueryTypes.INSERT });
        res.render('hotel-register');
    } catch (error) {
        // Return diffrent msgs based if user exists already or not.
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(403)
            res.send({ status: 'error', message: "User already exists"});
        } else {
            res.status(500)
            res.send({ status: 'error', message: "Something went wrong"});
        }
    }
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000.');
});