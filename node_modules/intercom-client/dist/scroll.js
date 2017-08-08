'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scroll = function () {
  function Scroll(client, dataType) {
    _classCallCheck(this, Scroll);

    this.client = client;
    this.dataType = dataType;
  }

  _createClass(Scroll, [{
    key: 'each',
    value: function each(params, f) {
      var self = this;
      this.scroll_param = undefined;

      return new _bluebird2.default(function (resolve, reject) {
        self.eachInternal(params, f, { resolve: resolve, reject: reject });
      });
    }
  }, {
    key: 'eachInternal',
    value: function eachInternal(params, f, promise) {
      var self = this;
      this.client.get(this.scrollUrl(), params).then(function (response) {
        var result = f(response);
        if (response.body[self.dataType + 's'].length > 0) {
          self.scroll_param = response.body.scroll_param;
          if (result && 'then' in result && typeof result.then === 'function') {
            result.then(function () {
              self.eachInternal(params, f, promise);
            }, function (error) {
              promise.reject(error);
            });
          } else {
            self.eachInternal(params, f, promise);
          }
        } else {
          promise.resolve();
        }
      }).catch(function (error) {
        promise.reject(error);
      });
    }
  }, {
    key: 'scrollUrl',
    value: function scrollUrl() {
      var dataType = this.dataType;
      if (typeof this.scroll_param !== 'undefined') {
        return '/' + dataType + 's/scroll?scroll_param=' + this.scroll_param;
      } else {
        return '/' + dataType + 's/scroll';
      }
    }
  }]);

  return Scroll;
}();

exports.default = Scroll;