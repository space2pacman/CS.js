const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const config = {
	server: {
		header: "I", // I - info
		protocol: "0",
		name: "CS NODE.JS",
		map: "cs_mansion",
		folder: "cstrike",
		game: "Counter-Strike",
		id: 10, // 0x0a + 0x00
		players: 0,
		maxPlayers: 24,
		bots: 0,
		type: "d", // "d" for a dedicated server 0x64
		environment: "w", // "w" for Windows 0x77
		visibility: 0, // 0 - public, 1 - private
		vac: 0, // 0 - unsecured, 1 - secured
		version: "1.1.2.6"
	},
	port: 27015
}

class RequestInfo {
	constructor(server, player) {
		this._server = server;
		this._player = player;
		
		this._init();
	}

	_init() {
		let info = new Info(config)
		this._server.send(info.getData(), this._player);
	}
}

class Info {
	constructor(config) {
		this._config = config;
		this._data = [0xff,0xff,0xff,0xff];
		this._init();
	}


	getData() {
		return this._data;
	}

	_init() {
		for(let key in this._config.server) {
			let value = this._config.server[key];

			if(typeof value === "number") { // fix style
				if(key === "id") {
					this._data.push(value);
					this._data.push(0);
				} else {
					this._data.push(value);
				}
			}


			for(let i = 0; i < value.length; i++) {
				this._data.push(value[i].charCodeAt())
			}
			switch(key) {
				case "name":
				case "map":
				case "folder":
				case "game":
				case "version":
						
					this._data.push(0);

					break;
			}
		}
	}
}

class Server {
	constructor(socket, config) {
		this._socket = socket;
		this._config = config;

		this._init();
	}

	send(buffer, player) {
		let packet = new Buffer.from(buffer);

		this._socket.send(packet, 0, packet.length, player.port, player.address);
	}

	onMessage(data, player) {
		var packet = new Buffer.from(data).slice(4); // first 4 byte - 0xff
		let opcode = packet[0];

		switch(opcode) {
			case 0x54:
				new RequestInfo(this, player);

				break;
		}
	}

	onListening() {
		const address = this._socket.address();
		console.log(`server listening ${address.address}:${address.port}`);
	}

	onError() {
		console.log(`server error:\n${err.stack}`);
		this._socket.close();
	}

	_init() {
		this._socket.on("error", this.onError.bind(this));
		this._socket.on("listening", this.onListening.bind(this));
		this._socket.on("message", this.onMessage.bind(this));
		this._socket.bind(this._config.port);
	}
}

var server = new Server(socket, config);