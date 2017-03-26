angular.module("CFApp")
.directive('channelCarouselCell', function () {
	return {
		templateUrl: "../html/directives/channelCarouselCell.html",
		scope: {
			channel: '=',
		}
	};
});
angular.module("CFApp")
.directive('channelCarousel', function () {
	return {
		templateUrl: "../html/directives/channelCarousel.html",
		scope: {
			channelTags: '=',
		}
	};
});
angular.module("CFApp")
.directive('contentCarouselCell', function () {
	return {
		templateUrl: "../html/directives/contentCarouselCell.html",
		scope: {
			content: '=',
		}
	};
});
angular.module("CFApp")
.directive('contentCarousel', function () {
	return {
		templateUrl: "../html/directives/contentCarousel.html",
		scope: {
			contentTags: '=',
		}
	};
});
angular.module("CFApp")
.directive('contentPreview', function () {
	return {
		templateUrl: "../html/mixed/content.html",
		scope: {
			content: '=',
		}
	};
});
angular.module("CFApp")
.directive('channelPreview', function () {
	return {
		templateUrl: "../html/mixed/channel.html",
		scope: {
			channel: '=',
		}
	};
});
angular.module("CFApp")
.directive('customOnChange', function() {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var onChangeFunc = scope.$eval(attrs.customOnChange);
			element.bind('change', (e) => {
				onChangeFunc(e,attrs.index)
			});
		}
	};
});