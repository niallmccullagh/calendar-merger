# Calendar Merge

Just a little play with CDK and lambdas. Don't take any of the code in here too seriously!

* Merges multiple calendars into one.
* List of calendars stored in a dynamodb table.
* The name of the calendar is prefixed onto any events in that calendar.



```
{
  "app_name": {
    "S": "CalendarMerger"
  },
  "calendars": {
    "L": [
      {
        "M": {
          "name": {
            "S": "My 1st Calendar"
          },
          "url": {
            "S": "https://mycalendar.com/mycalendar"
          }
        }
      },
      ...
    ]
  }
}
```

## Useful commands

* `npm run test`         perform the jest unit tests
* `cdk deploy`           deploy this stack to your default AWS account/region
* `cdk diff`             compare deployed stack with current state
* `cdk synth`            emits the synthesized CloudFormation template
