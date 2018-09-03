import csv
import json

crimes = {}

monthName = {'01': 'january',
			 '02': 'february',
			 '03': 'march',
			 '04': 'april',
			 '05': 'may',
			 '06': 'june',
			 '07': 'july',
			 '08': 'august',
			 '09': 'september',
			 '10': 'october',
			 '11': 'november',
			 '12': 'december',}


def process_crimes(count):
	with open('sf_crimes.json', 'w') as outfile:
		with open('sf_crimes.tsv', 'r') as infile:
			spamreader = csv.reader(infile, delimiter='\t')
			next(spamreader, None)
			for row in spamreader:
				crime = {}
				#crime['category'] = row[1]
				#crime['description'] = row[2]
				#crime['dayOfWeek'] = row[3]
				crime['time'] = row[5]
				crime['latitude'] = row[10]
				crime['longitude'] = row[9]


				date = row[4].split('/')
				crimeYear = date[2]
				crimeMonth = monthName[date[0]]
				crimeDay = date[1]
				crimeCategory = row[1]

				if int(crimeYear) >= 2010: 
					try:
						year = crimes[crimeYear]
						try:
							month = year[crimeMonth]
							try:
								day = month[crimeDay]
								try:
									category = day[crimeCategory]
									category.append(crime)
								except KeyError:
									day[crimeCategory] = [crime]
							except KeyError:
								categoryDict = {crimeCategory: [crime]}
								month[crimeDay] = categoryDict	
						except KeyError:
							categoryDict = {crimeCategory: [crime]}
							dayDict = {crimeDay: categoryDict}
							year[crimeMonth] = dayDict
					except KeyError:
						categoryDict = {crimeCategory: [crime]}
						dayDict = {crimeDay: categoryDict}
						monthDict = {crimeMonth: dayDict}
						crimes[crimeYear] = monthDict

		json.dump(crimes, outfile)

process_crimes(3)
