var dialogsModule = require('ui/dialogs');
var observableModule = require('data/observable');
var observableArrayModule = require('data/observable-array');
var viewModule = require('ui/core/view');
var TopicListViewModel = require('../../shared/view-models/topic-list-view-model');
var socialShare = require('nativescript-social-share');
var swipeDelete = require('../../shared/utils/ios-swipe-delete');
var frameModule = require('ui/frame');

var page;

var UserViewModel = require('../../shared/view-models/user-view-model');
var user = new UserViewModel();

var topicList = new TopicListViewModel([]);
var pageData = new observableModule.Observable({
  topicList: topicList,
  topic: ''
});

exports.loaded = function(args) {
  page = args.object;

  if (page.ios) {
    var listView = viewModule.getViewById(page, 'topicList');
    swipeDelete.enable(listView, function(index) {
      console.log(index);
      topicList.delete(index);
    });
    var navigationBar = frameModule.topmost().ios.controller.navigationBar;
    navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(0.011, 0.278, 0.576, 1);
    navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
    navigationBar.barStyle = 1;
    navigationBar.tintColor = UIColor.whiteColor();

    frameModule.topmost().ios.navBarVisibility = 'never';
  }
  
  page.bindingContext = pageData;

  topicList.empty();
  pageData.set('isLoading', true);
  topicList.load().then(function() {
    pageData.set('isLoading', false);
  });
};

exports.add = function() {
  // Check for empty submissions
  if (pageData.get('topic').trim() !== '') {
    // Dismiss the keyboard
    viewModule.getViewById(page, 'topic').dismissSoftInput();
    topicList.add(pageData.get('topic'))
      .catch(function() {
        dialogsModule.alert({
          message: 'An error occurred while adding an item to your list.',
          okButtonText: 'OK'
        });
      });
    // Empty the input field
    pageData.set('topic', '');
  } else {
    dialogsModule.alert({
      message: 'Enter a topic item',
      okButtonText: 'OK'
    });
  }
};

exports.share = function() {
  var list = [];
  var finalList = '';
  for (var i = 0, size = topicList.length; i < size ; i++) {
    list.push(topicList.getItem(i).name);
  }
  var listString = list.join(', ').trim();
  socialShare.shareText(listString);
};

exports.delete = function(args) {
  var item = args.view.bindingContext;
  topicList.delete(item);
};

exports.logout = function() {
  user.logout().then(function() {
    frameModule.topmost().navigate('views/login/login');
  });
};

exports.openTopic = function(args) {
  frameModule.topmost().navigate({
    moduleName: 'views/ideas/ideas',
    context: args.view.bindingContext
  });
};
