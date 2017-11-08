'use strict';
var homeApp = angular.module('Home');

homeApp.controller('HomeController',
  function ($scope, $http, $rootScope, $interval) {

    $http({method: 'GET', url: 'config.json'}).
                then(function success(response) {
                    $scope.conf = response.data.conf;
    });

    $scope.load = function () {
      $http({method: 'GET', url: $rootScope.globals.currentUser.username+'.json'}).
                then(function success(response) {
                    $scope.user = response.data.user;
      });
    }

    $scope.load();

    var loadInterval = $interval(function(){
                  $scope.load();
    }, 20000);

    $scope.$on('$destroy', function(){
        $interval.cancel(loadInterval)
    });

    $scope.data = {};

    $scope.sort = function (column) {
      $scope.sortOrder = ($scope.sortOrder === column) ? "-"+column : column;
    }

    $scope.oneTask = function (id) {
        $scope.data.snum = $scope.user.tasks.findIndex(
           function(x,i) {
             if (x.Id === id) return (i+1);
        });
      $scope.data.mode = 'Task';
    }

    $scope.handleDrop = function(id) {
      var ddTd = angular.element( document.querySelector( '#td-'+id ) );
      var itemId = ddTd[0].lastChild.id;
      $scope.user.tasks.forEach(function(entry) {
        if ('div-' + entry.Id === itemId) {
          entry.Status=''+id;
        }
      });
    }

  }
)

homeApp.directive('draggable', function() {
  return function(scope, element) {
    var el = element[0];
    el.draggable = true;
    el.addEventListener(
      'dragstart',
      function(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', this.id);
        this.classList.add('drag');
        return false;
      },
      false
    );
    el.addEventListener(
      'dragend',
      function(e) {
        this.classList.remove('drag');
        return false;
      },
      false
    );
  }
});

homeApp.directive('droppable', function() {
  return {
    scope: {
      drop: '&'
    },
    link: function(scope, element) {
      var el = element[0];
      el.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );
      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );
      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );
      el.addEventListener(
        'drop',
        function(e) {
          if (e.stopPropagation) e.stopPropagation();
          this.classList.remove('over');
          var item = document.getElementById(e.dataTransfer.getData('Text'));
          this.appendChild(item);
          scope.$apply('drop()');
          return false;
        },
        false
      );
    }
  }
});

homeApp.directive("formatDate", function(){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function(modelValue){
        return new Date(modelValue);
      })
    }
  }
});
