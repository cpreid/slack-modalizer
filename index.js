class Modalizer {
  lastModalId;

  constructor({body, client, context, ack}) {
    this.request = {body, client, context};

    // enrich context with this nifty method to ensure a one-time ack
    context.ackOnce = async function() {
      if(context.acked) return;
      await ack.apply(null, arguments); 
      context.acked = true;
    }

    return this;
  }

  /**
   * Provides context to showFromContext
   * To pop up modal in any circumstance
   * @param {Object} renderedView
   * @returns {String} modalId 
   */
  async show({renderedView}) {
    const modalId = await Modalizer.showFromContext({
      ...(this.lastModalId ? {interstitialViewId: this.lastModalId} : {body: this.request.body}),
      client: this.request.client,
      context: this.request.context,
      renderedView,
    });
    this.lastModalId = modalId;
    return modalId;
  }

  /**
   * Opens a modal from various contexts
   * To pop up modal in any circumstance
   * @param {Object} body
   * @param {Object} client
   * @param {Object} renderedView
   * @param {Object} context
   * @param {String} interstitialViewId
   * @returns {String} modalId 
   */
  static async showFromContext({ body = {}, client, renderedView = {}, context, interstitialViewId }) {  
    // This was a view submission event, there is already a modal up
    if(body.type && body.type === 'view_submission') {
      await context.ackOnce({
        "response_action": "update",
        "view": renderedView
      });
      return body.view.id;
    }
    // This could be an action from anywhere
    // a flat surface, or from within a modal
    else {
      await context.ackOnce();
      // determine what id
      let existingViewId;
      if(interstitialViewId) existingViewId = interstitialViewId;
      else existingViewId = body.view && body.view.type === 'modal' ? body.view.id : false;
  
      const modalMethod = existingViewId ? 'update' : 'open',
            trigger_id = body.trigger_id,
            modalArg = existingViewId ? { view_id: existingViewId } : { trigger_id: trigger_id };
      try {
        const slackView = await client.views[modalMethod]({
          ...modalArg,
          view: renderedView,
        });
        return slackView.view.id;
      } catch (err) {
        return null;
      }    
    }
  }

}

module.exports = {Modalizer};