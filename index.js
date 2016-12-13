/* jshint node: true */
'use strict';

var lazyLoaded = {};

function lazyLoad(moduleName){
  if (!lazyLoaded[moduleName]) {
    lazyLoaded[moduleName] = require(moduleName);
  }
  return lazyLoaded[moduleName];
}

module.exports = {
  name: 'ember-cli-fake-server',

  options: {
    nodeAssets: {
      'route-recognizer': npmAsset({
        path: 'dist/route-recognizer.js',
        sourceMap: 'dist/route-recognizer.js.map'
      }),
      'fake-xml-http-request': npmAsset('fake_xml_http_request.js'),
      'pretender': npmAsset('pretender.js')
    }
  },

  treeFor: function() {
    if (this._shouldIncludeFiles()) {
      return this._super.treeFor.apply(this, arguments);
    }
    return this._emptyTree();
  },

  postprocessTree: function(type, tree) {
    if (type === 'js' && !this._shouldIncludeFiles()) {
      return this._excludeSelf(tree);
    }
    return tree;
  },

  _excludeSelf: function(tree){
    var modulePrefix = this.app.project.config(this.app.env)['modulePrefix'];
    var Funnel = lazyLoad('broccoli-funnel');
    return new Funnel(tree, {
      exclude: [new RegExp('^' + modulePrefix + '/ember-cli-fake-server/')],
      description: 'Funnel: exclude ember-cli-fake-server'
    });
  },

  _emptyTree: function(){
    var mergeTrees = lazyLoad('broccoli-merge-trees');
    return mergeTrees([]);
  },

  _shouldIncludeFiles: function(){
    if (process.env.EMBER_CLI_FASTBOOT) { return false; }
    return this.app.env !== 'production';
  }
};

function npmAsset(filePath) {
  return function() {
    return {
      enabled: this._shouldIncludeFiles(),
      import: [filePath]
    };
  };
}
