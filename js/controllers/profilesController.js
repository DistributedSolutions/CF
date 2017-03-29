angular.module("CFApp")
.controller("profilesController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log", "localDBService",
	function($scope, $routeParams, $http, jsonRPCService, $log, localDBService){
		var profilesScope = $scope;

		profilesScope.createProfile = function() {
			var user = angular.copy(profilesScope.profileTemplate);
			user.username = profilesScope.usernameCreate;
			localDBService.saveProfile(user, () => {
				$log.log("Successfully added profile :)");
				profilesScope.loadProfiles();
			});
			profilesScope.usernameExists = false;
			profilesScope.usernameCreate = "";
			profilesScope.showCreateProfile = false;
			if (profilesScope.modalExistingVerifiedChannelSuccessfully) {
				$('#existingChannelModal').modal('hide');
				// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
			}
		}

		profilesScope.validateCreate = function() {
			var ps = profilesScope.profiles;
			var uExists = false;
			for(var i = 0; i < ps.length; i++) {
				if(ps[i].username.trim() == profilesScope.usernameCreate) {
					uExists = true;
					break;
				}
			}
			profilesScope.usernameExists = uExists;
		}

		profilesScope.loadProfiles = function() {
			profilesScope.profiles = [];
			localDBService.loadAllProfiles((rows) => {
				angular.forEach(rows, (user) => {
					user.data = JSON.parse(user.data);
					profilesScope.profiles.push(user);
				});
				profilesScope.$apply(() => {profilesScope.profiles});
				$log.log("profilesController: Finished loading all rows: " + rows);
			});
		}

		// START
		profilesScope.profileTemplate = {
			channels: []
		}
		profilesScope.profiles = [];
		profilesScope.usernameExists = false;
		profilesScope.loadProfiles();
		//------
	}]);