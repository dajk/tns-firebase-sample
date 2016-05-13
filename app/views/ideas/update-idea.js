var observableModule = require('data/observable');
var viewModule = require('ui/core/view');
var IdeaListViewModel = require('../../shared/view-models/idea-list-view-model');
var frameModule = require('ui/frame');

var ideaList = new IdeaListViewModel([]);
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
  console.dir(item);
  ideaList.update(item);
};

exports.logout = function() {
  user.logout().then(function() {
    frameModule.topmost().navigate('views/login/login');
  });
};
