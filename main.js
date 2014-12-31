var adbApp = angular.module('adbApp', [
	'ui.router',
	'containerController', 'homeController', 'deviceController'
]);

adbApp.config(function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.when('', '/home');
	$urlRouterProvider.when('/', '/home');
	$urlRouterProvider.otherwise('/not_found');
	$stateProvider
		.state('app', {
			templateUrl: 'templates/container.html',
			controller: 'ContainerCtrl',
			resolve: {
				device: function ($q, $rootScope) {
					var defer = $q.defer();
					$rootScope.adb = require('adbkit');
					$rootScope.client = $rootScope.adb.createClient();
					$rootScope.client.trackDevices()
						.then(function (tracker) {
							tracker.on('add', function (device) {
								$rootScope.client.getProperties(device.id, function (err, properties) {
									defer.resolve({ device_id: device.id, device_info: properties });
								});
								console.log('Device %s was plugged in', device.id)
							})
							tracker.on('remove', function (device) {
								console.log('Device %s was unplugged', device.id)
							})
							tracker.on('end', function () {
								console.log('Tracking stopped')
							})
						})
						.catch(function (err) {
							console.error('Something went wrong:', err.stack)
						})
					return defer.promise;
				}
			}
		})
		.state('app.home', {
			url: '/home',
			templateUrl: 'templates/home.html',
			controller: 'HomeCtrl'
		})
		.state('app.device', {
			url: '/device',
			templateUrl: 'templates/device.html',
			controller: 'DeviceCtrl'
		})
});

adbApp.run(function ($rootScope) {
	$rootScope.objectPool = {};
});
