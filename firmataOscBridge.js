var firmata = require('firmata');
var osc = require('node-osc');
var oscClient = new osc.Client('127.0.0.1', 57120);
var oscServer = new osc.Server(14444, '0.0.0.0');

/*
 ** DRAFT for a bridge between osc and firmata **

 * "server" boots up, creates serial connection
 * provides certain actions:
	/f/pinmode [[pin mode], ...]
	/f/write [[pin data], ...]
	/f/getdata [pin1, pin2, ...] 	// activates or deactivates reader (which sends back values 
									// as individual osc messages)

 */


// open connection to board
var board = new firmata.Board('/dev/tty.usbserial-AH00MQ4H', function(){
	console.log("connected to board, waiting for osc stuff to happen...");
});


oscServer.on("message", function (msg, rinfo) {
	console.log("Message: " + msg);
	if(!board) {
		console.log("No connection to board available!");
	} else { // this feels so wrong...
		
		// set pinmode, see (firmata-)modes below
		if(msg[0] == '/f/pinmode') {
			console.log("Setting pinmode");
			for (var i=1; i < (msg.length); i = i + 2) {
				console.log("Pin " + msg[i] + ", mode " + msg[i + 1]);
				board.pinMode(msg[i], msg[i+1]);
			};
		}
	
		// write data to pin
		if(msg[0] == '/f/write') {
			console.log("write data to pin");
			for (var i=1; i < (msg.length); i = i + 2) {
				console.log("Pin " + msg[i] + ", data " + msg[i + 1]);
				if (board.pins[i].mode == 1) {
					// digital mode            
					console.log("Digital Write");
					board.digitalWrite(msg[i], Math.round(msg[i+1]));
				} else if (board.pins[i].mode == 3) {
					// analog (pwm) mode, convert from float 0..1 to int 0..255
					var val = msg[i+1];
					val = Math.round(val * 255);
					val = Math.min(val, 255);
					val = Math.max(val, 0);
					board.analogWrite(msg[i], Math.round(msg[i+1] * 255));
				};
			};
		}
		
		// activate answering machine
		if(msg[0] == '/f/getdata') {
			console.log("Get data");
			for (var i=1; i < (msg.length); i++) {
				console.log("Pin " + msg[i]);
				var pinIndex = msg[i];
				var pin = board.pins[pinIndex];
				var mode = pin.mode;
				console.log(mode);
				if (mode == 0) { // digital read
					board.digitalRead(pinIndex, function(value){
						var val = value;
						console.log(["analog", pinIndex, value]);
						oscClient.send('/f/data', pinIndex, val);
					});
				};
				if (mode == 2) { // analog read
					board.analogRead(pinIndex, function(value) {
						var val = value / 1024; // scale down to (float)0..1
						// console.log(["analog", pinIndex, value]);
						oscClient.send('/f/data', pinIndex, val);
					});
				};
			};
		}
	}
});

// firmata pin modes
// {
//  INPUT:0x00,
//  OUTPUT:0x01,
//  ANALOG:0x02,
//  PWM:0x03,
//  SERVO:0x04   
// }