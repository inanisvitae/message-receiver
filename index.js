// import config from 'config'
// import addListenerIntercom from './intercom.process'
// import addListenerMixpanel from './mixpanel.process'
const addListenerIntercom = require('./intercom/intercom.process').addListenerIntercom;
const addListenerMixpanel = require('./mixpanel/mixpanel.process').addListenerIntercom;
// import mixpanel from './mixpanel.process'
const amqp = require('amqplib');
// const config = require('config');


const establishConn = async () => {
	try{
		return await amqp.connect("amqp://localhost");
	}catch(e) {
		console.log("Failed to establish connection");
		return null;
	}
};

let conn = establishConn();

addListenerIntercom(conn);
addListenerMixpanel(conn);