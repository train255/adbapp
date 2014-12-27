var homeController = angular.module('homeController', []);
homeController.controller('HomeCtrl', function ($scope, $rootScope, device) {
	$scope.device_info = device.device_info;
});
