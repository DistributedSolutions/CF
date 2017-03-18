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

		mainSearchScope.getTopChannelsForTags = function(tags) {
			angular.forEach(tags, (tag, tagIndex) => {
				if (tagIndex) {
					//go through each tags given
					interfaceDBService.getTopChannelsForTag(tag.id, (rows) => {
						if (!rows || rows.length == 0) {
							return;
						}
						$log.debug("Row count [" + rows.length + "] for tag.id [" + tag.id + "]");
						var rpcRows = [];
						angular.forEach(rows, (row) => {
							rpcRows.push(row.hash);
						});
						//request all the rows of things :) all of the things!!
						var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getChannels, {hashlist: rpcRows});
						// $log.debug("Sending request [" + JSON.stringify(rpc) + "]");
						$http(rpc)
						.then((res) => {
								if (res.data.error) {
									//error in rpc
									$log.error("Error in channels tag req for channels: [" + tag + "] error: [" + JSON.stringify(res.data.error) + "]");
								} else {
									//success
									var tempArr = groupBy4(res.data.result);
									$log.info("Success in channels tag req for channels: [" + tag + "] [" + tempArr.length + "]");
									mainSearchScope.channelTags[tagIndex].channels = tempArr;
								}
							}, (res) => {
								//error on call SHOULD NEVER HAPPEN
								$log.error("Error in channels tag req for channels: [" + tag + "]");
							});
					});
				}
			});
		}

		mainSearchScope.getTopContentForTags = function(tags) {
			angular.forEach(tags, (tag, tagIndex) => {
				if (tagIndex) {
					//go through each tags given
					interfaceDBService.getTopContentsForTag(tag.id, (rows) => {
						if (!rows || rows.length == 0) {
							return;
						}
						$log.debug("Row count [" + rows.length + "] for tag.id [" + tag.id + "]");
						var rpcRows = [];
						angular.forEach(rows, (row) => {
							rpcRows.push(row.hash);
						});
						//request all the rows of things :) all of the things!!
						var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getContents, {hashlist: rpcRows});
						$log.debug("Sending request [" + JSON.stringify(rpc) + "]");
						$http(rpc)
						.then((res) => {
								if (res.data.error) {
									//error in rpc
									$log.error("Error in contents tag req for contents: [" + tag + "] error: [" + JSON.stringify(res.data.error) + "]");
								} else {
									//success
									var tempArr = groupBy4(res.data.result.contentlist);
									$log.info("Success in contents tag req for contents: [" + tag + "] [" + tempArr.length + "]");
									mainSearchScope.contentTags[tagIndex].content = tempArr;
								}
							}, (res) => {
								//error on call SHOULD NEVER HAPPEN
								$log.error("Error in contents tag req for contents: [" + tag + "]");
							});
					});
				}
			});
		}

		//init
		mainSearchScope.interfaceDBService = interfaceDBService;
		mainSearchScope.channelTags = interfaceDBService.channelTags;
		mainSearchScope.contentTags = interfaceDBService.contentTags;

		mainSearchScope.$watch('interfaceDBService.channelChange()', (newVal, oldVal) => {
			if (newVal != oldVal && newVal != null) {
				mainSearchScope.channelTags = newVal;
				mainSearchScope.getTopChannelsForTags(newVal);
			}
		});
		mainSearchScope.$watch('interfaceDBService.contentChange()', (newVal, oldVal) => {
			if (newVal != oldVal && newVal != null) {
				mainSearchScope.contentTags = newVal;
				mainSearchScope.getTopContentForTags(newVal);
			}
		});

		mainSearchScope.ops = ["Channels", "Content"];
		mainSearchScope.selectedOp = mainSearchScope.ops[0]
		if (mainSearchScope.channelTags) {
			mainSearchScope.getTopChannelsForTags(mainSearchScope.channelTags);
		}
		if (mainSearchScope.contentTags) {
			mainSearchScope.getTopContentForTags(mainSearchScope.contentTags);
		}
		//----
	}
]);