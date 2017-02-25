// angular.module("CFApp")
// 	.controller("mainSearchController",["$scope", "$routeParams", "interfaceDBService",
// 		function($scope, $routeParams, interfaceDBService){
// 			var mainSearchScope = $scope;

// 			mainSearchScope.init = function() {
// 				mainSearchScope.groupBy = ['Tags', 'Channels']
// 				interfaceDBService.loadChannelTags(function(tags){
// 					mainSearchScope.tags = tags;
// 					mainSearchScope.$apply();
// 				});
// 			}

// 			mainSearchScope.init();
// 		}
// 	]);
angular.module("CFApp")
	.controller("mainSearchController",["$scope", "$routeParams",
		function($scope, $routeParams){
			var mainSearchScope = $scope;

		}
	]);