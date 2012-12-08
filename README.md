node-firmataOscBridge
=====================

Access Arduinoish things with OSC

By running this software you can access input and output pins on arduino-boards connected to your host over usb/serial (and running the firmata "default firmware") by OSC.

This is a quick'n'dirty hack with very limited functionality (for now)! Use at your own, erm, "risk". (It will probably be developed further in the near future, but I welcome you to improve it yourself!)

Useage
--------

* Connect your board
* Enter the path to the usb port/connection in line 20
* Start the host by calling ``node firmataOscBridge.js`` in a terminal
* Wait a couple of seconds until the connection is established
* Send the following OSC commands to the address defined in line 4 (line 3 defines the address to send data replies to):
	* ``/f/pinmode pin1 mode1 [pin2 mode2 ...]`` - set Pin mode of ``pin`` to ``mode`` (0 - digital in, 1 - digital out, 2 - analog in, 3 - analog out (pwm), 4 - servo(?))
	* ``/f/write pin1 value1 [pin2 value2 ...]`` - write data to pin. Provide digital values as 0 or 1 and analog values als floats from 0 to 1
	* ``/f/getdata pin1 value1 [pin2 value2 ...]`` - get data from pin. This actually starts sending data to the host address specified in ``firmataOscBridge.js line 3`` with the OSC message format ``/f/data pin value`` (with value being (bool)0|1 for digital or (float)0..1 for analog)

Dependencies
--------------

This script uses ``firmata``[1] and ``node-osc``[2]. You may install both with the great npm:

```
> npm install node-osc
> npm install firmata
```

[1] https://github.com/jgautier/firmata

[2] https://github.com/TheAlphaNerd/node-osc 