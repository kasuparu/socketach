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
					template: '' +
					'<div class="row-fluid">' +
							'<div class="span12">' +
								'<p class="lead">{{headerText}}</p>' +
							'</div>' +
						'</div>' + 
						'<div message-list="" message-list-header="message"></div>' +
					'</div>'
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
	.controller('messageListController', ['$scope', 'socket', function($scope, socket) {
		$scope.loading = true;
		console.log('messageListController starting');
		$scope.messages = [];
		socket.forward(['update', 'initMessages'], $scope);
		
		$scope.postMessage = function(message) {};
		
		socket.on('connect', function () {
			$scope.loading = false;
			console.log('socket connected');
			
			$scope.$on('socket:initMessages', function(event, data) {
				console.log('socket:initMessages got ' + (data.list ? data.list.length : 0) + ' messages');
				$scope.messages = $scope.messages.concat(data.list);
			});
			
			$scope.$on('socket:update', function(event, data) {
				console.log('socket:update got a message');
				$scope.messages.push(data);
			});
			if (!$scope.messages.length) {
				socket.emit('enter');
			}
			
			$scope.postMessage = function(message, callback) {
				socket.emit('post', message, function(commitedMessage) {
					$scope.messages.push(commitedMessage);
					callback(commitedMessage);
				});
			};
		});
	}])
	.controller('messageWriterController', ['$scope', function($scope) {
		$scope.post = function() {
			$scope.$parent.postMessage($scope.message, function() {
				$scope.message = {};
			});
		}
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
 *                                           
 *      /\/\   ___  ___ ___  __ _  __ _  ___ 
 *     /    \ / _ \/ __/ __|/ _` |/ _` |/ _ \
 *    / /\/\ \  __/\__ \__ \ (_| | (_| |  __/
 *    \/    \/\___||___/___/\__,_|\__, |\___|
 *                                |___/      
 */
	.directive('message', function() {
		return {
			restrict: 'A',
			scope: {
				message: '=?message'
			},
			template: '' +
				'<div>' +
					'<div class="row-fluid"><div class="span12"><span style="color:gray;">{{message.ts | date:\'yyyy-MM-dd HH:mm:ss.sss\'}}: </span>{{message.msg}}</div></div>' +
				'</div>',
			replace: true
		};
	})
	.directive('messageWriter', function() {
		return {
			restrict: 'A',
			scope: {
				message: '=?message',
			},
			controller: 'messageWriterController',
			template: '' +
				'<div>' +
					'<div class="row-fluid"><div class="span12">' +
						'<form name="messageWriter" ng-submit="post()">' +
							'<div class="input-prepend"><span class="add-on">Post:</span><input type="text" ng-model="message.msg" required /></div>' +
							'</form>' +
					'</div></div>' +
				'</div>',
			replace: true
		}
	})
/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
	.directive('messageList', function() {
		return {
			restrict: 'A',
			scope: {
				elementId: '=id',
				header: '=messageListHeader'
			},
			controller: 'messageListController',
			template: '' +
				'<div class="container-fluid counter-container" ng-class="{\'loading\': loading}">' +
					'<div ng-if="message && !loading && (!messages || !messages.length)" list-header="header"></div>' +
					'<div message-writer=""></div>' +
					'<div ng-repeat="item in messages | orderBy:\'ts\':true" message="item"></div>' +
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
	.directive('listHeader', function() {
        return {
            restrict: 'A',
            scope: {
                    header: '=listHeader'
            },
            template:
                    '<div><center><p>{{header.text}}</p></center></div>',
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