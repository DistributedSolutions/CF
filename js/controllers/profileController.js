const fs = require('fs');

angular.module("CFApp")
.controller("profileController",["$scope", "$routeParams", "$http", "jsonRPCService", "$log", "localDBService",
	function($scope, $routeParams, $http, jsonRPCService, $log, localDBService){
		var profileScope = $scope;

		profileScope.loadProfile = function(username) {
			localDBService.loadProfile(username, (profile) => {
				profileScope.profile = JSON.parse(profile.data);
				profileScope.$apply(() => {profileScope.profile});
				$log.log("profilesController: Finished loading row: " + profile);
			});
		}

		profileScope.applyChannel = function() {
			$log.log("Creating new channel.");
		}

		profileScope.selectChannel = function(index) {
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
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD) => {
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

		profileScope.getPaths = function() {
			var contentPaths = [];
			for(var i = 0; i < profileScope.channelCopy.contentlist.contentlist.length; i++) {
				contentPaths.push($('#contentFileList' + i).val())
			}
			return contentPaths;
		}

		///////////////////////
		// EXISTING CHANNELS //
		///////////////////////
		profileScope.addExistingChannel = function() {
			profileScope.modalExistingVerifiedChannel = true;
			profileScope.modalExistingAddChannel = false;
		}

		profileScope.verifyExistingChannel = function() {
			profileScope.modalExistingVerifiedChannel = false;
			profileScope.modalExistingAddChannel = true;
			profileScope.modalExistingVerifiedChannelSuccessfully = true;
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}

		profileScope.addVerifiedExistingChannel = function() {
			if (profileScope.modalExistingVerifiedChannelSuccessfully) {
				$('#existingChannelModal').modal('hide');
				// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
			}
		}
		
		///////////////////////
		///// NEW CHANNELS ////
		///////////////////////
		profileScope.addNewChannel = function() {
			//if it closed halfway
			profileScope.modalNewVerifiedChannel = false;

			profileScope.modalNewVerifiedChannelResult = null;

			profileScope.modalNewChannelSuccess = false;

			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.verifyChannel, {
				channel: profileScope.channelCopy,
				path: profileScope.getPaths(),
			});
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			$http(rpc)
			.then((res) => {
					if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in verifying new channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalNewVerifiedChannelResult = res.data.error.data;
					} else { 
						//success
						profileScope.channelCopy = res.data.result;
						$log.info("profileController: Success in verifying new channel [" + 
							profileScope.channelCopy.rootchain + "]");
						profileScope.modalNewVerifiedChannel = true;
						profileScope.profile.channels.push({
							name: profileScope.channelCopy.title,
							channelHash: profileScope.channelCopy.contentchain,
							state: profileScope.states.LOCAL_CHAIN
						});
						profileScope.selectChannelIndex = profileScope.profile.channels.length - 1;
						localDBService.saveProfile({
							username: profileScope.username,
							data: profileScope.profile
						});
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in new channel call [" + JSON.stringify(res.data.err) + "]");
				});
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}

		profileScope.addVerifiedNewChannel = function() {
			var rpc = jsonRPCService.getJsonRpc(jsonRPCService.verifyChannel, {
				channel: profileScope.channelCopy,
				path: profileScope.getPaths(),
			});
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			profileScope.modalNewVerifiedChannelResult = null;
			$http(rpc)
			.then((res) => {
					if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in submiting new channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalNewVerifiedChannelResult = res.data.error;
					} else { 
						//success
						$log.info("profileController: Success in submiting new channel");
						profileScope.modalNewChannelSuccess = true;
						profileScope.showCreateChannel = false;
						profileScope.profile.channels[profileScope.selectChannelIndex].state = profileScope.states.REMOTE_CHAIN;
						localDBService.saveProfile({
							username: profileScope.username,
							data: profileScope.profile
						});
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in submiting channel [" + JSON.stringify(res.data.err) + "]");
				});
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}
		
		///////////////////////
		///// EDIT CHANNELS ///
		///////////////////////
		profileScope.addEditChannel = function() {
			profileScope.modalNewEditVerifiedChannel = true;
			profileScope.modalNewEditAddChannel = false;
		}

		profileScope.verifyEditChannel = function() {
			profileScope.modalNewEditVerifiedChannel = false;
			profileScope.modalNewEditAddChannel = true;
			profileScope.modalNewEditVerifiedChannelSuccessfully = true;
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}

		profileScope.addVerifiedEditChannel = function() {
			if (profileScope.modalNewEditVerifiedChannelSuccessfully) {
				$('#newEditChannelModal').modal('hide');
				// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
			}
		}

		// START
		profileScope.username = $routeParams.username;
		profileScope.loadProfile(profileScope.username);
		profileScope.states = {
			LOCAL_CHAIN: 0,
			REMOTE_CHAIN: 1
		}
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
			},
			contentkey: ''
		};
		profileScope.channelCopy = angular.copy(profileScope.channelCopyTemplate);
		profileScope.showSelectedChannel = false;
		profileScope.tab = 0;
		profileScope.showEditContent = [];
		profileScope.showPreviewContent = [];
		//------
	}]);