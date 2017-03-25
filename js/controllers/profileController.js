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

		profileScope.applyChannel = function() {
			$log.log("Creating new channel.");
		}

		profileScope.selectProfile = function(index) {
			profileScope.profile = angular.copy(profileScope.profiles[i]);
			profileScope.showSelectedChannel = true;
		}

		profileScope.createNewChannel = function() {
			profileScope.channelCopy = angular.copy(profileScope.channelCopyTemplate);
			profileScope.tab = 0;
			profileScope.showSelectedChannel = true;
			profileScope.showCreateChannel = true;
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
				profileScope.showContent.push(true);
			}
		}

		profileScope.removeContent = function(index) {
			profileScope.showContent.splice(index,1);
			profileScope.channelCopy.contentlist.contentlist.splice(index,1);
		}

		profileScope.addFile = function(element) {
			profileScope.$apply(() => {
				var files = element.files;
				for (var i = 0; i < files.length; i++) {
					profileScope.channelCopy.filelist.filelist.push({
						file: files[i].name,
						size: files[i].size,
						checksum: 0
					});
				}
				var e = $('#' + element.id);
				e.wrap('<form>').closest('form').get(0).reset();
				e.unwrap();
			});
		}

		profileScope.removeFile = function(index) {
			profileScope.channelCopy.filelist.filelist.splice(index,1);
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
			},
			banner: {
				image:''
			},
			thumbnail: {
				image:''
			}
		};
		profileScope.channelCopy = angular.copy(profileScope.channelCopyTemplate);
		profileScope.showSelectedChannel = false;
		profileScope.tab = 0;
		profileScope.showContent = [];
		//------
	}]);