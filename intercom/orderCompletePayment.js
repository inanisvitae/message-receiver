const Intercom = require('intercom-client');
const client = new Intercom.Client({ token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=' });
const pg = require('pg');
const config = require('../config').config;
const connPool = new pg.Pool(config.pg);


const completePayment = (ch) => {
		    //ORDER:COMPLETE_PAYMENT topic which will submit an order * debugged
			ch.assertQueue('ORDER:COMPLETE_PAYMENT', {durable: true});

		    ch.consume('ORDER:COMPLETE_PAYMENT', function(msg) {
		    	//Doensn't need toString(), since the message has been jsonified
		    	console.log("COMPLETE_PAYMENT_CONSOLE");
		    	console.log(" [x] Received2 %s", msg.content);

		    	const contentObject = JSON.parse(msg.content);



		    	console.log("A contentObject----------");
		    	console.log(contentObject);

		    	const customer_id = contentObject.customer_id;

		    	let queryWithCustomerId = `SELECT customer_id, guest_id, status, promoter_id, payment, id FROM public.order WHERE customer_id = ${customer_id};`;
		    	
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
		    						let currentStatus = 'status_num_' + element.status;

									//To check the status to see whether it's a deleted pending order
									if(element.status === 'pending') {
										if(element.deleted_at) {
											currentStatus += '_deleted';
										}
									}

		    						if(completedOrdersSignature.indexOf(element.status) !== -1) {
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
	    							user_id: contentObject.customer_id,
	    							custom_attributes: change
		    					}).then(result => {
		    						
		    					}).catch(e => {
		    						console.log("Error updating users");
		    					});
		    				}else{
		    					console.log("There is no corresponding customer_id or there is no order");
		    				}
		    			}
		    		});
		    	}


		    	//Should update status, numbers in custom_attributes and total_payment
		    	let userObject = client.users
		    	.find({ user_id: contentObject.customer_id })
		    	.then((result) => {
		   //  		console.log("find body");

		   //  		// console.log(result);

		   //  		let originalCustomAttributes = Object.assign({}, result.body.custom_attributes);
					
					// console.log("before---");

					// console.log(originalCustomAttributes);

					// if(originalCustomAttributes.total_payment) {
					// 	originalCustomAttributes.total_payment = Number.parseFloat(result.body.custom_attributes.total_payment) + Number.parseFloat(contentObject.total_charge);
					// }else{
					// 	originalCustomAttributes.total_payment = Number.parseFloat(contentObject.total_charge);
					// }
		    		
					// //Checks whether the num_orders is null
					// if(originalCustomAttributes.num_orders) {
			  //   		originalCustomAttributes.num_orders = Number.parseInt(result.body.custom_attributes.num_orders) + 1;
					// }else{
			  //   		originalCustomAttributes.num_orders = 1;
					// }


		   //  		if(originalCustomAttributes.status_num_pending > 0) {
		   //  			originalCustomAttributes.status_num_pending -= 1;
		   //  		}
		    		
		   //  		console.log("after---");
		   //  		console.log(originalCustomAttributes);
		   //  		console.log("changelog");

		   //  		let changeOriginalCustomAttributes = {
		   //  			total_payment: originalCustomAttributes.total_payment,
		   //  			num_orders: originalCustomAttributes.num_orders,
		   //  			status_num_pending: originalCustomAttributes.status_num_pending
		   //  		}
		   //  		console.log(changeOriginalCustomAttributes);

		   //  		client.users.update({
			  //   		user_id: contentObject.customer_id,
			  //   		custom_attributes: originalCustomAttributes
		   //  		}).then(result => {

		   //  			console.log("After update......---");
		   //  			client.users.find({
		   //  				user_id: contentObject.customer_id
		   //  			}).then(result => {
		   //  				console.log("result.body ----- errorrr");
		   //  				console.log(result.body);
		   //  			}).catch(e => {

		   //  			});
		   //  		}).catch(e => {

		   //  		});


		    	}).catch(e => {

		    	});

		    }, {noAck: true});
}

module.exports.completePayment = completePayment;