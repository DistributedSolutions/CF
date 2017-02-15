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