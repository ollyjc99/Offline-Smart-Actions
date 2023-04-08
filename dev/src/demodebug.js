function runAction(payload) {
    const { data: { record : {AccountId, aforza__Inventory__c: InventoryId}, order, related: {Account: [Account], OrderItem: orderItems, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}}, data } = payload; // Deconstruct payload
    data.message = `${Account.Name}\nId: ${AccountId}\n`;
    data.message += `${Inventory.Name}\n`;
    data.message += `${Account.Customer_Segment__c}`;
    data.message += `\n${Account.Delivery_Day__c}`;
    return payload;
}