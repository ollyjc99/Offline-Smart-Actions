function runAction(payload) {
    const { related : {OrderItem, Product2} } = payload.data;
    payload.data.message = '';
    OrderItem.forEach(doSomething);
    const ordIds = OrderItem.map(obj => obj.Product2Id);
    function doSomething(obj){
        payload.data.message += `Pro: ${obj.Product2Id}\n`;
        payload.data.message += `Type: ${obj.aforza__Type__c}\n`;
        payload.data.message += `Qty: ${obj.Quantity}\n`;
        payload.data.message += `$: ${obj.UnitPrice * obj.Quantity}\n\n`;
    }

    return payload;
  }