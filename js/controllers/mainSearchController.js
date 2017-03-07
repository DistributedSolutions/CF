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
	.controller("mainSearchController",["$scope", "$routeParams", "interfaceDBService",
		function($scope, $routeParams, interfaceDBService){
			var mainSearchScope = $scope;
			//init
			mainSearchScope.interfaceDBService = interfaceDBService;
			mainSearchScope.channelTags = interfaceDBService.channelTags;
			mainSearchScope.contentTags = interfaceDBService.contentTags;

			mainSearchScope.tags = mainSearchScope.channelTags;
			mainSearchScope.$watch('interfaceDBService.channelChange()', (newVal, oldVal) => {
				if (newVal != oldVal) {
					mainSearchScope.tags = newVal;
				}
			});
			mainSearchScope.$watch('interfaceDBService.contentChange()', (newVal, oldVal) => {
				if (newVal != oldVal) {
					mainSearchScope.tags = newVal;
				}
			});
			mainSearchScope.ops = ["Channel", "Content"];
			mainSearchScope.selectedOp = mainSearchScope.ops[0]
			//----
		}
	]);