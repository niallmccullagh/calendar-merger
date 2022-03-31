const ICAL = require("ical.js");
const fetch = require("node-fetch");
const AWS = require('aws-sdk');


const EMPTY_CALENDAR = `BEGIN:VCALENDAR
PRODID:-//CalendarMerger//NONSGML V1.0//EN
METHOD:PUBLISH
VERSION:2.0
NAME: Merged Calendar
X-WR-CALNAME:Merged Calendar
REFRESH-INTERVAL;VALUE=DURATION:P1H
X-PUBLISHED-TTL:PT1H
CALSCALE:GREGORIAN
X-WR-TIMEZONE:Europe/London
X-WR-CALDESC:Multiple calendars put together
END:VCALENDAR
`;

async function getConfig(){
	const docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-west-1" });

	const params = {
		TableName : 'app_config',
		Key: {
			app_name: 'CalendarMerger'
		}
	}
	const data = await docClient.get(params).promise();
	return data.Item;
}


function merge(inputs) {
	if (!Array.isArray(inputs)) inputs = [...arguments];

	let empty_calendar = ICAL.parse(EMPTY_CALENDAR);
	let calendar = new ICAL.Component(empty_calendar);

	for (let input of inputs) {
			let jcal = ICAL.parse(input.iCal);
			let cal = new ICAL.Component(jcal);

			for (let vevent of cal.getAllSubcomponents("vevent")) {
				vevent.updatePropertyWithValue("summary",  input.name + " " + vevent.getFirstPropertyValue("summary"));
				calendar.addSubcomponent(vevent);
			}	
	}

	return calendar.toString();
}

async function fetchCalendars(cals){
    return Promise.all(cals.map(async cal => {
        response = await fetch(cal.url);
        return { name: cal.name, iCal: await response.text()};
    }));
}


handler = async function (event, context) {

	const config = await getConfig();
    const fetchedCalendars = await fetchCalendars(config.calendars);
	const mergedCalendars = merge(fetchedCalendars);
    
	console.log(mergedCalendars);

	return {
		statusCode: 200,
		headers: {
            'Content-Type': 'text/calendar',
        },
		body: mergedCalendars
	  };
}

//handler().then(msg => console.log(msg));

module.exports = { handler }
