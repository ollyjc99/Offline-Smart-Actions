// @author: Oliver Carter
function runAction(payload) {
    const {data :{record, related: {Account: [Account]}}, data} = payload;
    /*
    Check the minimum order amount isn't null or 0 
    Check that order total isn't 0
    Check if the minimum order total is greater than order total
    */
    if (
        record.Type == 'Product Order' &&
        (Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0) &&
        record.TotalAmount != 0 &&                                                                   
        Account.aforza__Minimum_Order_Amount__c > record.TotalAmount                                     
        ){
        // Return the difference rounded to 2DP 
        let diff = Math.round((Account.aforza__Minimum_Order_Amount__c - record.TotalAmount) * 100) / 100;

        data.error = `Die Bestellsumme liegt um weniger als der Mindestbestellwert: ${diff}`;
    } else {
        // Else, Order Validated
        data.message = `Bestellung best\u00E4tigt \u2713`;
    }
    return payload;
}