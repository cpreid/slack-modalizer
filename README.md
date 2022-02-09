# slack-modalizer
Stupid-easy Modal Implementation for Slack

## Installation
`npm install slack-modalizer`

## Attach to Slack App as middleware 
```
// Instantiate your Slack App however you'd like
const { App } = require('@slack/bolt');
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

## Pop up a modal, in any context 
```
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
