// @author: Oliver Carter
function runAction(payload) {
    const {data :{record, related: {Account: [Account]}}, data} = payload;

    if (
        (Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0) 
        && record.TotalAmount != 0 
        && Account.aforza__Minimum_Order_Amount__c > record.TotalAmount
        ){
        data.error = `Order Total less than Account Minimum Order Amount by €${Math.round((Account.aforza__Minimum_Order_Amount__c - record.TotalAmount) * 100) / 100}`;
    } else {
        data.message = `Order validated ✓`;
    }
    return payload;
}