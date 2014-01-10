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


/*
app.get('/t/:id(-?\\d+)/set', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if (req.params.id != 'undefined' && !isNaN(req.params.id)) {
		Timer.findById(parseInt(req.params.id), function(err, timer) {
			if (!err && timer) {
				if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
					userId = req.session.auth.twitter.user.id;
				} else {
					userId = -1;
				}
				
				if (timer.editAllowed(userId)) {
					var label = req.query.name;
					var goodVal = req.query.good;
					var publicVal = req.query.public;
					if (parseInt(req.query.id) == -1) {
						if (typeof req.query.last_restart != 'undefined' && req.query.last_restart && req.query.last_restart != '-1' && !isNaN(parseInt(req.query.last_restart))) {
							var last_restart = parseInt(req.query.last_restart);
							var date_selected = 1;
						} else {
							var last_restart = Math.round(new Date().getTime() / 1000);
							var date_selected = 0;
						}
					} else {
						var last_restart = -1;
					}
					timer.setProps(label, userId, last_restart, date_selected);
					timer.setGood(goodVal);
					timer.setPublic(publicVal);
					timer.save(function(err, timer) {
						if (!err && timer) {
							timer.showJsonCanEdit(function(err, timer) {
								res.send(err || timer);
							});
						} else {
							res.send({});
						}
					});
				} else {
					res.send({});
				}
			} else {
				res.send({});
			}
		});
	};
});

app.get('/u/random/:action(list|timers)', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	var action = req.params.action == 'list' ? 'getHandle' : 'getHandleTimers';
	
	Timer[action]('about_3random', function(err, handle) {
		if (handle) {
			res.send(action == 'list' ? handle.ids : handle);
		} else {
			res.send([]);
		}
		
	});
});
*/

server.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
