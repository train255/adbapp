var deviceController = angular.module('deviceController', []);
deviceController.controller('DeviceCtrl', function ($scope, $rootScope, device) {
	$scope.cancel_install = false;
	$scope.app_index = 0;
	$scope.total_app = 0;

	$scope.install_app = function (files) {
		console.log($scope)
		$rootScope.client.install(device.device_id, files[$scope.app_index], function (err) {
			if (!err) {
				console.log('success');
			}
			if (!$scope.cancel_install && $scope.app_index < files.length - 1) {
				$scope.app_index++;
				$('#progress-dialog').progress({percent: $scope.app_index});
				$scope.install_app(files);
			}

			if ($scope.app_index == files.length - 1) {
				$('#progress-dialog').modal('hide');
				$scope.app_index = 0;
			}

		});
	};

	$scope.chooseFile = function (ele) {
		var chooser = $(ele);
		chooser.change(function (evt) {
			$('#progress-dialog').modal('show');
			$('#progress-bar').progress({
				total: files.length,
				text: {
					active: 'Adding {value} of {total} packages',
					success: '{total} Packages Installed!'
				}
			});
			var files = $(this).val().split(';');
			$scope.total_app = files.length;
			$scope.install_app(files);
		});
		chooser.trigger('click');
	};

	$scope.removePackages = function () {
		$('#delete-confirm-dialog').modal({
			closable: false,
			onDeny: function () {},
			onApprove: function () {
				$('.list-item table.ui.table tbody input.select-package:checked').each(function () {
					var package_name = $(this).val();
					$rootScope.client.uninstall(device.device_id, package_name, function (err) {
						if (!err) {
							var index = $scope.apps.map(function (obj) {
								return obj.toString()
							}).indexOf(package_name);
							$scope.apps.splice(index, 1);
							$scope.$apply();
						}
					});
				});
			}
		}).modal('show');
	};

	$scope.notSystemApp = function (app) {
		if (app.split('.').indexOf('android') > -1) {
			return false;
		}
		return true;
	};

	$rootScope.client.getPackages(device.device_id, function (err, packages) {
		$scope.apps = packages;
		$scope.$apply();
	});
});
