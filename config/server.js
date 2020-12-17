// Module dependencies.
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client = redis.createClient();
const logger = require('morgan');
const debug = require('debug')('awesome-chat-application:server');
const http = require('http');
const socket = require('socket.io');
const moment = require('moment');
const db = require('./db');
const { userJoin, getOnlineUsers } = require('./users');

const app = express();

const indexRouter = require('../routes/index');
const loginRouter = require('../routes/entry-routes/login');
const registerRouter = require('../routes/entry-routes/register');
const forgotPasswordRouter = require('../routes/entry-routes/forgot-password');
const verificationRouter = require('../routes/entry-routes/verification');
const newPasswordRouter = require('../routes/entry-routes/new-password');

const chatRouter = require('../routes/chat-routes/chat');

// view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(session({
    secret: "secret keyword",
    store: new redisStore({ host: 'localhost', port: 6379, client: client, ttl: 1000 }),
    resave: false,
    saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/forgot-password', forgotPasswordRouter);
app.use('/verification', verificationRouter);
app.use('/new-password', newPasswordRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);

// Listen on provided port, on all network interfaces.
/**
 * if and only if database connection is successful.
 */
db.connect(err => {
    if (err) {
        console.log('Unable to connect to mongodb server\n', err);
        process.exit(1);
    } else {
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
        console.log(`Running on PORT ${port}...`);
        console.log(`Mongodb connection on PORT 27017`);
        console.log('Redis server connection on PORT 6379');
    }
});

// Creating the io stream
const io = socket(server);

io.on('connection', socket => {
    // if a user logs in, online members of
    // his/her groups will increase by 1
    socket.on('groupSelection', (info, group) => {
        const user = userJoin(socket.id, info, group);
        socket.join(user.groupID);
        io.to(user.groupID).emit('online', getOnlineUsers(user.groupID));
    });

    socket.on('output', (admin, message, groupID) => {
        message.date = moment().format('MM/DD/YYYY');
        message.time = moment().format('hh:mm A');
        io.to(groupID).emit('input', admin, message);
        // saving messages into db
        db.getDB().collection(groupID).insertOne(message, (err, data) => {
            if (err) console.log(err);
        });
    });
});

// Normalize a port into a number, string, or false.
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// Event listener for HTTP server "listening" event.
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}