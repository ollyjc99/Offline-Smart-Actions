function runAction(payload) {
    const { data: { record : {AccountId, aforza__Inventory__c: InventoryId}, order, related: {Account: [Account], OrderItem: orderItems, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}}, data } = payload; // Deconstruct payload
    data.message = '';
    data.message += `${Account.Name}\nId: ${AccountId}\n`;
    // data.message += JSON.stringify(Account);
    data.message += `${Inventory.Name}\n`;
    data.message += `${Account.Delivery_Day__c}\n`;
    data.message += `${Account.Point_of_Delivery_Name__c}\n`;
    data.message += `${payload.data.related.Account[0].Customer_Segment__c}\n`;
    return payload;
}