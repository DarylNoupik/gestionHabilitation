const config = require("./conf/config");
const logger = require("./conf/logger");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieParser = require('cookie-parser')

// Import
const allRoutes = require("./routes/index")

// Use cookies
app.use(cookieParser());

// Define public folder
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Use for authorization
app.use(cors());
app.options('*', cors());

// set the view using ejs
app.set('view engine', 'ejs');

// Routes
app.use("/", allRoutes);

app.listen(config.port, () => {
    (config.env == "production") && logger.info(`The server running with port ${config.port}`);
    console.log(`The server running with port ${config.port}`);
});