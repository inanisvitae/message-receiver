const Intercom = require('intercom-client');
const config = require('config');
const client = new Intercom.Client(config.get('customer_management.intercom'));
const pg = require('pg');
const connPool = new pg.Pool(config.pg);


const createOrder = (ch) => {
		    //ORDER:CREATE_ORDER: Should add 1 to total number of purchase *debugged
			ch.assertQueue('ORDER:CREATE_ORDER', {durable: true});

		    ch.consume('ORDER:CREATE_ORDER', function(msg) {
		    	console.log("TOPIC7");
		    	//Doensn't need toString(), since the message has been jsonified
		    	console.log(" [x] Received2 %s", msg.content);

		    	const contentObject = JSON.parse(msg.content);

		    	const customer_id = contentObject.customer_id;

		    	const guest_id = contentObject.guest_id;

		    	const order_id = contentObject.order_id;

		    	const email = contentObject.email;

		    	const project_slug = contentObject.project_slug;

		    	const project_id = contentObject.project_id;

		    	const status = contentObject.status;

		    	const query1 = `SELECT t2.id, t2.slug AS category_slug FROM(SELECT category_id FROM public.project_to_category WHERE project_id = '${Number.parseInt(project_id)}') t1, public.category t2 WHERE t1.category_id = t2.id;`;

				connPool.query(query1, [], (err, result) => {
					if(err) {
						console.log(err);
						console.log("Err");
					}else{
						console.log(result.rows[0]);
						if(result.rows.length > 0) {
							//There could be multiple results
							const category_slug = result.rows[0].category_slug;
					    	if(customer_id) {
					    		client.users.find({
					    			user_id: customer_id
					    		}).then((result) => {
					    			console.log("result---");
					    			console.log(result.body.custom_attributes);
					    			//Should look up in the database for the category and project
					    			// let change = {
					    			// 	user_id: customer_id,
					    			// 	custom_attributes: Object.assign({}, result.body.custom_attributes)
					    			// };
					    			//Only updates the diff
					    			let change = {
					    				user_id: customer_id,
					    				custom_attributes: {
					    					project_slug_string: '',
					    					category_slug_string: ''
					    				}
					    			};

					    			console.log("New status");
					    			console.log(status);
					    			console.log(change);
					    			console.log("A project_slug");
					    			console.log(project_slug);
					    			console.log("A category slug");
					    			console.log(category_slug);
					    			console.log("-------------");

					    			//Changes status no more, since will change later
					    			// change.custom_attributes['status_num_' + status] += 1;

					    			if(result.body.custom_attributes.project_slug_string) {
						    			if(!result.body.custom_attributes.project_slug_string.includes(project_slug)) {
						    				// change.custom_attributes.project_slug_string += project_slug + ',';
						    				change.custom_attributes.project_slug_string = result.body.custom_attributes.project_slug_string + project_slug + ',';
						    			}
					    			}else{
					    				change.custom_attributes.project_slug_string = ',' + project_slug + ',';
					    			}

					    			if(result.body.custom_attributes.category_slug_string) {
						    			if(!result.body.custom_attributes.category_slug_string.includes(category_slug)) {
						    				// change.custom_attributes.category_slug_string += category_slug + ',';
						    				change.custom_attributes.category_slug_string = result.body.custom_attributes.category_slug_string + project_slug + ',';
						    			}
					    			}else{
					    				change.custom_attributes.category_slug_string = ',' + category_slug + ',';
					    			}

					    			console.log("To be updated......");
					    			console.log(change);

					    			client.users.update(change)
					    			.then(result => {
			    						console.log("Make sure that the status updating process is complete");
			    					}).catch(e => {

		    						});
					    		}).catch(e => {

		    					});
					    	}else{
					    		//Should use email to create the order
					    		client.users.find({
					    			email: email
					    		}).then((result) => {
					    			//Should look up in the database for the category and project

					    			let change = {
					    				email: email,
					    				custom_attributes: result.body.custom_attributes
					    			}

					    			//Changes status: no more, since will be changed later
					    			// change.custom_attributes['status_num_' + status] += 1;

					    			if(result.body.custom_attributes.project_slug_string) {
						    			if(!result.body.custom_attributes.project_slug_string.includes(project_slug)) {
						    				change.custom_attributes.project_slug_string += project_slug + ',';
						    			}
					    			}else{
					    				change.custom_attributes.project_slug_string = ',' + project_slug + ',';
					    			}

					    			if(result.body.custom_attributes.category_slug_string) {
						    			if(!result.body.custom_attributes.category_slug_string.includes(category_slug)) {
						    				change.custom_attributes.category_slug_string += category_slug + ',';
						    			}
					    			}else{
					    				change.custom_attributes.category_slug_string = ',' + category_slug + ',';
					    			}

					    			client.users.update(change).then(result => {
			    						console.log("Make sure that the status updating process is complete");
			    					}).catch(e => {

		    						});

					    		});

					    	}
						}
					}
				});

		    }, {noAck: true});
}

module.exports.createOrder = createOrder;