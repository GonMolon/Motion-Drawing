var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var http = require('http');

var index = require('./routes/index');

var app = express();
var server = http.createServer(app);
var io = socketio(server);
app.server = server;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

io.on('connection', function (socket) {
    socket.on('leap-event', function (data) {
        io.emit('leap-event-client', data);
        console.log("LEAP: " + data);
    });

    socket.on('trackpad-event', function(data) {
        io.emit('trackpad-event-client', data);
        console.log("TRACKPAD: " + data.x + " " + data.y);
    })
});

module.exports = app;
