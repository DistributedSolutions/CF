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

			mainSearchScope.ops = ["Channel", "Content"];
			mainSearchScope.selectedOp = mainSearchScope.ops[0]
			//----

			mainSearchScope.getTopChannelsForTags = function(tags) {
				angular.forEach(tags, (tag, tagIndex) => {
					if (tagIndex) {

					//go through each tags given
					interfaceDBService.getTopChannelsForTag(tag.id, (rows) => {
						if (!rows) {
							return;
						}
						$log.debug("Row count [" + rows.length + "] for tag.id [" + tag.id + "]");
						var rpcRows = [];
						angular.forEach(rows, (row) => {
							rpcRows.push(row.hash);
						});
						//request all the rows of things :) all of the things!!
						var rpc = jsonRPCService.getJsonRpc(jsonRPCService.getChannels, {hashlist: rpcRows});
						$log.debug("Sending request [" + JSON.stringify(rpc) + "]");
						$http(rpc)
						.then((res) => {
							if (res.data.error) {
									//error in rpc
									$log.error("Error in channels tag req for channels: [" + tag + "] error: [" + JSON.parse(res.error) + "]");
								} else {
									//success
									var tempArr = [];
									var count = 0;
									//groups by 4
									angular.forEach(res.data.result, (channel, i) => {
										if(i % 4 == 0 || i == 0) {
											tempArr.push([]);
											count++;
										}
										tempArr[count-1].push(channel);
									});
									$log.info("Success in channels tag req for channels: [" + tag + "] [" + tempArr.length + "]");
									mainSearchScope.tags[tagIndex].channels = tempArr;
								}
							}, (res) => {
								//error on call SHOULD NEVER HAPPEN
								$log.error("Error in channels tag req for channels: [" + tag + "]");
							});
					})
				}
			})
			}

			mainSearchScope.groupBy4 = function(tags) {

			}

			mainSearchScope.getTopContentForTags = function(tags) {

			}
		}
		]);