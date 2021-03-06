// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	server = require('http').createServer(app)
	io = require('socket.io').listen(server)
	//cfg = require('./config.' + env)
	cfg = {};
	
cfg.env = 'dev';
cfg.hostname = 'local.sincemonday.net';
cfg.httpPort = process.env.PORT || 3001;
cfg.siteName = 'socketach';

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

// App
app.configure(function(){
	app	.use(express.logger())
		//.use(express.favicon(__dirname + '/static/favicon.ico'))
		.use(express.static(__dirname + '/static'))
		.use(express.bodyParser())
		//.use(express.csrf())
		.use(app.router)
		.set('view engine', 'ejs');
		
	app.enable('trust proxy');
});

// Pages
app.get('/', function(req, res) {
	res.render('main', {
		siteName: cfg.siteName
	});
});

// API
messages = [];

addMessage = function(msg, callback) {
	var message = {
		id: messages.last() ? messages.last().id + 1 : 0,
		msg: msg,
		ts: new Date().getTime()
	}
	messages.push(message);
	if (messages.length > 30) {
		messages.shift();
	}
	if (isFunction(callback)) {
		callback(message);
	}
};

isFunction = function(functionToTest) {
	return functionToTest && {}.toString.call(functionToTest) === '[object Function]';
}

var defaultRoom = 'main';

io.sockets.on('connection', function(socket) {
	//var intervalId = false;
	
	socket.on('enter', function(data, callback) {
		socket.room = defaultRoom;
		socket.join(socket.room);
		
		addMessage('SERVER: user ' + socket.id + ' has entered', function(commitedMessage) {
			socket.broadcast.to(socket.room).emit('update', commitedMessage);
			socket.emit('initMessages', {list: messages});
			
			if (isFunction(callback)) {
				callback(commitedMessage);
			}
		});
	});
	
	socket.on('post', function(data, callback) {
		addMessage(data.msg, function(commitedMessage) {
			socket.broadcast.to(socket.room).emit('update', commitedMessage);
			
			if (isFunction(callback)) {
				callback(commitedMessage);
			}
		});
	});
	
	/*intervalId = setInterval(function() {
		console.log('interval broadcast ' + new Date().getTime());
		io.sockets.in(socket.room).emit('update', addMessage(socket.id + ' ' + new Date().getTime() + 0));
	}, 3000);*/
	
	socket.on('disconnect', function() {
		socket.broadcast.to(defaultRoom).emit('update', addMessage('SERVER: user ' + socket.id + ' has quit'));
		/*if (intervalId !== false) {
			clearInterval(intervalId);
		}*/
	});
});

server.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
