angular.module("CFApp")
.controller("indexController",["$scope", "interfaceDBService", "localDBService", "$location", "$log","jsonRpcService","$http",
	function($scope,interfaceDBService, localDBService, $location, $log, jsonRpcService, $http) {
		var indexScope = $scope;
		indexScope.location = $location;

		indexScope.historyBack = function() {
			console.log("History Button Back");
			window.history.back();
		}

		indexScope.historyForward = function() {
			console.log("History Button Forward");
			window.history.forward();
		}

		indexScope.checkUser = function() {
			var user = localDBService.getCurrentUser();
			if (!user) {
				$('#selectUserModal').modal({
					show: true,
					keyboard: false
				});
			} else {
				indexScope.profileUsername = user.username
			}
		}

		indexScope.createProfile = function() {
			var user = angular.copy(indexScope.profileTemplate);
			user.username = indexScope.usernameCreate;
			localDBService.saveProfile(user, () => {
				$log.log("Successfully added profile :)");
				indexScope.loadProfiles();
			});
			indexScope.usernameExists = false;
			indexScope.usernameCreate = "";
			indexScope.showCreateProfile = false;
		}

		indexScope.validateCreate = function() {
			var ps = indexScope.profiles;
			var uExists = false;
			for(var i = 0; i < ps.length; i++) {
				if(ps[i].username.trim() == indexScope.usernameCreate) {
					uExists = true;
					break;
				}
			}
			indexScope.usernameExists = uExists;
		}

		indexScope.loadProfiles = function() {
			indexScope.profiles = localDBService.loadAllProfiles();
		}

		indexScope.loginUser = function(username) {
			localDBService.setCurrentUser(username);
			indexScope.profileUsername = username;
			$('#selectUserModal').modal('hide');
		}

		indexScope.swapUser = function() {
			localDBService.setCurrentUser("");
			$('#selectUserModal').modal({
					show: true,
					keyboard: false
				});
		}

		indexScope.setConstants = function() {
			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.getConstantsVal, {});
			$http(rpc)
			.then((res) => {
					if (res.data.error) {
						//error in rpc
						$log.error("Error requesting constants error: [" + JSON.stringify(res.data.error) + "]");
					} else {
						//success
						indexScope.constants = res.data.result;
						$log.info("Success requesting constants");
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("Error requesting constants error: [" + res + "]");
				});
		}

		// START
		indexScope.profileTemplate = {
			channels: [],
			video: []
		}
		indexScope.profiles = [];
		indexScope.usernameExists = false;
		indexScope.loadProfiles();
		indexScope.profile = "";

		interfaceDBService.init();
		localDBService.init();
		
		indexScope.setConstants();
		indexScope.checkUser();
		//------
		}]);