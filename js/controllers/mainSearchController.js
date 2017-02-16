angular.module("CFApp")
	.controller("mainSearchController",["$scope", "$routeParams", "interfaceDBService",
		function($scope, $routeParams, interfaceDBService){
			var mainSearchScope = $scope;

			mainSearchScope.init = function() {
				interfaceDBService.loadChannelTags(function(tags){
					mainSearchScope.tags = tags;
					mainSearchScope.$apply();
				});
			}

			mainSearchScope.init();
		}
	]);