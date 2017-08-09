// import Intercom from 'intercom-client';
const config = require('config');
const Intercom = require('intercom-client');
//Should use token to initialize a client object
const client = new Intercom.Client(config.get('customer_management.intercom'));
const pg = require('pg');
const connPool = new pg.Pool(config.pg);
// import customerUserRegister from './customer.userRegister';
const customerUserRegister = require('./customerUserRegister.js').customerUserRegister;
const userAutomaticRegister = require('./customerUserAutomaticRegister.js').userAutomaticRegister;
const completePayment = require('./orderCompletePayment.js').completePayment;
const updateOrderStatus = require('./orderUpdateOrderStatus.js').updateOrderStatus;
const deletePendingOrder = require('./orderDeletePendingOrder.js').deletePendingOrder;
const createOrder = require('./orderCreateOrder.js').createOrder;
const syncGuestOrders = require('./customerSyncGuestOrders.js').syncGuestOrders;
const updateCustomerInfo = require('./customerUpdateCustomerInfo').updateCustomerInfo;
const orderBackendUpdateOrderStatus = require('./orderBackendUpdateOrderStatus').orderBackendUpdateOrderStatus;



const addListenerIntercom = (conn) =>{
	conn.then(result => {
		result.createChannel().then(ch => {
			// const topic1 = 'CUSTOMER:USER_REGISTER';
			// const topic2 = 'CUSTOMER:AUTOMATIC_USER_REGISTER';
			// const topic3 = 'ORDER:COMPLETE_PAYMENT';
			// const topic4 = 'ORDER:UPDATE_ORDER_STATUS';
			// const topic5 = 'ORDER:DELETE_PENDING_ORDER';
			// // const topic6 = 'ORDER:REFUND_ORDER';
			// const topic7 = 'ORDER:CREATE_ORDER';
			// const topic8 = 'CUSTOMER:SYNC_GUEST_ORDERS';
			// const topic9 = 'CUSTOMER:UPDATE_CUSTOMER_INFO';

			customerUserRegister(ch);

			userAutomaticRegister(ch);

			completePayment(ch);

			updateOrderStatus(ch);

			deletePendingOrder(ch);

			createOrder(ch);

		    //ORDER:REFUND_ORDER
			// ch.assertQueue(topic6, {durable: true});

		 //    ch.consume(topic6, function(msg) {
		 //    	//Doensn't need toString(), since the message has been jsonified
		 //    	console.log(" [x] Received2 %s", msg.content);

		 //    	const contentObject = JSON.parse(msg.content);

		 //    	const current_status = contentObject.current_status;

		 //    	const order_id = contentObject.order_id;

			// 	const customer_id = contentObject.customer_id;

			// 	//Should write a query to query for the original status

			// 	client.users.find({ user_id: customer_id })
			// 	.then((result) => {
			// 		client.users.update({
			// 			user_id: customer_id,
			// 			custom_attributes: {
			// 				// status_num_pending: Number.parseInt(result.body.custom_attributes.pending) - 1
			// 				status_num_refunded: Number.parseInt(result.body.custom_attributes.status_num_refunded) + 1,

			// 			}
			// 		}).then(result => {
			    			// console.log("Make sure that the status updating process is complete");
			    		// }).catch(e => {

		    			// });
			// 	}).catch(e => {

		    			// });

		 //    }, {noAck: true});

		 	// createOrder(ch);

		 	syncGuestOrders(ch);

		 	updateCustomerInfo(ch);

		}).catch(e => {

		});


		//Backend:
		// const backendTopic1 = 'ORDER:BACKEND_CLOSE_PENDING_ORDER';
		// const backendTopic2 = 'ORDER:BACKEND_UPDATE_ORDER';
		// // const backendTopic3 = 'CUSTOMER:BACKEND_DELETE_USER';
		// const backendTopic4 = 'ORDER:BACKEND_COMPLETE_ORDER';
		// const backendTopic5 = 'ORDER:BACKEND_REFUND_ORDER';
		// const backendTopicMerge = 'ORDER:BACKEND_UPDATE_ORDER_STATUS';



		orderBackendUpdateOrderStatus(ch);


		// ch.assertQueue(backendTopic1, {durable: true});
		// ch.consume(backendTopic1, function(msg) {
		// 	const contentObject = JSON.parse(msg.content);
		// 	const orderId = contentObject.ids;

		// 	//Write a query to get customer id of the order with id orderId and decrement
		// 	//the pending and increment the status_num_closed
		// 	const query1 = `SELECT customer_id FROM public.order WHERE id = ${orderId}`;
		// 	connPool.query(query1, [], (err, result) => {
		// 		if(err) {
		// 			console.log("error retrieving");
		// 		}else{
		// 			try{
		// 				const temp = result.rows[0];

		// 				client.users.find({user_id: temp.customer_id})
		// 				.then((result) => {
		// 					let copyCustomAttributes = Object.assign({}, result.body.custom_attributes);
		// 					copyCustomAttributes.status_num_pending = Number.parseInt(copyCustomAttributes.status_num_pending);
		// 					copyCustomAttributes.status_num_closed = Number.parseInt(copyCustomAttributes.status_num_closed);
		// 					copyCustomAttributes.status_num_pending -= 1;
		// 					copyCustomAttributes.status_num_closed += 1;

		// 					client.users.update({
		// 						user_id: temp.customer_id,
		// 						custom_attributes: copyCustomAttributes
		// 					}).then(result => {
		// 	    				console.log("Make sure that the status updating process is complete");
		// 	    			}).catch(e => {

		//     				});
		// 				}).catch(e => {

		//     			});
		// 			}catch(e){
		// 				console.log("error");
		// 				console.log(e);
		// 			};

		// 		}
		// 	});

		// });

		// //ORDER:BACKEND_UPDATE_ORDER
		// ch.assertQueue(backendTopic2, {durable: true});
		// ch.consume(backendTopic2, function(msg) {

		// 	const contentObject = JSON.parse(msg.content);

		// 	const oldStatus = contentObject.old_status;
		// 	const newStatus = contentObject.new_status;

		// 	const email = data.email;

		// 	if(email) {

		// 		client.users.find({email: email}).then((result) => {
		// 			let copyCustomAttributes = Object.assign({}, result.body.custom_attributes);
					
		// 			copyCustomAttributes['status_num_' + oldStatus] = Number.parseInt(copyCustomAttributes['status_num' + oldStatus]);
		// 			copyCustomAttributes['status_num_' + newStatus] = Number.parseInt(copyCustomAttributes['status_num' + newStatus]);

		// 			copyCustomAttributes['status_num_' + oldStatus] -= 1;
		// 			copyCustomAttributes['status_num_' + newStatus] += 1;

		// 			client.users.update({
		// 				email: email,
		// 				custom_attributes: copyCustomAttributes
		// 			}).then((result) => {

		// 			}).catch(e => {

		//     		});					
		// 		});

		// 	}else{
		// 		//Maybe should query for the order

		// 	}

		// });

		// //CUSTOMER:BACKEND_DELETE_USER
		// // ch.assertQueue(backendTopic3, {durable: true});
		// // ch.consume(backendTopic3, function(msg) {
		// // 	const contentObject = JSON.parse(msg.content);
		// // 	const customerId = contentObject.ids;

		// // 	client.users.delete({user_id: customerId})
		// // 	.then(result => {
		// // 		console.log("Deleted user %s", customerId);
		// // 	}).catch(e => {
		// // 		console.log("Unable to delete user %s", customerId);
		// // 	});

		// // });

		// //ORDER:BACKEND_COMPLETE_ORDER
		// ch.assertQueue(backendTopic4, {durable: true});
		// ch.consume(backendTopic4, function(msg) {
		// 	const contentObject = JSON.parse(msg.content);
		// 	const oldStatus = contentObject.old_status;
		// 	const newStatus = contentObject.new_status;

		// 	if(email) {
		// 		client.users.find({email: email}).then((result) => {
		// 			let copyCustomAttributes = Object.assign({}, result.body.custom_attributes);
					
		// 			copyCustomAttributes['status_num_' + oldStatus] = Number.parseInt(copyCustomAttributes['status_num_' + oldStatus]);
		// 			copyCustomAttributes['status_num_' + newStatus] = Number.parseInt(copyCustomAttributes['status_num_' + newStatus]);

		// 			copyCustomAttributes['status_num_' + oldStatus] -= 1;
		// 			copyCustomAttributes['status_num_' + newStatus] += 1;

		// 			client.users.update({
		// 				email: email,
		// 				custom_attributes: copyCustomAttributes
		// 			}).then((result) => {

		// 			}).catch(e => {

		//     			});					
		// 		});
		// 	}else{
		// 		//Maybe should query for the order

		// 	}
		// });

		// //ORDER:BACKEND_REFUND_ORDER
		// ch.assertQueue(backendTopic5, {durable: true});
		// ch.consume(backendTopic5, function(msg) {
		// 	const contentObject = JSON.parse(msg.content);
		// 	const oldStatus = contentObject.old_status;
		// 	const newStatus = contentObject.new_status;

		// 	if(email) {
		// 		client.users.find({email: email}).then((result) => {
		// 			let copyCustomAttributes = Object.assign({}, result.body.custom_attributes);
					
		// 			copyCustomAttributes['status_num' + oldStatus] = Number.parseInt(copyCustomAttributes['status_num' + oldStatus]);
		// 			copyCustomAttributes['status_num' + newStatus] = Number.parseInt(copyCustomAttributes['status_num' + newStatus]);

		// 			copyCustomAttributes['status_num' + oldStatus] -= 1;
		// 			copyCustomAttributes['status_num' + newStatus] += 1;

		// 			client.users.update({
		// 				email: email,
		// 				custom_attributes: copyCustomAttributes
		// 			}).then((result) => {

		// 			}).catch(e => {

		//     			});					
		// 		});
		// 	}else{
		// 		//Maybe should query for the order

		// 	}


		// });

	}).catch(e => {

	});

}

// export default addListenerIntercom;

module.exports.addListenerIntercom = addListenerIntercom;