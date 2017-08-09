const Intercom = require('intercom-client');
const config = require('config');
const client = new Intercom.Client(config.get('customer_management.intercom'));
const pg = require('pg');
const connPool = new pg.Pool(config.pg);


const updateOrderStatus = (ch) => {
		 	//ORDER:UPDATE_ORDER_STATUS to update the status of the order * debugged
			ch.assertQueue('ORDER:UPDATE_ORDER_STATUS', {durable: true});

		    ch.consume('ORDER:UPDATE_ORDER_STATUS', function(msg) {
		    	//Doensn't need toString(), since the message has been jsonified
		    	console.log("TOPIC4");

		    	console.log(" [x] Received2 %s", msg.content);

		    	const contentObject = JSON.parse(msg.content);

		    	const current_status = contentObject.current_status;

		    	const previous_status = contentObject.previous_status;

		    	const customer_id = contentObject.customer_id;

		    	const guest_id = contentObject.guest_id;

		    	// const previous_status_temp = 'status_num_' + previous_status;

		    	// const current_status_temp = 'status_num_' + current_status;

		    	let queryWithCustomerId = `SELECT customer_id, guest_id, status, promoter_id, payment, id, deleted_at FROM public.order WHERE customer_id = ${customer_id};`
		    	
		    	let queryWithCustomerIdWithPromoterUsername = `SELECT t1.customer_id AS customer_id, t1.guest_id AS guest_id, t1.status AS status, t1.promoter_id AS promoter_id, t1.payment AS payment, t1.id AS id, t1.deleted_at AS deleted_at, t2.username AS username FROM(SELECT customer_id, guest_id, status, promoter_id, payment, id, deleted_at FROM public.order WHERE customer_id = ${customer_id}) t1, (SELECT username, id FROM public.promoter) t2 WHERE t2.id = t1.promoter_id;`;

		    	console.log("queryWithCustomerId");
		    	console.log(queryWithCustomerId);

		    	const completedOrdersSignature = ['paid', 'waiting_for_delivery', 'deliverd', 'waiting_for_pickup', 'completed'];

		    	if(customer_id) {
		    		connPool.query(queryWithCustomerId, [], (err, result) => {
		    			if(err) {
		    				console.log("Error connecting to pg");
		    			}else{
		    				let totalPayment = 0;

		    				let statusMap = new Map();

		    				let num_orders = 0;

		    				let change = {};

		    				if(result.rows.length > 0) {
		    					result.rows.forEach(element => {
		    						totalPayment += Number.parseInt(element.payment);

		    						//Should also check whether a pending order has been deleted or not
		    						let currentStatus = 'status_num_' + element.status;

		    						//To check the status to see whether it's a deleted pending order
		    						if(element.status === 'pending') {
		    							if(element.deleted_at) {
		    								currentStatus += '_deleted';
		    							}
		    						}

		    						if(completedOrdersSignature.indexOf(element.status) != -1) {
		    							num_orders += 1;
		    						}

		    						

		    						if(statusMap.has(currentStatus)) {
		    							statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
		    						}else{
		    							statusMap.set(currentStatus, 1);
		    						}

		    						//Should insert promoter

		    						console.log("destructuring");
		    					});

		    					console.log([...statusMap]);
	    						[...statusMap].forEach(element2 => {
	    							change[element2[0]] = element2[1];
	    						});

		    					change['num_orders'] = num_orders;
		    					change['total_payment'] = totalPayment;

    							console.log("change");
    							console.log(change);
		    					client.users.update({
	    							user_id: contentObject.customer_id,
	    							custom_attributes: change
		    					}).then(result => {
		    						
		    					});
		    				}else{
		    					console.log("There is no corresponding customer_id or there is no order");
		    				}
		    			}
		    		});
		    	}else{
		    		if(contentObject.email) {
		    			let queryWithEmail = `SELECT customer_id, guest_id, status, promoter_id, payment, id FROM public.order WHERE email = ${contentObject.email};`
		    			console.log("queryWithEmail");
		    			console.log(queryWithEmail);
		    			connPool.query(queryWithEmail, [], (err, result) => {
		    				if(err) {
		    					console.log("Error executing query")
		    				}else{

			    				let totalPayment = 0;

			    				let statusMap = new Map();

			    				let num_orders = 0;

			    				let change = {};

		    					if(result.rows.length > 0) {
			    					result.rows.forEach(element => {
			    						totalPayment += Number.parseInt(element.payment);
			    						const currentStatus = 'status_num_' + element.status;
			    						if(completedOrdersSignature.indexOf(element.status) != -1) {
			    							num_orders += 1;
			    						}

			    						if(statusMap.has(currentStatus)) {
			    							statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
			    						}else{
			    							statusMap.set(currentStatus, 1);
			    						}
			    					});
			    					console.log([...statusMap]);
		    						[...statusMap].forEach(element2 => {
		    							change[element2[0]] = element2[1];
		    						});
			    					
			    					change['num_orders'] = num_orders;

			    					change['total_payment'] = totalPayment;

	    							console.log("change");
	    							console.log(change);	
			    					client.users.update({
		    							email: contentObject.email,
		    							custom_attributes: change
			    					}).then(result => {
			    						
			    					});
		    					}else{
		    						console.log("There is no corresponding customer_id or there is no order");

		    					}
		    				}
		    			});
		    		}
		    	}



		    	// console.log("-------0-0--------");
		    	// console.log(previous_status_temp);
		    	// console.log(current_status_temp);
		    	// if(customer_id) {
			    // 	client.users.find({user_id: customer_id})
			    // 	.then((result) => {
			    // 		let newCustomAttributes = Object.assign({}, result.body.custom_attributes);
			    // 		console.log("typo");
			    // 		console.log(typeof newCustomAttributes[previous_status_temp]);
			    // 		console.log("newCustomAttributes----x1");
			    // 		console.log(newCustomAttributes);
		    	// 		if(newCustomAttributes[previous_status_temp] > 0) {
		    	// 			newCustomAttributes[previous_status_temp] -= 1;
		    	// 		}
			    // 		newCustomAttributes[current_status_temp] += 1;
			    // 		console.log("newCustomAttributes----x2");
			    // 		console.log(newCustomAttributes);
			    // 		client.users.update({
			    // 			user_id: customer_id,
			    // 			custom_attributes: newCustomAttributes
			    // 		}).then(result => {
			    // 			console.log("Make sure that the status updating process is complete");
			    // 		}).catch(e => {

		    	// 		});
			    // 	}).catch(e => {

		    	// 	});
		    	// }else{
		    	// 	if(contentObject.email) {
				   //  	client.users.find({email: contentObject.email})
				   //  	.then((result) =>{
				   //  		let newCustomAttributes = Object.assign({}, result.body.custom_attributes);
			    // 			console.log("typo");
			    // 			console.log(typeof newCustomAttributes[previous_status_temp]);
			    // 			console.log("newCustomAttributes----x1");
			    // 			console.log(newCustomAttributes);
			    // 			if(newCustomAttributes[previous_status_temp] > 0) {
			    // 				newCustomAttributes[previous_status_temp] -= 1;
			    // 			}
				    		
				   //  		newCustomAttributes[current_status_temp] += 1;
			    // 			console.log("newCustomAttributes----x2");
			    // 			console.log(newCustomAttributes);
				   //  		client.users.update({
				   //  			//Should update according to email
				   //  			email: contentObject.customer_email,
				   //  			custom_attributes: newCustomAttributes
				   //  		}).then(result => {
			    // 				console.log("Make sure that the status updating process is complete");
			    // 			}).catch(e => {

		    	// 			});
				   //  	}).catch(e => {

		    	// 		});
		    	// 	}

		    	// }

		    }, {noAck: true});
}


module.exports.updateOrderStatus = updateOrderStatus;