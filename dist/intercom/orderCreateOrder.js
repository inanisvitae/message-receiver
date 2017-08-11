'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _intercomClient = require('intercom-client');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _bunyan2.default.createLogger({ name: 'orderCreateOrder' });
const client = new _intercomClient.Client(_config2.default.get('thirdPartyPlatform.intercom'));
const connPool = new _pg2.default.Pool(_config2.default.get('database.pg'));

const createOrder = ch => {
  // ORDER:CREATE_ORDER: Should add 1 to total number of purchase *debugged
  ch.assertQueue('ORDER:CREATE_ORDER', { durable: true });

  ch.consume('ORDER:CREATE_ORDER', msg => {
    const contentObject = JSON.parse(msg.content);
    const customerId = contentObject.customer_id;
    const email = contentObject.email;
    const projectSlug = contentObject.project_slug;
    const projectId = contentObject.project_id;
    const promoterId = contentObject.promoter_id;
    const query1 = `SELECT t2.id, t2.slug AS category_slug FROM (SELECT category_id FROM public.project_to_category WHERE project_id = '${Number.parseInt(projectId, 10)}') t1, public.category t2 WHERE t1.category_id = t2.id;`;
    const query2 = `SELECT username, id FROM public.promoter WHERE id = '${promoterId}';`;
    connPool.query(query1, [], (err, queryResult) => {
      if (err) {
        log.info(err);
      } else if (queryResult.rows.length > 0) {
        // There could be multiple results
        const categorySlug = queryResult.rows[0].category_slug;
        if (customerId) {
          client.users.find({
            user_id: customerId
          }).then(result => {
            // Only updates the diff
            const change = {
              user_id: customerId,
              custom_attributes: {
                project_slug_string: '',
                category_slug_string: '',
                promoter_username_string: ''
              }
            };

            const originalCustomAttrs = result.body.custom_attributes;

            if (originalCustomAttrs.project_slug_string) {
              if (!originalCustomAttrs.project_slug_string.includes(projectSlug)) {
                change.custom_attributes.project_slug_string = `${originalCustomAttrs.project_slug_string + projectSlug},`;
              }
            } else {
              change.custom_attributes.project_slug_string = `,${projectSlug},`;
            }

            if (originalCustomAttrs.category_slug_string) {
              if (!originalCustomAttrs.category_slug_string.includes(categorySlug)) {
                change.custom_attributes.category_slug_string = `${originalCustomAttrs.category_slug_string + categorySlug},`;
              }
            } else {
              change.custom_attributes.category_slug_string = `,${categorySlug},`;
            }

            connPool.query(query2, [], (err2, query2Result) => {
              if (err2) {
                log.info(err2);
              } else if (query2Result.rows.length > 0) {
                const promUsername = query2Result.rows[0].username;

                if (originalCustomAttrs.promoter_username_string) {
                  if (!originalCustomAttrs.promoter_username_string.includes(promUsername)) {
                    change.custom_attributes.promoter_username_string = `${originalCustomAttrs.promoter_username_string + promUsername},`;
                  }
                } else {
                  change.custom_attributes.promoter_username_string = `,${promUsername},`;
                }
              }
              client.users.update(change).catch(e => {
                log.info(e);
              });
            });
          }).catch(e => {
            log.info(e);
          });
        } else {
          // Should use email to create the order
          client.users.find({
            email
          }).then(result => {
            // Only updates the diff
            const change = {
              user_id: customerId,
              custom_attributes: {
                project_slug_string: '',
                category_slug_string: '',
                promoter_username_string: ''
              }
            };
            const originalCustomAttrs = result.body.custom_attributes;

            if (originalCustomAttrs.project_slug_string) {
              if (!originalCustomAttrs.project_slug_string.includes(projectSlug)) {
                change.custom_attributes.project_slug_string = `${originalCustomAttrs.project_slug_string + projectSlug},`;
              }
            } else {
              change.custom_attributes.project_slug_string = `,${projectSlug},`;
            }

            if (originalCustomAttrs.category_slug_string) {
              if (!originalCustomAttrs.category_slug_string.includes(categorySlug)) {
                change.custom_attributes.category_slug_string = `${originalCustomAttrs.category_slug_string + categorySlug},`;
              }
            } else {
              change.custom_attributes.category_slug_string = `,${categorySlug},`;
            }
            connPool.query(query2, [], (err2, query2Result) => {
              if (err2) {
                log.info(err2);
              } else if (query2Result.rows.length > 0) {
                const promUsername = query2Result.rows[0].username;
                if (originalCustomAttrs.promoter_username_string) {
                  if (!originalCustomAttrs.promoter_username_string.includes(promUsername)) {
                    change.custom_attributes.promoter_username_string = `${originalCustomAttrs.promoter_username_string + promUsername},`;
                  }
                } else {
                  change.custom_attributes.promoter_username_string = `,${promUsername},`;
                }
              }
              client.users.update(change).catch(e => {
                log.info(e);
              });
            });
          });
        }
      }
    });
  }, { noAck: true });
};

exports.default = createOrder;