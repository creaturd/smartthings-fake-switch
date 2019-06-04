var mqtt = {
	host: "m24.cloudmqtt.com",
	port: 30898,
	client: "smartthings-ibm-switch",
	username: "qazcrtmu",
	password: "cnT3gGvRSFEd"
};


Client = undefined;
Dimmer = 100;
On = false;

function setBulb(on, dimmer = 100) {
	var offset = on ? dimmer : 0;
	var r = 255;
	var g = Math.round(255 - 48.0*offset/100.0);
	var b = Math.round(255 - 255.0*offset/100.0);
	var rgb = 'rgb('+r+','+g+','+b+')';	
	$("#bg").css({'background-color':rgb}); 
	$("#state").text(on ? dimmer + '%' : 'off');

	console.log(rgb);
}

function setState(isOn) {
	console.log('Set state: ' + isOn ? 'on' : 'off');
	On = isOn;
	setBulb(On, Dimmer);
}
function setDimmer(value) {
	console.log('Set dimmer: ' + value);
	Dimmer = value;
	setBulb(On, Dimmer);
}

function onError() {
	console.warn("Connection error!");
}
function onConnected() {
	console.log("connected");
	Client.subscribe("devices/"+mqtt.username+"/#");
	try {
		setBulb(false);
	} catch(e) {

	}
};

function onConnectionLost(responseObject) {
	console.warn("Disconnected!");
	if (responseObject.errorCode !== 0) {

	}
};

function onMessageArrived(message) {

	try {
		var str = message.payloadString;
		var obj = undefined;
		var eui = "";

		try {
			obj = JSON.parse(str);
			data = obj[0];
			console.log(data);

			switch (data.capability) {
				case 'st.switch':
					switch (data.command) {
						case 'off': setState(false); break;
						case 'on': setState(true); break;
						default: 
							console.error("Unknown command " + data.command);
					}
					break;
				case 'st.switchLevel':
					if (data.command == 'setLevel') {
						var level = data.arguments[0] || 100;
						setDimmer(level);
					} else {
						console.error("Unknown command " + data.command);
					}
					break;
				default:
					console.error("Unknown capability " + data.capability);
			}
		} catch (e) {
			console.error("Not a valid JSON: " + str);
			return;
		}

	

	} catch(E) {
		console.error(E);
	}


};

function connect(host) {
	var h = typeof host === "undefined" ? mqtt.host : host;
	console.log("Connecting to "+ h);
	Client = new Paho.MQTT.Client(h, mqtt.port, mqtt.client);
	Client.onConnectionLost = onConnectionLost;
	Client.onMessageArrived = onMessageArrived;
	Client.connect({
		useSSL: true,
		userName: mqtt.username,
		password: mqtt.password,
		onSuccess: onConnected,
		onFailure: onError
	});
}

$(document).ready(function(){
	
	connect();
	
});

