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

function TopicListViewModel(items) {
  var viewModel = new observableArrayModule.ObservableArray(items);
  viewModel.indexOf = indexOf;

  viewModel.load = function () {
    var onChildEvent = function(result) {
      var index = viewModel.indexOf(result)
      var obj = {
        title: result.value.Title,
        owner: result.value.Owner,
        id: result.key,
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
   
    return firebase.addChildEventListener(onChildEvent, '/GTopics').then(function () {
      console.log('firebase.addChildEventListener added');
    }, function (error) {
      console.log('firebase.addChildEventListener error: ' + error);
    });
  };

  viewModel.empty = function() {
    while (viewModel.length) {
      viewModel.pop();
    }
  };

  viewModel.add = function(topic) {
    return firebase.push('/GTopics', {
      'Title': topic,
      'Owner': {
        username: config.username,
        id: config.uid
      }
    }).then(function(val) {
      firebase.setValue('/GTopics/' + val.key + '/Members/' + config.uid, {
        'GUserID': config.uid,
        'Ideas': config.ideas
      });

      firebase.setValue('/GUsers/' + config.uid + '/UTopics/' + val.key, {
        'GTopicID': val.key,
        'Title': topic
      });
    });
  };

  viewModel.update = function(topic) {
    return firebase.update('/GTopics/' + topic.id, {
      Title: topic.title
    }).then(function() {
      firebase.update('/GUsers/' + topic.owner.id + '/UTopics/' + topic.id, {
        Title: topic.title
      });
    });
  };

  viewModel.delete = function(topic) {
    return firebase.remove('/GTopics/' + topic.id).then(function() {
      firebase.remove('/GUsers/' + topic.owner.id + '/UTopics/' + topic.id);
    });
  };

  return viewModel;
}

module.exports = TopicListViewModel;
