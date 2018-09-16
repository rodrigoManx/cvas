function crimesByYear() {
	var dict = {}
	for (var year in crimes) {
		dict[year] = {}
		for (var month in crimes[year]){
			for (var day in crimes[year][month]){
				for (var category in crimes[year][month][day]){
					dict[year][category] = crimes[year][month][day][category]
				}
			}
		}
	}
	return dict;
}

function crimesByMonth(year) {
	var dict = {}
	for (var month in crimes[year]){
		dict[month] = {}
		for (var day in crimes[year][month]){
			for (var category in crimes[year][month][day]){
				dict[month][category] = crimes[year][month][day][category]
			}
		}
	}
	return dict;
}

function crimesByDay(year, month) {
	var dict = {}
	for (var day in crimes[year][month]){
		dict[day] = {}
		for (var category in crimes[year][month][day]){
			dict[day][category] = crimes[year][month][day][category]
		}
	}
	return dict;
}

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