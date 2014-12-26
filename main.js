var trainCloud = angular.module('trainCloud', [
	'ui.router',
	'containerController', 'homeController'
]);

trainCloud.config(function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.when('', '/home');
	$urlRouterProvider.otherwise('/not_found');
	$stateProvider
		.state('app', {
			url: '/',
			templateUrl: 'templates/container.html',
			controller: 'ContainerCtrl'
		})
		.state('app.home', {
			url: '/home',
			templateUrl: 'templates/home.html',
			controller: 'HomeCtrl'
		})
});

trainCloud.run(function ($rootScope) {
	$rootScope.adb = require('adbkit');
	$rootScope.client = $rootScope.adb.createClient();

	$rootScope.client.trackDevices()
		.then(function (tracker) {
			tracker.on('add', function (device) {
				$rootScope.client.getProperties(device.id, function(err, properties){
					console.log(properties);
					$rootScope.device_id = device.id;
					$rootScope.device_model = properties["ro.product.model"];
					$rootScope.$apply();
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
});
