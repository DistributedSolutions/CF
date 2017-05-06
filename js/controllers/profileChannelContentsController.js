const fs = require('fs');

angular.module("CFApp")
.controller("profileChannelContentsController",["$scope", "$routeParams", "$http", "jsonRpcService", "$log",
	function($scope, $routeParams, $http, jsonRpcService, $log){
		var profileCCScope = $scope;

		profileCCScope.addContent = function() {
			if (profileCCScope.newContentName != null && profileCCScope.newContentName.trim().length > 0) {
				profileCCScope.channelCopy.contentlist.contentlist.push({
					title: profileCCScope.newContentName,
					thumbnail: {}
				});
				profileCCScope.newContentName = "";
				profileCCScope.showEditContent.push(true);
			}
		}

		profileCCScope.removeContent = function(index) {
			profileCCScope.showEditContent.splice(index,1);
			profileCCScope.channelCopy.contentlist.contentlist.splice(index,1);
		}

		profileCCScope.addDir = function(event, index) {
			var pathForFiles = event.target.files[0].path;
			fs.readdir(pathForFiles, (err, files) => {
				if (err) {
					$log.error("profileController: Error reading directory :(");
				} else {
					profileCCScope.$apply(() => {
						var content = profileCCScope.channelCopy.contentlist.contentlist[index];
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

		profileCCScope.getPaths = function() {
			var contentPaths = [];
			for(var i = 0; i < profileCCScope.channelCopy.contentlist.contentlist.length; i++) {
				contentPaths.push($('#contentFileList' + i).val())
			}
			return contentPaths;
		}

		profileCCScope.removeDir = function(index) {
			profileCCScope.channelCopy.contentlist.contentlist[index].filelist = null;
		}

		profileCCScope.addContentThumbnail = function(event, index) {
			var content = profileCCScope.channelCopy.contentlist.contentlist[index];
			var reader = new FileReader();
			reader.onload = function (e) {
				profileCCScope.$apply(() => {
					// imgtype: element.files[0].name,
					content.thumbnail.image = e.target.result.split(',')[1];
				});
			}
			reader.readAsDataURL(event.target.files[0]);
		}

		// INIT START
		profileCCScope.channelCopy = null;
		jsonRpcService.getChannel($routeParams.channelHash, (result) => {
			profileCCScope.channelCopy = result;
		});
		//------
	}]);