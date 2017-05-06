
var COOKIE_CURRENT_USER = "current_user";

angular.module("CFApp")
.controller("indexController",["$scope", "interfaceDBService", "localDBService", "$location", "$cookies", "$log",
	function($scope,interfaceDBService, localDBService, $location, $cookies, $log) {
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
			if (!$cookies.get(COOKIE_CURRENT_USER)) {
				$('#selectUserModal').modal('show');
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
			$cookies.put(COOKIE_CURRENT_USER, username);
			indexScope.profileUsername = username;
			$('#selectUserModal').modal('hide');
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
		
		indexScope.checkUser();
		//------
		}]);