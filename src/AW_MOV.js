// @author: Oliver Carter
function runAction(payload) {
    const {data :{record, related: {Account: [Account]}}, data} = payload;

    if (/*
        Check the minimum order amount isn't null or 0 
        Check that order total isn't 0
        Check if the minimum order total is greater than order total
        */
        record.Type == 'Product Order' &&
        (Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0) 
        && record.TotalAmount != 0                                                                          
        && Account.aforza__Minimum_Order_Amount__c > record.TotalAmount                                     
        ){
        data.error = `Die Bestellsumme liegt um weniger als der Mindestbestellwert: ${Math.round((Account.aforza__Minimum_Order_Amount__c - record.TotalAmount) * 100) / 100}`;  // Return the difference rounded to 2DP
    } else {
    data.message = `Bestellung best\{u00E4}tigt \{u2713}`; // Else, Order Validated
    }
    return payload;
}