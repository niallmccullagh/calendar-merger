const { Stack, Duration } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const cdk = require("aws-cdk-lib");

class CalendarMergeStack extends Stack {

  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const handler = new lambda.Function(this, "MergeCalendarHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      handler: "index.handler",
    });

    const api = new apigateway.RestApi(this, "merge-calendar-api", {
      restApiName: "Merge Calendar Service",
      description: "This service merges iCal calendars."
    });

    const getIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "text/calendar": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getIntegration); // GET /

    const table = new dynamodb.Table(this, 'app_config', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {name: "app_name", type: dynamodb.AttributeType.STRING},
      tableName: "app_config"
    });

    table.grantReadData(handler);

  }
}

module.exports = { CalendarMergeStack }
