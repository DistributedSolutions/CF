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
			profileScope.channelCopy = profileScope.channelCopyTemplate;
			profileScope.tab = 0;
			profileScope.showSelectedChannel = true;
		}

		profileScope.addPlaylist = function() {
			if (profileScope.newPlaylistName != null && profileScope.newPlaylistName.trim().length > 0) {
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
			if (value.length > 0) {
				profileScope.channelCopy.playlist.playlists[playlistIndex].playlist.push(value);
				tempPlaylistItem.val('');
			}
		}

		profileScope.removePlaylistItem = function(playlistIndex, playlistItemIndex) {
			profileScope.channelCopy.playlist.playlists[playlistIndex].playlist.splice(playlistItemIndex,1);
		}

		profileScope.addSuggestedChannel = function() {
			if (profileScope.newSuggestedChannelHash != null && profileScope.newSuggestedChannelHash.trim().length > 0) {
				profileScope.channelCopy.suggestedchannels.hashlist.push(
					profileScope.newSuggestedChannelHash
					);
				profileScope.newSuggestedChannelHash = "";
			}
		}

		profileScope.removeSuggestedChannel = function(index) {
			profileScope.channelCopy.suggestedchannels.hashlist.splice(index,1);
		}

		profileScope.addContent = function() {
			if (profileScope.newContentName != null && profileScope.newContentName.trim().length > 0) {
				profileScope.channelCopy.contentlist.contentlist.push({
					title: profileScope.newContentName
				});
				profileScope.newContentName = "";
			}
		}

		profileScope.removeContent = function(index) {
			profileScope.channelCopy.contentlist.contentlist.splice(index,1);
		}

		profileScope.swapContent = function(index) {
			profileScope['showContent' + index] = !profileScope['showContent' + index];
		}

		// START
		profileScope.username = $routeParams.username;
		profileScope.loadProfile(profileScope.username);
		profileScope.channelCopyTemplate = {
			playlist: {
				playlists: []
			},
			suggestedchannels: {
				hashlist : []
			},
			filelist: {
				filelist: []
			},
			contentlist: {
				contentlist: []
			}
		};
		profileScope.channelCopy = profileScope.channelCopyTemplate;
		profileScope.showSelectedChannel = false;
		profileScope.tab = 0;
		//------
	}]);