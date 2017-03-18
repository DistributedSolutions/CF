var commaSeparate = function(arr) {
	var s = "";
	if (arr.length === 0) {
		s += arr;
	} else {
		for(var i = 0; i < arr.length; i++) {
			s += arr[i];
			if(i !== arr[i].length-1) {
				s += ",";
			}
		}	
	}
	return s;
}


var groupBy4 = function(data) {
	var tempArr = [];
	var count = 0;
	//groups by 4
	angular.forEach(data, (e, i) => {
		if(i % 4 == 0 || i == 0) {
			tempArr.push([]);
			count++;
		}
		tempArr[count-1].push(e);
	});
	return tempArr;
}