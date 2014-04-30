/*
 * lights-client.js
 * 
 * connects to lights via lights-bridge
 *
 * brings dealer to socket.io level
 *
 */
var zmq = require('zmq');
var dealer = zmq.socket('dealer');
var dealerport = 'ipc:///tmp/lights-lights.ipc';

var sub = zmq.socket('sub');
var subport = 'ipc:///tmp/lights-lights-pub.ipc';

dealer.connect(dealerport);
sub.connect(subport);
console.log("connected to port", dealerport);

var app = require('express')();
var serveStatic = require('serve-static');

app.use(serveStatic(__dirname + '/public'));

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	socket.on('command', function(data) {
		console.log('lights-client> Received:', data);
		try {
			dealer.send(JSON.stringify(data));
		} catch(e) {console.log(e)};
	});
});

dealer.on('message', function(data){
	console.log('lights-client> received from lights-lights:', JSON.parse(data));
	io.sockets.emit('message', JSON.parse(data));

});

sub.subscribe('');
sub.on('message', function(data) {
	console.log('lights-client> received from lights-lights-pub:', JSON.parse(data));
	io.sockets.emit('message', JSON.parse(data));
});




server.listen(9001);

