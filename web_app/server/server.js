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

const userController = require ('./app/controllers/user.controller.js');
const subscriptionController = require ('./app/controllers/subscription.controller.js');
const User = require('./app/models/user.model.js').User;


// Connecting to the users database
mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then((client) => {
    console.log("Successfully connected to the database");
    require('./initiateAdmin.js');
    // set users collection in subscription controller in order to do metrics related to users collection
    /*User.find()
    .then(users => {
        console.log('users collection => ',users);
        subscriptionController.setUsersCollection(users);
    });*/
    subscriptionController.setUsersCollection(client.connection.db.collection('users'));  
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Connecting to the Replica Set, if you wanna test it, just uncomment the following line
//require('./changestream.js');

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to our application !"});
});

// Require Users routes
require('./app/routes/user.routes.js')(app);



//Middleware
app.use(express.json());

// require an http server which is essential for our socket-io
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');
    if(socket.handshake.query.subscription) {
    var subscription = JSON.parse(socket.handshake.query.subscription);
        console.log("SUBSCRIPTION IN SOCKET => ", subscription);
        // all good, now we need to send this as a param to initChangeStream()
        userController.initChangeStream(socket, subscription);
    };

    // handle updateSubscription
    socket.on('updateSubscription', (new_subscription) => {
        console.log('> Got an updateSubscription event in server.js');
        userController.initChangeStream(socket, new_subscription);
    });

    // hande disconnect event..
    socket.on('disconnect', () => {
        console.log('user closed connection (logout)');
    });

    // hande close event..
    socket.on('close', () => {
        socket.disconnect();
    });
});

// listen for requests
http.listen(3000, () => {
    console.log("Server is listening on port 3000");
});