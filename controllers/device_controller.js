var deviceController = angular.module('deviceController', []);
deviceController.controller('DeviceCtrl', function ($scope, $state, $rootScope, device, files_in_data_app) {
	$scope.cancel_install = false;
	$scope.app_index = 0;
	$scope.total_app = 0;
	$scope.device = device;

	$scope.install_app = function (files) {
		$rootScope.client.install(device.device_id, files[$scope.app_index], function (err) {
			if (err) {
				console.log(err);
				$('#progress-dialog').modal('hide');
				$scope.app_index = 0;
			} else {
				if (!$scope.cancel_install && $scope.app_index < files.length - 1) {
					$scope.app_index++;
					$('#progress-bar').progress('increment');
					$scope.install_app(files);
				}

				if ($scope.app_index == files.length - 1) {
					$scope.app_index = $scope.total_app;
					$state.reload();
				}
			}
		});
	};

	$scope.chooseFile = function (ele) {
		var chooser = $(ele);
		chooser.change(function (evt) {
			var files = $(this).val().split(';');
			$('#progress-dialog').modal('show');
			$('#progress-bar').progress('increment');
			$scope.total_app = files.length;
			$scope.$apply();
			$scope.install_app(files);
		});
		chooser.trigger('click');
	};

	$scope.remove_app = function (packages) {
		var package_name = $(packages[$scope.app_index]).val();
		$rootScope.client.uninstall(device.device_id, package_name, function (err) {
			if (err) {
				console.log(err);
				$('#progress-dialog').modal('hide');
				$scope.app_index = 0;
			} else {
				if (!$scope.cancel_install && $scope.app_index < packages.length) {
					$scope.app_index++;
					var index = $rootScope.objectPool['device_' + device.device_id].apps.map(function (obj) {
						return obj.toString()
					}).indexOf(package_name);
					$rootScope.objectPool['device_' + device.device_id].apps.splice(index, 1);
					$scope.$apply();
					$('#progress-bar').progress('increment');
					$scope.remove_app(packages);
				}
			}
		});
	};

	$scope.removePackages = function () {
		$('#delete-confirm-dialog').modal({
			closable: false,
			onDeny: function () {},
			onApprove: function () {
				var packages = $('.list-item table.ui.table tbody input.select-package:checked');
				$scope.total_app = packages.length;
				$scope.$apply();
				$('#progress-dialog').modal('show');
				$('#progress-bar').progress('increment');
				$scope.remove_app(packages);
			}
		}).modal('show');
	};

	if (!$rootScope.objectPool['device_' + device.device_id]) {
		$rootScope.objectPool['device_' + device.device_id] = {
			apps: []
		};
		$rootScope.client.getPackages(device.device_id, function (err, packages) {
			packages.forEach(function (package) {
				if (files_in_data_app.indexOf(package) > -1) {
					$rootScope.objectPool['device_' + device.device_id].apps.push(package);
				}
			});
			$rootScope.$apply();
		});
	}
});
