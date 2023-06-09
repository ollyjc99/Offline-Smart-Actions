// @author: Oliver Carter
function runAction(payload) {
    const {data :{record, related: {Account: [Account]}}, data} = payload;

    if (
        (Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0)   // Check the minimum order amount isn't null or 0
        && record.TotalAmount != 0                                                                          // Check that order total isn't fee
        && Account.aforza__Minimum_Order_Amount__c > record.TotalAmount                                     // Check if the minimum order total is greater than order total
        ){
                                                                                                            // If the conditions are met retun the difference rounded to 2DP
        data.error = `Order Total less than Account Minimum Order Amount by €${Math.round((Account.aforza__Minimum_Order_Amount__c - record.TotalAmount) * 100) / 100}`;
    } else {
    data.message = `Order validated ✓`;
    }
    return payload;
}