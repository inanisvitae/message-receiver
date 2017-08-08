const faker = require('faker');

const gen = (type) => {
	switch (type) {
		case 'first_name': 
			return faker.name.firstName();
		case 'last_name':
			return faker.name.lastName(); 
		case 'email':
			return faker.internet.email();
		case 'customer_id':
			return Math.ceil(Math.random() * 100 + 100);
		case 'phone':
			return faker.phone.phoneNumber();
		
		default:
			console.log("Unable to generate");

	}
	
}


module.exports.gen = gen;