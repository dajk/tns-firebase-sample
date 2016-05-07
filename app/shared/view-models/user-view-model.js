var config = require('../../shared/config');
var firebase = require('nativescript-plugin-firebase');
var observableModule = require('data/observable');
var validator = require('email-validator');

function User(info) {
  info = info || {};

  // You can add properties to observables on creation
  var viewModel = new observableModule.Observable({
    email: info.email || 'steven@mytest.com',
    password: info.password || 'steven'
  });

  viewModel.init = function(){
    firebase.init({
      url: config.apiUrl
    }).then(function (instance) {
      console.log('firebase.init done');
    }, function (error) {
      console.log('firebase.init error: ' + error);
    });
  };

  viewModel.login = function() {
    return firebase.login({
      type: firebase.LoginType.PASSWORD,
      email: viewModel.get('email'),
      password: viewModel.get('password')
    }).then(function (response) {
      config.uid = response.uid;
      var onQueryEvent = function(result) {
        config.username = result.value.username
      };
      firebase.query(onQueryEvent, '/GUsers/' + response.uid, {
        singleEvent: true,
        orderBy: {
          type: firebase.QueryOrderByType.CHILD,
          value: 'username'
        }
      });
      return response;
    }, function (error) {
      console.error(error);
    });
  };

  viewModel.register = function() {
    return firebase.createUser({
      email: viewModel.get('email'),
      password: viewModel.get('password')
    }).then(function (response) {
      firebase.setValue('/GUsers/' + response.key, {
        'username': viewModel.get('email').split('@')[0]
      });

      return response;
    });
  };

  viewModel.logout = function() {
    return firebase.logout();
  };

  return viewModel;
}

module.exports = User;
