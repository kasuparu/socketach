/***
 *       ___             __ _       
 *      / __\___  _ __  / _(_) __ _ 
 *     / /  / _ \| '_ \| |_| |/ _` |
 *    / /__| (_) | | | |  _| | (_| |
 *    \____/\___/|_| |_|_| |_|\__, |
 *                            |___/ 
 */
var socketachApp = angular.module('socketachApp', [
	'ngRoute',
	'btford.socket-io'
]);

socketachApp
	.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
			$locationProvider
				.html5Mode(false)
				.hashPrefix('!');
			
			$routeProvider
				.when('/', {
					controller: 'mainPageController',
					template: '' +
					'<div class="row-fluid">' +
							'<div class="span12">' +
								'<p class="lead">{{headerText}}</p>' +
							'</div>' +
						'</div>' + 
						'<div msg-list="" msg-list-message="message"></div>'
				})
				.otherwise({
					redirectTo: '/'
				});
		}
	]);


/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
socketachApp
	.factory('timerListFactory', ['$http', function($http) {
		return {
			getTimerListAsync: function(url, callback) {
				$http.get(url + '/timers').success(callback);
			}
		};
	}])
	.controller('timerListController', ['$scope', 'timerListFactory', function($scope, timerListFactory) {
		/*$scope.loading = true;
		
		var createRange = function(target) {
			return function () {
				var range = [];
				for (var i = 0; i < target.length; i = i + 3) range.push(i);
				return range;
			}
		}
		
		$scope.concat = function() {
			return Array.prototype.slice.call(arguments).join('');
		}
		
		timerListFactory.getTimerListAsync($scope.timerListUrl, function(results) {
			$scope.loading = false;
			
			if (results.length === 0) {
				$scope.timers = [];
			} else {
				$scope.timers = results;
				
			}
			$scope.timers.range = createRange($scope.timers);
		});
		
		$scope.timerListAppend = function(id, callback) {
			timerFactory.getTimerAsync(id, function(timer) {
				$scope.timers.push(timer);
				$scope.timers.range = createRange($scope.timers);
				console.log('adding to timers: ' + JSON.stringify(timer));
				callback(timer);
			})
		};
		
		$scope.removeTimerById = function(id) {
			console.log('searching timer ' + id);
			$scope.timers.forEach(function(e, i) {
				if (e.id === id) {
					console.log('removed timer with id ' + id);
					$scope.timers.splice(i, 1);
					$scope.timers.range = createRange($scope.timers);
				}
			});
		};
		
		$scope.replaceTimer = function(id, timer) {
			console.log('searching timer ' + id);
			$scope.timers.forEach(function(e, i) {
				if (e.id === id) {
					console.log('replaced timer with id ' + timer.id);
					$scope.timers[i] = timer;
				}
			});
		};*/
	}]);

/***
 *        ___ _               _   _                
 *       /   (_)_ __ ___  ___| |_(_)_   _____  ___ 
 *      / /\ / | '__/ _ \/ __| __| \ \ / / _ \/ __|
 *     / /_//| | | |  __/ (__| |_| |\ V /  __/\__ \
 *    /___,' |_|_|  \___|\___|\__|_| \_/ \___||___/
 *                                                 
 */
socketachApp
/***
 *     _____ _                     
 *    /__   (_)_ __ ___   ___ _ __ 
 *      / /\/ | '_ ` _ \ / _ \ '__|
 *     / /  | | | | | | |  __/ |   
 *     \/   |_|_| |_| |_|\___|_|   
 *                                 
 */
	.directive('timer', function() {
		return {
			restrict: 'A',
			scope: {
				timer: '=?timer',
				editor: '@editor',
				elementId: '=?id',
				timerLoad: '=?timerLoad'
			},
			controller: 'timerController',
			template: '' +
				'<div ng-class="{' +
					'\'loading\': loading,' +
					'\'timer-good\': !timer.denied && timer.good == 1,' +
					'\'timer-bad\': !timer.denied && timer.good == 0,' +
					'\'timer-neutral\': !timer.denied && (timer.good != 1) && (timer.good != 0),' +
					'\'timer-public\': !timer.denied && timer.public == 1,' +
					'\'timer-private\': !timer.denied && timer.public == 0' +
				'}" class="well timer" editor="false">' +
					/* Timer show */
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-good"><i ng-class="{' +
						'\'icon-thumbs-up\': timer.good == 1,' +
						'\'icon-thumbs-down\': timer.good == 0,' +
						'\'icon-adjust\': (timer.good != 1) && (timer.good != 0)' +
					'}"></i></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-public"><i ng-class="{' +
						'\'icon-eye-open\': timer.public == 1,' +
						'\'icon-eye-close\': timer.public == 0' +
					'}"></i></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-name" ng-if="timer.owner_name">' +
						'<a ng-href="#!/u/{{timer.owner_name}}">{{timer.owner_name}}</a>' +
					'</div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class=""><center>{{timer.name}}</center></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="" id="{{elementId}}time" timer-time="timer.last_restart"></div>' + // TIME HERE
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class=""><center>' + 
						'<a class="btn btn-danger" ng-if="timer.can_edit || timer.id == 0" ng-click="restart()"><i class="icon-white icon-repeat"></i> Сброс</a>' + 
						' <a ng-if="timer.public == 1" timer-twitter-link></a>' +
						' <a class="btn" ng-if="timer.can_edit" ng-click="edit()">&nbsp;<i class="icon-pencil"></i>&nbsp;</a>' +
					'</center></div>' +
				'</div>',
			replace: true
		};
	})
/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
	.directive('timerList', function() {
		return {
			restrict: 'A',
			scope: {
				timerListUrl: '=timerList',
				elementId: '=id',
				message: '=timerListMessage'
			},
			controller: 'timerListController',
			template: '' +
				'<div class="container-fluid counter-container" ng-class="{\'loading\': loading}">' +
					'<div ng-if="message && !loading && (!timers || !timers.length)" list-message="message"></div>' +
					'<div ng-repeat="n in timers.range()" class="row-fluid" id="concat(elementId, \'row\', $index)">' +
						'<div ng-repeat="item in timers.slice(n, n+3)" timer="item" id="concat(\'counter\', item.id)" class="span4"></div>' +
					'</div>' +
				'</div>',
			replace: true
		};
	})
/***
 *                                           
 *      /\/\   ___  ___ ___  __ _  __ _  ___ 
 *     /    \ / _ \/ __/ __|/ _` |/ _` |/ _ \
 *    / /\/\ \  __/\__ \__ \ (_| | (_| |  __/
 *    \/    \/\___||___/___/\__,_|\__, |\___|
 *                                |___/      
 */
	.directive('listMessage', function() {
        return {
            restrict: 'A',
            scope: {
                    message: '=listMessage'
            },
            template:
                    '<div><center><p>{{message.text}}</p></center></div>',
            replace: true
		};
    })
	.directive('yesNoIcon', function() {
		return {
			restrict: 'A',
			scope: {
				value: '=yesNoIcon'
			},
			template: '' +
				'<i ng-class="{' +
					'\'icon-ok\': value,' +
					'\'icon-remove\': !value' +
				'}"></i>'
		};
	});