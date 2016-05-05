var dialogsModule = require('ui/dialogs');
var viewModule = require('ui/core/view');
var UserViewModel = require('../../shared/view-models/user-view-model');
var user = new UserViewModel();
var swipeDelete = require('../../shared/utils/ios-swipe-delete');
var observableModule = require('data/observable');
var observableArrayModule = require('data/observable-array');

var IdeaListViewModel = require('../../shared/view-models/idea-list-view-model');
var frameModule = require('ui/frame');
var page;

var ideaList = new IdeaListViewModel([]);
var pageData = new observableModule.Observable({
  ideaList: ideaList,
  idea: '',
  topic: ''
});

exports.loaded = function(args) {
  page = args.object;

  if (page.ios) {
    var listView = viewModule.getViewById(page, 'ideaList');
    swipeDelete.enable(listView, function(index) {
      ideaList.delete(index);
    });
    var navigationBar = frameModule.topmost().ios.controller.navigationBar;
    navigationBar.barTintColor = UIColor.colorWithRedGreenBlueAlpha(0.011, 0.278, 0.576, 1);
    navigationBar.titleTextAttributes = new NSDictionary([UIColor.whiteColor()], [NSForegroundColorAttributeName]);
    navigationBar.barStyle = 1;
    navigationBar.tintColor = UIColor.whiteColor();

    frameModule.topmost().ios.navBarVisibility = 'never';
  }

  pageData.set('topic', page.navigationContext);

  page.bindingContext = pageData;

  ideaList.empty();
  ideaList.load(pageData.get('topic'));
};

exports.add = function() {
  // Check for empty submissions
  if (pageData.get('idea').trim() !== '') {
    // Dismiss the keyboard
    viewModule.getViewById(page, 'idea').dismissSoftInput();
    ideaList.add(pageData.get('idea'), pageData.get('topic'))
      .catch(function() {
        dialogsModule.alert({
          message: 'An error occurred while adding an item to your list.',
          okButtonText: 'OK'
        });
      });
    // Empty the input field
    pageData.set('idea', '');
  } else {
    dialogsModule.alert({
      message: 'Enter a idea item',
      okButtonText: 'OK'
    });
  }
};

exports.delete = function(args) {
  var item = args.view.bindingContext;
  // var index = topicList.indexOf(item);
  ideaList.delete(pageData.get('topic').id, item.id);
};

exports.logout = function() {
  user.logout().then(function() {
    frameModule.topmost().navigate('views/login/login');
  });
};
