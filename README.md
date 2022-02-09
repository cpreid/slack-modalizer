# slack-modalizer
Stupid-easy Modal Implementation for Slack

## Installation
`npm install slack-modalizer`

## Attach to Slack App as middleware 
```javascript
// Instantiate your Slack App however you'd like
const { App } = require('@slack/bolt');
const { Modalizer } = require('slack-modalizer');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Attach to Slack App as middleware 
app.use(async ({ ack, body, context, client, next }) => {
  context.modalizer = new Modalizer({body, client, context});
  context.ackOnce = async function() {
    if(context.acked) return;
    await ack.apply(null, arguments); 
    context.acked = true;
  }
  await next();
});
```

## Pop up a modal, in any context within your controllers
[modalView payload](https://app.slack.com/block-kit-builder/TUGQTUCUT#%7B%22title%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Modalizer%22,%22emoji%22:true%7D,%22submit%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Submit%22,%22emoji%22:true%7D,%22type%22:%22modal%22,%22callback_id%22:%22slack_modalizer_rules%22,%22close%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Cancel%22,%22emoji%22:true%7D,%22blocks%22:%5B%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Woohoo!%20#MakeModalsEasyAgain%20%F0%9F%8E%89%20%F0%9F%A5%B3%22%7D%7D%5D%7D)
```javascript
app.action('main_screen', async ({ context }) => {
  // can be invoked from an action in an existing modal
  // or from a message action 
  await context.modalizer.show({
    renderedView: modalView
  });
  
  /**
  *  Wait a few seconds (define your own sleep fnc)
  *  await sleep(3);
  */
  
  // render an updated modal later on
  await context.modalizer.show({
    renderedView: modalView2
  });
});

// in a view_submission
app.view('store_config', async ({ context }) => {
  await context.modalizer.show({
    renderedView: modalView
  });
});
```
