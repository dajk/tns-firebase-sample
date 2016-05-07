var config = require('../../shared/config');
var firebase = require('nativescript-plugin-firebase');
var observableArrayModule = require('data/observable-array');

function indexOf(item) {
  var match = -1;
  this.forEach(function(loopItem, index) {
    if (loopItem.id === item.key) {
      match = index;
    }
  });

  return match;
}

function IdeaListViewModel(items) {
  var viewModel = new observableArrayModule.ObservableArray(items);
  viewModel.indexOf = indexOf;

  viewModel.load = function (topicId) {
    var onChildEvent = function(result) {
      var index = viewModel.indexOf(result);
      if (result.type === 'ChildAdded' && index === -1) {
        // if(result.value.Owner === config.uid){
          viewModel.push({
            title: result.value.Title,
            owner: result.value.Owner,
            id: result.key
          });
        // }
      } else if (result.type === 'ChildRemoved' && index !== -1) {
        viewModel.splice(index, 1);
      }

    };
   
    return firebase.addChildEventListener(onChildEvent, '/GTopics/' + topicId + '/TopicIdeas').then(function () {
      console.log('firebase.addChildEventListener added');
    }, function (error) {
      console.log('firebase.addChildEventListener error: ' + error);
    });
  };

  viewModel.cleanup = function() {
    while (viewModel.length) {
      viewModel.pop();
    }
  };

  viewModel.add = function(idea, topic) {
    return firebase.push('/GTopics/' + topic.id + '/TopicIdeas', {
      'Title': idea,
      'Owner': {
        username: config.username,
        id: config.uid
      }
    }).then(function(val) {
      firebase.update('/GTopics/' + topic.id + '/Members/' + config.uid, {
        'GUserID': config.uid
      });
      firebase.setValue('/GTopics/' + topic.id + '/Members/' + config.uid + '/Ideas/' + val.key, {
        'IdeaID': val.key,
        'Title': idea
      });
    });
  };

  viewModel.delete = function(topicId, ideaId) {
    return firebase.remove('/GTopics/' + topicId + '/TopicIdeas/' + ideaId).then(function() {
      firebase.remove('/GTopics/' + topicId + '/Members/' + config.uid + '/Ideas/' + ideaId);
    });
  };

  return viewModel;
}

module.exports = IdeaListViewModel;
