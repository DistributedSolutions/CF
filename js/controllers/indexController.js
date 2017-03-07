// angular.module("CFApp")
// 	.controller("indexController",["$scope", "interfaceDBService","torrentDBService","torrentService",
// 		function($scope, interfaceDBService,torrentDBService,torrentService){
// 			var indexScope = $scope;
			
// 			interfaceDBService.init();
// 			torrentDBService.init(() => {
// 				torrentService.init();
// 			});
// 		}
// 		]);

angular.module("CFApp")
	.controller("indexController",["$scope", "interfaceDBService",
		function($scope,interfaceDBService){
			var indexScope = $scope;
			interfaceDBService.init();
		}
		]);