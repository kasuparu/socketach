// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	server = require('http').createServer(app)
	io = require('socket.io').listen(server)
	cfg = require('./config.' + env);

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
io.sockets.on('connection', function(socket) {
	socket.on('enter', function(data) {
		socket.room = 'chat';
		socket.join(socket.room);
		socket.emit('update', 'SERVER: you have connected to ' + socket.room);
		socket.broadcast.to(socket.room).emit('update', 'SERVER: some user has entered ' + socket.room);
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
