var addEvent = (function () {
  if (document.addEventListener) {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.addEventListener(type, fn, false);
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  } else {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.attachEvent('on' + type, function () {
          return fn.call(el, window.event);
        });
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  }
})();

if (!sessionStorage.length || sessionStorage.length < 2) {
  localStorage.setItem('getSessionStorage', Date.now());
}

// debugger;
addEvent(window, 'storage', function (event) {
  if (event.key == 'getSessionStorage') {
    localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
  } else if (event.key == 'sessionStorage' && (!sessionStorage.length || sessionStorage.length < 2)) {
    if (event.newValue && event.newValue.length != 0) {
      var data = JSON.parse(event.newValue);

      for (var key in data) {
        if (key != 'sysSelect') {
          sessionStorage.setItem(key, data[key]);
        }
      }
    }
  }
});

// Function.prototype.bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function () {};
    var fBound = function () {
      return fToBind.apply(this instanceof fNOP && oThis
                           ? this
                           : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}
if (typeof Object.assign !== 'function') {
  Object.assign = function (target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
export default {
  getHost (url = document.location.href) {
    if (url.indexOf('http://') != -1 || url.indexOf('https://') != -1) {
      // eslint-disable-next-line no-useless-escape
      var reg = new RegExp('^(http:\/\/|https:\/\/)(.*?)(\/|$)');
      return url.match(reg)[0].slice(-1) == '/' ? url.match(reg)[0].slice(0, -1) : url.match(reg)[0];
    } else {
      return url.split('/')[0];
    }
  }
};
