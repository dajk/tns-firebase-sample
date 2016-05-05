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
      'Owner': config.uid
    }).then(function(val) {
      firebase.setValue('/GTopics/' + val.key + '/Members/' + config.uid, {
        'GUserID': config.uid,
        'Ideas': config.ideas
      });

      firebase.setValue('/GUsers/' + config.uid + '/UTopics/' + val.key, {
        'GTopicID': val.key,
        'TopicTitle': topic
      });
    });
  };

  viewModel.delete = function(id) {
    // var id = viewModel.getItem(index).id;
    return firebase.remove('/GTopics/' + id + '').then(function() {
      firebase.remove('/GUsers/' + config.uid + '/UTopics/' + id);
    });
  };

  return viewModel;
}

module.exports = TopicListViewModel;
