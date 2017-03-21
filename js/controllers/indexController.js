angular.module("CFApp")
	.controller("indexController",["$scope", "interfaceDBService",
		function($scope,interfaceDBService){
			var indexScope = $scope;


			indexScope.historyBack = function() {
				console.log("History Button Back");
				window.history.back();
			}
			
			indexScope.historyForward = function() {
				console.log("History Button Forward");
				window.history.forward();
			}

			//-init-
			interfaceDBService.init();
			//------
		}
		]);