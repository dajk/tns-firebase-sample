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
      var matches = [];
      
      if (result.type === 'ChildAdded') {            
        // if(result.value.GUserID === config.uid){
          viewModel.push({
            title: result.value.Title,
            id: result.key
          });
        // }
      } else if (result.type === 'ChildRemoved') {
        matches.push(result);
        matches.forEach(function(match) {
          var index = viewModel.indexOf(match);
          viewModel.splice(index, 1);                                     
        });
      }

    };
   
    return firebase.addChildEventListener(onChildEvent, '/GTopics/' + topic.id + '/TopicIdeas').then(function () {
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

  viewModel.add = function(idea, topic) {
    return firebase.push('/GTopics/' + topic.id + '/TopicIdeas', {
      'Title': idea,
      'Owner': config.uid
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
    console.log(topicId, ideaId);
    // var id = viewModel.getItem(index).id;
    return firebase.remove('/GTopics/' + topicId + '/TopicIdeas/' + ideaId).then(function() {
      firebase.remove('/GTopics/' + topicId + '/Members/' + config.uid + '/Ideas/' + ideaId);
    });
  };

  return viewModel;
}

module.exports = IdeaListViewModel;
