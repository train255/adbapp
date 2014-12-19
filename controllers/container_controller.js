var containerController = angular.module('containerController', []);
containerController.controller('ContainerCtrl', function ($scope, $rootScope) {
	$scope.getListPackage = function() {
		$rootScope.client.getPackages($rootScope.device_id, function(err, packages){
			$scope.apps = packages;
			$scope.$apply();
		});
	}
});
