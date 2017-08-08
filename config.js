exports.config = {
	token: 'dG9rOjM0NjdiMzg5XzEwMTVfNDg3N19hM2M3X2NiOWFjMDc3NWJjMjoxOjA=',
	app_id: 'yx7479p2',
	pg: {
	  user: 'ziqihong',
	  database: 'tickets',
	  password: '', 
	  host: '127.0.0.1',
	  port: 5432, 
	  max: 10, 
	  idleTimeoutMillis: 1000
	},
	unused_fields: [
		'id',
		'guest_id',
		'active', 
		'first_name',
		'last_name',
		'mobile',
		'password',
		'newsletter',
		'verified_email',
		'verified_mobile',
		'invite_code',
		'tpps',
		'updated_at',
		'platform',
	],
	payment_items_included: [
		'paid',
		'waiting_for_delivery',
		'delivered',
		'waiting_for_pickup',
		'completed',
	],
}

