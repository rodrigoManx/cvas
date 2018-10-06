function crimesByYear() {
	var dict = {}
	dict.min = 50000;
	dict.max = 0;	
	dict.minB = 50000;
	for (var year in crimes) {
		dict[year] = {};
		for (var month in crimes[year]){
			dict[year][month] = {};
			dict[year][month].crimes_count = 0;
			dict[year][month].crimes = {};
			for (var day in crimes[year][month]){
				for (var hour in crimes[year][month][day]){
					for (var category in crimes[year][month][day][hour]){
						dict[year][month].crimes_count+=crimes[year][month][day][hour][category].length
						if (dict[year][month].crimes[category] === undefined)
							dict[year][month].crimes[category] = [];
						
						for (crime in crimes[year][month][day][hour][category])
							dict[year][month].crimes[category].push(crimes[year][month][day][hour][category][crime]);
					}
				}
			}
			if (dict.max < dict[year][month].crimes_count)
				dict.max = dict[year][month].crimes_count;
			if (dict.min > dict[year][month].crimes_count){
				dict.minB = dict.min;
				dict.min = dict[year][month].crimes_count;
			}
		}
	}
	return dict;
}

function crimesByMonth() {
	var dict = {}
	dict.min = 50000;
	dict.max = 0;
	dict.minB = 50000;
	for (var year in crimes) {
		for (var month in crimes[year]){
			if (dict[month] == undefined) dict[month] = {};
			for (var day in crimes[year][month]){
				if (dict[month][day] == undefined) {
					dict[month][day] = {};
					dict[month][day].crimes_count = 0;
					dict[month][day].crimes = {};
				}
				for (var hour in crimes[year][month][day]){
					for (var category in crimes[year][month][day][hour]){
						dict[month][day].crimes_count += crimes[year][month][day][hour][category].length
						if (dict[month][day].crimes[category] === undefined)
							dict[month][day].crimes[category] = [];
						for (crime in crimes[year][month][day][hour][category])
							dict[month][day].crimes[category].push(crimes[year][month][day][hour][category][crime]);
					}
				}
				if (dict.max < dict[month][day].crimes_count)
					dict.max = dict[month][day].crimes_count;
				if (dict.min > dict[month][day].crimes_count){
					dict.minB = dict.min;
					dict.min = dict[month][day].crimes_count;
				}
			}
		}
	}
	console.log(dict);
	return dict;
}


function crimesByDay() {
	var dict = {}
	dict.min = 50000;
	dict.max = 0;
	dict.minB = 50000;
	for (var year in crimes) {
		for (var month in crimes[year]){
			for (var day in crimes[year][month]){
				if (dict[day] == undefined) dict[day] = {};
				for (var hour in crimes[year][month][day]){
					if (dict[day][hour] == undefined) {
						dict[day][hour] = {};
						dict[day][hour].crimes_count = 0;
						dict[day][hour].crimes = {};
					}
					for (var category in crimes[year][month][day][hour]){
						dict[day][hour].crimes_count += crimes[year][month][day][hour][category].length
						if (dict[day][hour].crimes[category] === undefined)
							dict[day][hour].crimes[category] = [];
						for (crime in crimes[year][month][day][hour][category])
							dict[day][hour].crimes[category].push(crimes[year][month][day][hour][category][crime]);
					}
					if (dict.max < dict[day][hour].crimes_count)
						dict.max = dict[day][hour].crimes_count;
					if (dict.min > dict[day][hour].crimes_count){
						dict.minB = dict.min;
						dict.min = dict[day][hour].crimes_count;
					}
				}
			}
		}
	}
	return dict;
}


//function crimesByMonth(year) {
//	var dict = {}
//	for (var month in crimes[year]){
//		dict[month] = {}
//		for (var day in crimes[year][month]){
//			for (var category in crimes[year][month][day]){
//				dict[month][category] = crimes[year][month][day][category]
//			}
//		}
//	}
//	return dict;
//}

/*function crimesByDay(year, month) {
	var dict = {}
	for (var day in crimes[year][month]){
		dict[day] = {}
		for (var category in crimes[year][month][day]){
			dict[day][category] = crimes[year][month][day][category]
		}
	}
	return dict;
}*/

function crimesByMonth2() {
	var dict = {}
	for (var year in crimes) {
		for (var month in crimes[year]){
			if (dict[month] == undefined)
				dict[month] = {};
			for (var day in crimes[year][month]){
				for (var category in crimes[year][month][day]){
					if (dict[month][category] == undefined)
						dict[month][category] = [];
					for (var index =  0; index < crimes[year][month][day][category].length; ++index){
						dict[month][category].push(crimes[year][month][day][category][index]);
					}
				}
			}
		}
	}
	return dict;
}

function crimesByDay2() {
	var dict = {}
	for (var year in crimes) {
		for (var month in crimes[year]){
			for (var day in crimes[year][month]){
				if (dict[day] == undefined)
					dict[day] = {};
				for (var category in crimes[year][month][day]){
					if (dict[day][category] == undefined)
						dict[day][category] = [];
					dict[day][category].push(crimes[year][month][day][category]);
				}
			}
		}
	}
	return dict;
}