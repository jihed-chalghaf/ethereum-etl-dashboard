const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// enable cors
app.use(cors({
    origin: "http://localhost:4200"
}));


// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');


// Connecting to the users database
mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
    require('./initiateAdmin.js');    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Connecting to the Replica Set
require('./changestream.js');

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to our application !"});
});

// Require Users routes
require('./app/routes/user.routes.js')(app);



//Middleware
app.use(express.json());


// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});