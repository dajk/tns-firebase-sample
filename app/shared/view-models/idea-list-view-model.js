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

  viewModel.load = function (topic) {
    var onChildEvent = function(result) {
      var index = viewModel.indexOf(result);
      var obj = {
        title: result.value.Title,
        owner: result.value.Owner,
        id: result.key,
        topic: topic,
        isOwner: result.value.Owner.id === config.uid
      };

      if (result.type === 'ChildAdded' && index === -1) {
        viewModel.push(obj);
      } else if (result.type === 'ChildRemoved' && index !== -1) {
        viewModel.splice(index, 1);
      } else if (result.type === 'ChildChanged' && index !== -1) {
        viewModel.setItem(index, obj);
      }

    };
   
    return firebase.addChildEventListener(onChildEvent, '/GTopics/' + topic.id + '/TopicIdeas').then(function () {
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

  viewModel.update = function(idea) {
    return firebase.update('/GTopics/' + idea.topic.id + '/TopicIdeas/' + idea.id, {
      Title: idea.title
    }).then(function() {
      firebase.update('/GUsers/' + idea.topic.owner.id + '/Members/' + config.uid + '/Ideas/' + idea.id, {
        Title: idea.title
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
