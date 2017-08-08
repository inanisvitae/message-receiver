const Intercom = require('intercom-client');
const client = new Intercom.Client({ token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=' });
const pg = require('pg');
const config = require('../config').config;
const connPool = new pg.Pool(config.pg);


const orderBackendUpdateOrderStatus = (ch) => {

	ch.assertQueue('ORDER:BACKEND_UPDATE_ORDER_STATUS', {durable: true});

	ch.consume('ORDER:BACKEND_UPDATE_ORDER_STATUS', function(msg) {
		const contentObject = JSON.parse(msg.content);
		const customer_id = contentObject.customer_id;
		
		let queryWithCustomerId = `SELECT customer_id, guest_id, status, promoter_id, payment, id FROM public.order WHERE customer_id = ${customer_id};`;

		const completedOrdersSignature = ['paid', 'waiting_for_delivery', 'deliverd', 'waiting_for_pickup', 'completed'];

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

					//Updates totalPayment
					change['total_payment'] = totalPayment;

					console.log("change");
					console.log(change);

					client.users.update({
						user_id: customer_id,
						custom_attributes: change
					}).then(result => {
						console.log("successfully changed");
					}).catch(e => {
						
					});
				}else{
					console.log("There is no corresponding customer_id or there is no order");
				}
			}
		});

	});
}

module.exports.orderBackendUpdateOrderStatus = orderBackendUpdateOrderStatus;