import { Client } from 'intercom-client';
import config from 'config';
import bunyan from 'bunyan';
import pg from 'pg';
import { _ } from 'lodash';


const log = bunyan.createLogger({ name: 'customerRemoveCollection' });
const client = new Client(config.get('thirdPartyPlatform.intercom'));
const connPool = new pg.Pool(config.get('database.pg'));

const customerRemoveCollection = (ch) => {
  ch.assertQueue('CUSTOMER:REMOVE_COLLECTION', { durable: true });
  ch.consume('CUSTOMER:REMOVE_COLLECTION', (msg) => {
    const contentObject = JSON.parse(msg.content);
    const customerId = contentObject.customer_id;
    const projectId = contentObject.project_id;
    const query1 = `SELECT t1.customer_id, array_agg(t2.slug) AS project_collection_string FROM public.favorite t1, public.project t2 WHERE t1.customer_id = ${customerId} AND t2.id = t1.project_id GROUP BY t1.customer_id;`;
    const query2 = `SELECT id, slug FROM public.project WHERE id = ${projectId};`;

    connPool.query(query1, [], (err1, query1Result) => {
      if (err1) {
        log.info(err1);
      } else if (query1Result.rows.length > 0) {
        connPool.query(query2, [], (err2, query2Result) => {
          if (!err2) {
            const projectSlugToRemove = query2Result.rows[0].slug;
            const change = {
              project_collection_string: query1Result.rows[0].project_collection_string,
            };
            const projCollString = query1Result.rows[0].project_collection_string;
            if (projCollString.indexOf(projectSlugToRemove) !== -1) {
              const newProjCollArr = _.difference(projCollString, projectSlugToRemove);
              const newProjCollString = newProjCollArr.join(',');
              if (newProjCollArr.length !== 0) {
                change.project_collection_string = `,${newProjCollString},`;
              } else {
                change.project_collection_string = '';
              }
              client.update({
                user_id: customerId,
                custom_attributes: change,
              }).catch((e) => {
                log.info(e);
              });
            }
          }
        });
      }
    });
  }, { noAck: true });
};

export default customerRemoveCollection;
