'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _scroll = require('./scroll');

var _scroll2 = _interopRequireDefault(_scroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Company = function () {
  function Company(client) {
    _classCallCheck(this, Company);

    this.client = client;
    this.scroll = new _scroll2.default(this.client, 'companie');
  }

  _createClass(Company, [{
    key: 'create',
    value: function create(data, f) {
      return this.client.post('/companies', data, f);
    }
  }, {
    key: 'update',
    value: function update(data, f) {
      return this.create(data, f);
    }
  }, {
    key: 'list',
    value: function list(f) {
      return this.client.get('/companies', {}, f);
    }
  }, {
    key: 'listBy',
    value: function listBy(params, f) {
      return this.client.get('/companies', params, f);
    }
  }, {
    key: 'find',
    value: function find(params, f) {
      return this.client.get('/companies/' + params.id, {}, f);
    }
  }, {
    key: 'listUsers',
    value: function listUsers(params, f) {
      return this.client.get('/companies/' + params.id + '/users', {}, f);
    }
  }]);

  return Company;
}();

exports.default = Company;