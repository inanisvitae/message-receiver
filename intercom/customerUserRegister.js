const Intercom = require('intercom-client');
const config = require('config');
const client = new Intercom.Client(config.get('customer_management.intercom'));
const pg = require('pg');
const connPool = new pg.Pool(config.pg);

const customerUserRegister = (ch) => {
		//USER_REGISTER topic which will register the user
	ch.assertQueue('CUSTOMER:USER_REGISTER', {durable: true});
    ch.consume('CUSTOMER:USER_REGISTER', function(msg) {
    	console.log("TOPIC1");
    	//Doensn't need toString(), since the message has been jsonified
    	console.log(" [x] Received %s", msg.content);
    	const userObject = JSON.parse(msg.content);
    	//Preprocess to get result for intercom
    	const name = userObject.first_name + ' ' + userObject.last_name;

    	const user = {
    		name: name.trim(),
    		email: userObject.email,

    		//Is user_id customer_id?
    		user_id: userObject.customer_id,
    		phone: userObject.phone,

    		//signed_up_at

    		custom_attributes: {
				guest_id: null,
				is_from_guest: false,
				is_oauth_wechat: null,
				is_oauth_qq: null,

				num_orders: 0,
				total_payment: 0,
				category_slug_string: '',
				project_slug_string: '',
				status_num_pending: 0,
				status_num_paid: 0,
				status_num_drawing:0,
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
    		}
    	};

    	client.users.create(user)
    	.then(result => {
    		console.log("success");
    	}).catch(e => {

    	});

    }, {noAck: true});
}

// export default customerUserRegister;

module.exports.customerUserRegister = customerUserRegister;