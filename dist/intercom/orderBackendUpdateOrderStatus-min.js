"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0});var _intercomClient=require("intercom-client"),_config=require("config"),_config2=_interopRequireDefault(_config),_pg=require("pg"),_pg2=_interopRequireDefault(_pg),_bunyan=require("bunyan"),_bunyan2=_interopRequireDefault(_bunyan),_publicConst=require("./publicConst");const log=_bunyan2.default.createLogger({name:"orderBackendUpdateOrderStatus"}),client=new _intercomClient.Client(_config2.default.get("thirdPartyPlatform.intercom")),connPool=new _pg2.default.Pool(_config2.default.get("database.pg")),orderBackendUpdateOrderStatus=e=>{e.assertQueue("ORDER:BACKEND_UPDATE_ORDER_STATUS",{durable:!0}),e.consume("ORDER:BACKEND_UPDATE_ORDER_STATUS",e=>{const t=JSON.parse(e.content).customer_id,r=`SELECT customer_id, guest_id, status, promoter_id, payment, id, deleted_at FROM public.order WHERE customer_id = ${t};`;connPool.query(r,[],(e,r)=>{if(e)log.info(e);else{let e=0;const o=new Map;let n=0;const s={};r.rows.length>0?(r.rows.forEach(t=>{e+=Number.parseInt(t.payment,10);let r=`status_num_${t.status}`;"pending"===t.status&&t.deleted_at&&(r+="_deleted"),-1!==_publicConst.completedOrdersSignature.indexOf(t.status)&&(n+=1),o.has(r)?o.set(r,o.get(r)+1):o.set(r,1)}),[...o].forEach(e=>{s[e[0]]=e[1]}),s.num_orders=n,s.total_payment=e,client.users.update({user_id:t,custom_attributes:s}).catch(e=>{log.info(e)})):log.info("There is no corresponding customer_id or there is no order")}})})};exports.default=(e=>{e.assertQueue("ORDER:BACKEND_UPDATE_ORDER_STATUS",{durable:!0}),e.consume("ORDER:BACKEND_UPDATE_ORDER_STATUS",e=>{const t=JSON.parse(e.content).customer_id,r=`SELECT customer_id, guest_id, status, promoter_id, payment, id, deleted_at FROM public.order WHERE customer_id = ${t};`;connPool.query(r,[],(e,r)=>{if(e)log.info(e);else{let e=0;const o=new Map;let n=0;const s={};r.rows.length>0?(r.rows.forEach(t=>{e+=Number.parseInt(t.payment,10);let r=`status_num_${t.status}`;"pending"===t.status&&t.deleted_at&&(r+="_deleted"),-1!==_publicConst.completedOrdersSignature.indexOf(t.status)&&(n+=1),o.has(r)?o.set(r,o.get(r)+1):o.set(r,1)}),[...o].forEach(e=>{s[e[0]]=e[1]}),s.num_orders=n,s.total_payment=e,client.users.update({user_id:t,custom_attributes:s}).catch(e=>{log.info(e)})):log.info("There is no corresponding customer_id or there is no order")}})})});