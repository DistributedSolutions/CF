angular.module("CFApp")
.controller("profileController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log", "localDBService",
	function($scope, $routeParams, $http, jsonRPCService, $log, localDBService){
		var profileScope = $scope;

		profileScope.loadProfile = function(username) {
			profileScope.profiles = [];
			localDBService.loadProfile(username, (profile) => {
				profile.data = JSON.parse(profile.data);
				profileScope.profile = profile;
				profileScope.$apply(() => {profileScope.profile});
				$log.log("profilesController: Finished loading row: " + profile);
			});
		}

		profileScope.createNewChannel = function() {
			profileScope.channelCopy = {
				playlist: {
					playlists: []
				}
			};
			profileScope.tab = 0;
			profileScope.showSelectedChannel = true;
		}

		profileScope.addPlaylist = function() {
				if (profileScope.newPlaylistName) {
				profileScope.channelCopy.playlist.playlists.push({
					title: profileScope.newPlaylistName,
					playlist: []
				});
				profileScope.newPlaylistName = "";
			}
		}

		profileScope.removePlaylist = function(index) {
			profileScope.channelCopy.playlist.playlists.splice(index,1);
		}

		profileScope.addPlaylistItem = function(playlistIndex) {
			var tempPlaylistItem = $('#newPlaylistItemHash' + playlistIndex);
			var value = tempPlaylistItem.val();
			profileScope.channelCopy.playlist.playlists[playlistIndex].playlist.push(value);
			tempPlaylistItem.val('');
		}

		profileScope.removePlaylistItem = function(playlistIndex, playlistItemIndex) {
			profileScope.channelCopy.playlist.playlists[playlistIndex].playlist.splice(playlistItemIndex,1);
		}

		// START
		profileScope.username = $routeParams.username;
		profileScope.loadProfile(profileScope.username);
		profileScope.channelCopy = {
			playlist: {
				playlists: []
			}
		};
		profileScope.showSelectedChannel = false;
		profileScope.tab = 0;
		//------
	}]);