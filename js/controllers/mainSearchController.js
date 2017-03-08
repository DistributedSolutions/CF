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
	.controller("mainSearchController",["$scope", "$routeParams", "interfaceDBService", "$http", "jsonRPCService", "$log",
		function($scope, $routeParams, interfaceDBService, $http, jsonRPCService, $log){
			var mainSearchScope = $scope;
			//init
			mainSearchScope.interfaceDBService = interfaceDBService;
			mainSearchScope.channelTags = interfaceDBService.channelTags;
			mainSearchScope.contentTags = interfaceDBService.contentTags;

			mainSearchScope.tags = mainSearchScope.channelTags;
			mainSearchScope.$watch('interfaceDBService.channelChange()', (newVal, oldVal) => {
				if (newVal != oldVal) {
					mainSearchScope.tags = newVal;
					mainSearchScope.getTopChannelsForTags(newVal);
				}
			});
			mainSearchScope.$watch('interfaceDBService.contentChange()', (newVal, oldVal) => {
				if (newVal != oldVal) {
					mainSearchScope.tags = newVal;
				}
			});

			mainSearchScope.channels = []
			mainSearchScope.content = []
			mainSearchScope.tagsChannels = []

			mainSearchScope.ops = ["Channel", "Content"];
			mainSearchScope.selectedOp = mainSearchScope.ops[0]
			//----

			mainSearchScope.getTopChannelsForTags = function(tags) {
				angular.forEach(tags, (tag, index) => {
					//go through each tags given
					interfaceDBService.getTopChannelsForTag(tag.id, (rows) => {
						$log.info("Row count [" + rows.length + "] for tag.id [" + tag.id + "]");
						//go through each row and request for the hash
						angular.forEach(rows, (row, index) => {
							//get the hash from each row and make a request for each channel
							var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getChannel, row.hash)
							$http.post(jsonRPCSCope.hostApi, rpc)
								.then((res) => {
									//success
									$log.info("Success in channel tag req for tag: [" + tag + "]")
									mainSearchScope.tagsChannels.push({tag: tag.name, res: res})
								}, (res) => {
									//error
									$log.info("Error in channel tag req for tag: [" + tag + "]")
								});
						})
					})
				})
			}

			mainSearchScope.getTopContentForTags = function(tags) {

			}
		}
	]);