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
  isDevelopingAddon: function() { return true; },
  included: function(app) {
    this.app = app;

    if (this._shouldIncludeFiles()) {
      app.import(app.bowerDirectory + '/FakeXMLHttpRequest/fake_xml_http_request.js');
      app.import(app.bowerDirectory + '/route-recognizer/dist/route-recognizer.js');
      app.import(app.bowerDirectory + '/pretender/pretender.js');
      app.import('vendor/ember-cli-fake-server/pretender-shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
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
    return this.app.env !== 'production';
  }
};
