const Intercom = require('intercom-client');
const client = new Intercom.Client({ token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=' });



const deletePendingOrder = (ch) => {
		 	//ORDER:DELETE_PENDING_ORDER to update the status of the order
			ch.assertQueue('ORDER:DELETE_PENDING_ORDER', {durable: true});

		    ch.consume('ORDER:DELETE_PENDING_ORDER', function(msg) {
		    	console.log("TOPIC5");
		    	//Doensn't need toString(), since the message has been jsonified
		    	console.log(" [x] Received2 %s", msg.content);

		    	const contentObject = JSON.parse(msg.content);

		    	const order_id = contentObject.order_id;

		    	const customer_id = contentObject.customer_id;

				client.users.find({ user_id: customer_id })
				.then((result) => {
					let change = {
						status_num_pending: result.body.custom_attributes.status_num_pending - 1,
						status_num_pending_deleted: result.body.custom_attributes.status_num_pending_deleted + 1,
					};
					console.log("change x");
					console.log(change);
					client.users.update({
						user_id: customer_id,
						custom_attributes: change
					}).then(result => {
			    		console.log("Make sure that the status updating process is complete");
			    	}).catch(e => {
			    		console.log("error");
		    		});
				}).catch(e => {
					console.log("error retrieving customer_id");
				});

		    }, {noAck: true});
}



module.exports.deletePendingOrder = deletePendingOrder;