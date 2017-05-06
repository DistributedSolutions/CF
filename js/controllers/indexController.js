
var COOKIE_CURRENT_USER = "current_user";

angular.module("CFApp")
	.controller("indexController",["$scope", "interfaceDBService", "localDBService", "$location", "$cookies",
		function($scope,interfaceDBService, localDBService, $location, $cookies){
			var indexScope = $scope;

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
				indexScope.profiles = [];
				localDBService.loadAllProfiles((rows) => {
					angular.forEach(rows, (user) => {
						user.data = JSON.parse(user.data);
						indexScope.profiles.push(user);
					});
					indexScope.$apply(() => {indexScope.profiles});
					$log.log("profilesController: Finished loading all rows: " + rows);
				});
			}

			indexScope.loginUser = function(username) {
				$cookies.set(COOKIE_CURRENT_USER, username);
				$('#selectUserModal').modal('hide');
			}

			// START
			indexScope.profileTemplate = {
				data: {
					channels: []	
				}
			}
			indexScope.profiles = [];
			indexScope.usernameExists = false;
			indexScope.loadProfiles();
			//------

				//-init-
				interfaceDBService.init();
				localDBService.init();
				//------
			}
		]);