angular.module("CFApp")
.controller("profileController",["$scope", "$routeParams", "$http", "jsonRpcService", "$log", "localDBService", "$location", "interfaceDBService",
	function($scope, $routeParams, $http, jsonRpcService, $log, localDBService, $location, interfaceDBService){
		var profileScope = $scope;
		profileScope.interfaceDBService = interfaceDBService;

		profileScope.loadProfile = function(username) {
			profileScope.profile = localDBService.loadProfile(username);
		}

		profileScope.applyChannel = function() {
			$log.log("Applying channel form");
		}

		profileScope.selectChannel = function(hash) {
			jsonRpcService.getChannel(hash, (result) => {
				profileScope.channelCopy = result;
			});
			profileScope.showSelectedChannel = true;
		}

		profileScope.editChannelContents = function(hash) {
			$location.path($location.path() + "/" + hash);
		}

		profileScope.removeChannel = function(index) {
			if(profileScope.channelCopy.rootchain == profileScope.profile.channels[index].rootchain) {
				profileScope.showSelectedChannel = false;
			}
			if (profileScope.profile.channels.length >= index) {
				profileScope.profile.channels.splice(index, 1);
			} else {
				$log.error("profileController: attempting to remove channel outside of range");
			}
			localDBService.saveProfile(profileScope.profile);
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

		profileScope.addSuggestedChannel = function() {
			if (profileScope.newSuggestedChannelHash != null && profileScope.newSuggestedChannelHash.trim().length > 0) {
				profileScope.channelCopy.suggestedchannels.hashlist.push(
					profileScope.newSuggestedChannelHash
					);
				profileScope.newSuggestedChannelHash = "";
			}
		}

		profileScope.addTag = function(tagName) {
			profileScope.channelCopy.tags.tags.push(tagName);
		}

		profileScope.removeTag = function(index) {
			profileScope.channelCopy.tags.tags.splice(index,1);
		}

		profileScope.filterDupesTags = function(obj) {
			return profileScope.channelCopy.tags.tags.indexOf(obj.name) === -1;
		}

		profileScope.cancelChannel = function() {
			profileScope.showSelectedChannel = false;
			profileScope.showCreateChannel = false;
			profileScope.channelCopy = angular.copy(profileScope.channelCopyTemplate);
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
		profileScope.verifyNewChannel = function() {
			//if it closed halfway
			profileScope.modalNewVerifiedChannel = false;
			profileScope.modalNewChannelSuccess = false;
			profileScope.modalNewVerifiedChannelResult = null;

			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.verifyChannelVal, profileScope.channelCopy);
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in verifying new channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalNewVerifiedChannelResult = res.data.error;
					} else { 
						//success
						profileScope.modalChannelCost = res.data.result;
						$log.info("profileController: Success in verifying new channel [" + 
							profileScope.channelCopy.rootchain + "]");
						profileScope.modalNewVerifiedChannel = true;
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in new channel call [" + JSON.stringify(res.data.err) + "]");
				});
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}

		profileScope.addVerifiedNewChannel = function() {
			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.createChannelVal, profileScope.channelCopy);
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			profileScope.modalNewVerifiedChannelResult = null;
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in submitting new channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalNewVerifiedChannelResult = res.data.error;
					} else { 
						//success
						$log.info("profileController: Success in creating new channel");
						profileScope.channelCopy = res.data.result;
						profileScope.modalNewChannelSuccess = true;
						profileScope.showCreateChannel = false;
						profileScope.showSelectedChannel = false;
						profileScope.profile.channels.push({
							hash: profileScope.channelCopy.rootchain,
							title: profileScope.channelCopy.title
						});
						localDBService.saveProfile(profileScope.profile);
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in submitting channel [" + JSON.stringify(res.data.err) + "]");
				});
			// !!! MUST DISABLE CLOSE BUTTON WHILE ATTEMPTING TO ADD
		}
		
		///////////////////////
		///// EDIT CHANNELS ///
		///////////////////////
		profileScope.verifyEditChannel = function() {
			profileScope.modalEditVerifiedChannel = false;
			profileScope.modalEditChannelSuccess = false;
			profileScope.modalEditVerifiedChannelResult = null;

			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.verifyChannelVal, profileScope.channelCopy);
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in verifying edit channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalEditVerifiedChannelResult = res.data.error;
					} else { 
						//success
						profileScope.modalChannelCost = res.data.result;
						$log.info("profileController: Success in verifying edit channel [" + 
							profileScope.channelCopy.rootchain + "]");
						profileScope.modalEditVerifiedChannel = true;
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in edit channel call [" + JSON.stringify(res.data.err) + "]");
				});
		}

		profileScope.addVerifiedEditChannel = function() {
			var rpc = jsonRpcService.getJsonRpc(jsonRpcService.updateChannelVal, profileScope.channelCopy);
			$log.info("profileController: Sending request [" + JSON.stringify(rpc) + "]");
			profileScope.modalEditVerifiedChannelResult = null;
			$http(rpc)
			.then((res) => {
				if (res.data.error) {
						//error in rpc
						$log.error("profileController: Error in update channel: error: [" + 
							JSON.stringify(res.data.error) + "]");
						profileScope.modalEditVerifiedChannelResult = res.data.error;
					} else { 
						//success
						$log.info("profileController: Success in updating update channel");
						profileScope.channelCopy = res.data.result;
						profileScope.modalEditChannelSuccess = true;
						profileScope.showCreateChannel = false;
						profileScope.showSelectedChannel = false;
						profileScope.modalEditVerifiedChannel = false;
					}
				}, (res) => {
					//error on call SHOULD NEVER HAPPEN
					$log.error("profileController: Error in updating channel [" + JSON.stringify(res.data.err) + "]");
				});
		}

		//------init---------
		profileScope.username = $routeParams.username;
		profileScope.loadProfile(profileScope.username);
		profileScope.channelCopyTemplate = {
			title: "",
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
			contentkey: '',
			tags: {
				tags: []
			}
		};
		profileScope.channelCopy = angular.copy(profileScope.channelCopyTemplate);
		profileScope.showSelectedChannel = false;
		profileScope.showCreateChannel = false;
		profileScope.tab = 0;
		profileScope.showEditContent = [];
		profileScope.showPreviewContent = [];
		profileScope.$watch(() => {
			$('.selectpicker').selectpicker('refresh');
		});
		//-------------------
	}]);