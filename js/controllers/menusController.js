angular.module("CFApp")
	.controller("menusController",["$scope", "$routeParams", "interfaceDBService",
		function($scope, $routeParams, interfaceDBService){
			var menusScope = $scope;
			menusScope.tags = [];
			$scope.isConnected = "NO:("
			interfaceDBService.db.serialize(function(){
					interfaceDBService.db.all("SELECT * FROM " + DB_CONSTANTS.LOOKUP_DB.tableNames.channelTag,function(err, rows) {
						if(err === null) {
							console.log("Successfully querried channel tags");
						} else {
							console.log("Error querrying channel tags [" + err + "]");
						}
						console.log(rows);
						menusScope.tags = rows;
						menusScope.$apply();
					});
		});
	}]);