const fs = require('fs');

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
					title: profileScope.newContentName,
					thumbnail: {}
				});
				profileScope.newContentName = "";
				profileScope.showEditContent.push(true);
			}
		}

		profileScope.removeContent = function(index) {
			profileScope.showEditContent.splice(index,1);
			profileScope.channelCopy.contentlist.contentlist.splice(index,1);
		}

		profileScope.addDir = function(event, index) {
			var pathForFiles = event.target.files[0].path;
			fs.readdir(pathForFiles, (err, files) => {
				if (err) {
					$log.error("profileController: Error reading directory :(");
				} else {
					profileScope.$apply(() => {
						var content = profileScope.channelCopy.contentlist.contentlist[index];
						content.filelist = {
							filelist: []
						};
						for (var i = 0; i < files.length; i++) {
							var stat = fs.statSync(path.join(pathForFiles, files[i]));
							content.filelist.filelist.push({
								file: files[i],
								size: stat.size
							});
							var e = $('#contentFileList' + index);
							e.wrap('<form>').closest('form').get(0).reset();
							e.unwrap();
						}
					});
				}
			});
		}

		profileScope.removeDir = function(index) {
			profileScope.channelCopy.contentlist.contentlist[index].filelist = null;
		}

		profileScope.addChannelThumbnail = function(element) {
			var reader = new FileReader();
			reader.onload = function (e) {
				profileScope.$apply(() => {
					// imgtype: element.files[0].name,
					profileScope.channelCopy.thumbnail.image = e.target.result.split(',')[1];
				});
			}
			reader.readAsDataURL(event.target.files[0]);
		}

		profileScope.addChannelBanner = function(element) {
			var reader = new FileReader();
			reader.onload = function (e) {
				profileScope.$apply(() => {
					// imgtype: element.files[0].name,
					profileScope.channelCopy.banner.image = e.target.result.split(',')[1];
				});
			}
			reader.readAsDataURL(element.files[0]);
		}

		profileScope.addContentThumbnail = function(event, index) {
			var content = profileScope.channelCopy.contentlist.contentlist[index];
			var reader = new FileReader();
			reader.onload = function (e) {
				profileScope.$apply(() => {
					// imgtype: element.files[0].name,
					content.thumbnail.image = e.target.result.split(',')[1];
				});
			}
			reader.readAsDataURL(event.target.files[0]);
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
		profileScope.showEditContent = [];
		profileScope.showPreviewContent = [];
		//------
	}]);