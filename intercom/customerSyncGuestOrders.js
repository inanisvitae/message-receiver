const Intercom = require('intercom-client');
const client = new Intercom.Client({ token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=' });
const pg = require('pg');
const config = require('../config').config;
const connPool = new pg.Pool(config.pg);


//Generates the whole customer attributes object
const customAttributesReducer = (customer_id) => {

	client.users.find({ user_id: customer_id })
	.then((result) => {
		//Should deal with qq and wechat
		let copyCustomAttributes = {
			num_orders: 0,
			total_payment: 0,
			category_slug_string: '',
			project_slug_string: '',
			//Should be split into two
			status_num_pending: 0, // -1
			status_num_pending_deleted: 0, // +1
			status_num_paid: 0,
			status_num_waiting_for_delivery: 0,
			status_num_waiting_for_delivery_unpaid: 0,
			status_num_delivered: 0,
			status_num_waiting_for_pickup: 0,
			status_num_waiting_for_pickup_unpaid: 0,
			status_num_completed: 0,
			status_num_closed: 0,
			status_num_refund_pending: 0,
			status_num_refunded: 0,
			status_num_refund_failed: 0,

			promoter_username_string: '',
		};

		//Query may have some bugs
		const query = `SELECT t1.customer_id AS customer_id, t1.guest_id AS guest_id, t1.status AS status, t1.deleted_at AS deleted_at, t2.username AS promoter_username_string, t1.id AS id, t1.payment AS payment, t3.project_id AS project_id, t3.project_slug AS project_slug, t5.slug AS category_slug FROM(SELECT customer_id, guest_id, status, deleted_at, promoter_id, payment, id FROM public.order WHERE customer_id = ${ Number.parseInt(customer_id) }) t1, (SELECT username, id FROM public.promoter) t2, (SELECT project_slug, order_id, id, project_id FROM public.order_detail) t3, (SELECT project_id, category_id FROM public.project_to_category) t4, (SELECT slug, id FROM public.category) t5 WHERE t1.promoter_id = t2.id AND t3.order_id = t1.id AND t4.project_id = t3.project_id AND t3.category_id = t5.id; `;

		connPool.query(query, [], (err, result) => {
			if(!err) {
				if(result) {
					const rows = result.rows;

					//Changes num_orders
					copyCustomAttributes.num_orders = rows.length;
					
					let total_payment = 0;

					rows.forEach((element) => {
						const checkStatus = 'status_num_' + element.status;
						
						copyCustomAttributes[checkStatus] = Number.parseInt(copyCustomAttributes[checkStatus]);

						copyCustomAttributes[checkStatus] += 1;

						total_payment += Number.parseFloat(element.payment);

						if(!copyCustomAttributes.project_slug_string.includes(element.project_slug)) {
							if(copyCustomAttributes.project_slug_string === '') {
								copyCustomAttributes.project_slug_string = ',' + element.project_slug + ',';
							}else{
								copyCustomAttributes.project_slug_string += element.project_slug + ',';
							}
						}

						if(!copyCustomAttributes.category_slug_string.includes(element.category_slug)) {
							if(copyCustomAttributes.category_slug_string === '') {
								copyCustomAttributes.category_slug_string = ',' + element.category_slug + ',';
							}else{
								copyCustomAttributes.category_slug_string += element.category_slug + ',';
							}
						}

						if(!copyCustomAttributes.promoter_username_string.includes(element.username)) {
							if(copyCustomAttributes.promoter_username_string === '') {
								copyCustomAttributes.promoter_username_string = ',' + element.username + ',';
							}else{
								copyCustomAttributes.promoter_username_string += element.username + ',';
							}
						}

					});

					copyCustomAttributes.total_payment = total_payment;

					client.users.update({
						user_id: customer_id,
						custom_attributes: copyCustomAttributes
					}).then(result => {

					}).catch(e => {

					});

				}
			}
		});		
	}).catch((err) => {
		console.log("User doesn't exist");
	});

}



const syncGuestOrders = (ch) => {
		    //CUSTOMER:SYNC_GUEST_ORDERS synchronizes the orders
		    ch.assertQueue('CUSTOMER:SYNC_GUEST_ORDERS', {durable: true});

		    ch.consume('CUSTOMER:SYNC_GUEST_ORDERS', function(msg) {
		    	console.log("TOPIC8");

		    	const contentObject = JSON.parse(msg.content);

		    	const customer_id = contentObject.customer_id;

		    	const guest_id = contentObject.new_customer_id;

		    	//And reduce the custom_attributes
		    	customAttributesReducer(customer_id);

		    }, {noAck: true});
}

module.exports.syncGuestOrders = syncGuestOrders;