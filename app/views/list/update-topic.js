var observableModule = require('data/observable');
var viewModule = require('ui/core/view');
var TopicListViewModel = require('../../shared/view-models/topic-list-view-model');
var frameModule = require('ui/frame');

var topicList = new TopicListViewModel([]);
var pageData = new observableModule.Observable({
  title: ''
});

var UserViewModel = require('../../shared/view-models/user-view-model');
var user = new UserViewModel();

var page;

exports.loaded = function(args) {
  page = args.object;
  page.bindingContext = page.navigationContext;
  pageData.set('title', page.navigationContext);
};

exports.update = function(args) {
  var item = args.object.bindingContext;
  topicList.update(item);
};

exports.logout = function() {
  user.logout().then(function() {
    frameModule.topmost().navigate('views/login/login');
  });
};
