const Intercom = require('intercom-client');
const client = new Intercom.Client({ token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=' });


const updateCustomerInfo = (ch) => {
		    ch.assertQueue('CUSTOMER:UPDATE_CUSTOMER_INFO', {durable: true});

		    ch.consume('CUSTOMER:UPDATE_CUSTOMER_INFO', function(msg) {
		    	console.log("TOPIC9");

		    	const contentObject = JSON.parse(msg.content);

		    	const data = contentObject.data;

		    	const customer_id = contentObject.id;

		    	//If data has certain keys, corresponding information should be updated
	            if(data.mobile) {
	                //Mobile is available
	                client.users.update({
	                	user_id: customer_id,
	                	phone: data.mobile
	                }).then(result => {
	                	console.log("successfully updated mobile phone number");
	                }).catch(e => {

		    		});
	            }
	            if(data.email) {
	            	console.log("This is email");
	            	console.log(data.email);
	            	//Email is available
	                client.users.update({
	                	user_id: customer_id,
	                	email: data.email
	                }).then(result => {
	                	console.log("successfully updated email");
	                }).catch(e => {

		    		});
	            }
	            if(data.first_name || data.last_name) {
		            let nameString = `${data.first_name} ${data.last_name}`;
		            let updateNameString = nameString.trim();
		            console.log('updateNameString');
		            console.log(updateNameString);
			     	client.users.update({
			     		user_id: customer_id,
			     		name: updateNameString
			     	}).then(result => {
			     		console.log("successfully")
			     	});
	            }

	            if(data.tpp_type) {
	            	//Tpp is available
	            	let tempCustomAttributes = {};
	            	tempCustomAttributes['is_oauth_' + data.tpp_type] = true;
	            	client.users.update({
	            		user_id: customer_id,

	            	}).then(result => {

	            	}).catch(e => {

		    		});

	            }
		    });
}



module.exports.updateCustomerInfo = updateCustomerInfo;