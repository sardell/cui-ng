angular.module('cui-ng')
  .directive('cuiIcon', ['$cuiIcon',
    function($cuiIcon) {
      return {
        scope: {
          fontSet: '@cuiFontSet',
          fontIcon: '@cuiFontIcon',
          svgIcon: '@cuiSvgIcon',
          svgSrc: '@cuiSvgSrc'
        },
        restrict: 'E',
        link: postLink
      };

      // Supports embedded SVGs, font-icons, & external SVGs
      function postLink(scope, element, attr) {
        prepareForFontIcon();

        var attrName = attr.$normalize(attr.$attr.cuiSvgIcon || attr.$attr.cuiSvgSrc || '');
        if (attrName) {
          // Use either pre-configured SVG or URL source, respectively.
          attr.$observe(attrName, function(attrVal) {
            element.empty();
            if (attrVal) {
              $cuiIcon(attrVal).then(function(svg) {
                element.append(svg);
              });
            }
          });
        }

        function prepareForFontIcon() {
          if (!scope.svgIcon && !scope.svgSrc) {
            if (scope.fontIcon) {
              element.addClass('cui-font ' + scope.fontIcon);
            }
            element.addClass($cuiIcon.fontSet(scope.fontSet));
          }
        }
      }
    }
  ]);



// -------------------------------
var config = {
  defaultViewBoxSize: 24,
  defaultFontSet: '',
  fontSets: []
};

angular.module('cui-ng').provider('$cuiIcon', CuiIconProvider);

function CuiIconProvider() { }

CuiIconProvider.prototype = {
  icon: function(id, url, viewBoxSize, doRotate) {
    if (id.indexOf(':') === -1) {
      id = '$default:' + id;
    }

    config[id] = new ConfigurationItem(url, viewBoxSize, doRotate);
    return this;
  },

  iconSet: function(id, url, viewBoxSize, doRotate) {
    config[id] = new ConfigurationItem(url, viewBoxSize, doRotate);
    return this;
  },

  defaultIconSet: function(url, viewBoxSize, doRotate) {
    var setName = '$default';

    if (!config[setName]) {
      config[setName] = new ConfigurationItem(url, viewBoxSize, doRotate);
    }

    config[setName].viewBoxSize = viewBoxSize || config.defaultViewBoxSize;

    return this;
  },

  defaultViewBoxSize: function(viewBoxSize) {
    config.defaultViewBoxSize = viewBoxSize;
    return this;
  },

  // Register an alias name associated with a font-icon library style
  fontSet: function fontSet(alias, className) {
    config.fontSets.push({
      alias: alias,
      fontSet: className || alias
    });
    return this;
  },

  // Specify a default style name associated with a font-icon library
  defaultFontSet: function defaultFontSet(className) {
    config.defaultFontSet = !className ? '' : className;
    return this;
  },

  defaultIconSize: function defaultIconSize(iconSize) {
    config.defaultIconSize = iconSize;
    return this;
  },


  $get: ['$http', '$q', '$templateCache', 
    function($http, $q, $templateCache) {
      this.preloadIcons($templateCache);
      return new CuiIconService(config, $http, $q, $templateCache);
    }
  ]

};



// -------------------------------

// Configuration item stored in the Icon registry.
function ConfigurationItem(url, viewBoxSize, doRotate) {
  this.url = url;
  this.viewBoxSize = viewBoxSize || config.defaultViewBoxSize;
  this.doRotate = doRotate;
}


function CuiIconService(config, $http, $q, $templateCache) {
  var iconCache = {};
  var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;

  Icon.prototype = {
    clone: cloneSVG,
    prepare: prepareAndStyle
  };
  getIcon.fontSet = findRegisteredFontSet;

  // expose service...
  return getIcon;


  // The $cuiIcon service is a lookup function
  function getIcon(id) {
    id = id || '';

    // If already loaded and cached, use a clone of the cached icon.
    // Otherwise either load by URL, or lookup in the registry and then load by URL, and cache.
    if (iconCache[id]) {
      return $q.when(iconCache[id].clone());
    }
    if (urlRegex.test(id)) {
      return loadByURL(id).then(cacheIcon(id));
    }
    if (id.indexOf(':') === -1) {
      id = '$default:' + id;
    }

    var load = config[id] ? loadByID : loadFromIconSet;
    return load(id).then(cacheIcon(id));
  }

  // Lookup registered fontSet style using its alias...
  function findRegisteredFontSet(alias) {
    var useDefault = angular.isUndefined(alias) || !(alias && alias.length);
    if (useDefault) {
      return config.defaultFontSet;
    }

    var result = alias;
    angular.forEach(config.fontSets, function(it) {
      if (it.alias === alias) {
        result = it.fontSet || result;
      }
    });

    return result;
  }

  // Prepare and cache the loaded icon for the specified `id`
  function cacheIcon(id) {
    return function updateCache(icon) {
      iconCache[id] = isIcon(icon) ? icon : new Icon(icon, config[id]);
      return iconCache[id].clone();
    };
  }

  // Lookup the configuration in the registry: load icon [on-demand] using registered URL
  function loadByID(id) {
    var iconConfig = config[id];
    return loadByURL(iconConfig.url).then(function(icon) {
      return new Icon(icon, iconConfig);
    });
  }

  // Loads the file as XML and uses querySelector( <id> ) to find the desired node...
  function loadFromIconSet(id) {
    var setName = id.substring(0, id.lastIndexOf(':')) || '$default';
    var iconSetConfig = config[setName];

    return !iconSetConfig ? announceIdNotFound(id) : loadByURL(iconSetConfig.url).then(extractFromSet);

    function extractFromSet(set) {
      var iconName = id.slice(id.lastIndexOf(':') + 1);
      var icon = set.querySelector('#' + iconName);
      return !icon ? announceIdNotFound(id) : new Icon(icon, iconSetConfig);
    }

    function announceIdNotFound(id) {
      var msg = 'icon ' + id + ' not found';
      cui.log(msg);
      return $q.reject(msg || id);
    }
  }

  // Load icon by URL (may use $templateCache). Extract data for later conversion to Icon
  function loadByURL(url) {
    return $http
      .get(url, {
        cache: $templateCache
      })
      .then(function(response) {
        return angular.element('<div>').append(response.data).find('svg')[0];
      })
      .catch(announceNotFound);
  }

  // Catch HTTP or generic errors not related to incorrect icon IDs.
  function announceNotFound(err) {
    var msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);
    cui.log(msg);
    return $q.reject(msg);
  }

  // Check target signature to see if it is an Icon instance.
  function isIcon(target) {
    return angular.isDefined(target.element) && angular.isDefined(target.config);
  }

  // Define Icon class
  function Icon(el, config) {
    if (el && el.tagName !== 'svg') {
      el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el)[0];
    }

    // Inject the namespace if not available...
    if (!el.getAttribute('xmlns')) {
      el.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Handle icon(s) that are in need of rotation...
    if (angular.isDefined(config.doRotate) && config.doRotate === true) {
      el.setAttribute('class', 'cui-icon-rotate');
    }

    this.element = el;
    this.config = config;
    this.prepare();
  }

  // Prepare DOM element that will be cached in loaded iconCache store.
  function prepareAndStyle() {
    var viewBoxSize = this.config ? this.config.viewBoxSize : config.defaultViewBoxSize;
    angular.forEach({
      'fit': '',
      'height': '100%',
      'width': '100%',
      'preserveAspectRatio': 'xMidYMid meet',
      'viewBox': this.element.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize)
    }, function(val, attr) {
      this.element.setAttribute(attr, val);
    }, this);

    angular.forEach({
      'pointer-events': 'none',
      'display': 'block'
    }, function(val, style) {
      this.element.style[style] = val;
    }, this);
  }

  // Clone the Icon DOM element.
  function cloneSVG() {
    return this.element.cloneNode(true);
  }
}

CuiIconService.$inject = ['config', '$http', '$q', '$templateCache'];
