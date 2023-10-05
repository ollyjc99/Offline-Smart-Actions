function runAction(payload) {
    // Extract necessary data from the payload
    const { data: {record, related: {Account: [account], Product2, OrderItem, aforza__Outlet_Asset__c}}, data} = payload;

    // Check for triggering smart action conditions before continuing
    if (record.Type !== "Muster" || account.RecordTypeId !== '0123L000000RQhQQAW' || !new Set(['DE', 'AT']).has(account.AW_Country)) {
        return payload;
    }
    let orderChanged = false;

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));

    const productIdToProduct = new Map();

    // Get a set of ProductIds
    Product2.forEach(obj => {
        if (productIds.has(obj.Id) && obj.AW_Is_Restricted_Drug__c === true){
            productIdToProduct.set(obj.Id, obj); 
        }
    });

    if (!productIdToProduct.size){
        return payload;
    }

    // Build a map of ProductIds to Outlet Assets and Map of Adjusted Items
    const productIdToAsset = new Map();
    const adjustedItems = new Array();

    aforza__Outlet_Asset__c.forEach(asset => {
        if (asset.aforza__Account__c === record.AccountId && productIds.has(asset.aforza__Product__c)){
            productIdToAsset.set(asset.aforza__Product__c, asset); 
        }
    });

    OrderItem.forEach(evaluateYearlyLimit);

    if (orderChanged) {
        data.updateDeviceData = {
            OrderItem: true,
        }
        data.reprice = true;

        payload.data.message = "The quantities of some products have been adjusted to comply with yearly limits.\n\n";

        // List adjusted items
        adjustedItems.forEach(listItems);
        
    }

    function evaluateYearlyLimit(item){

        const product = productIdToProduct.get(item.Product2Id);
        const asset = productIdToAsset.get(item.Product2Id);

        const yearlyLimit = product["AW_Doctor_"+account.AW_Country+"__c"];
        const availableQuantity = yearlyLimit - asset.AW_Yearly_Quantity__c;
        
        // If there is enough available quantity skip this item
        if (availableQuantity >= item.Quantity){
            return;
        }

        const oldQuantity = item.Quantity;

        item.Quantity = availableQuantity <= 0 ? 0 : availableQuantity;

        adjustedItems.push({"Name": product.Name, "Difference": item.Quantity - oldQuantity});

        orderChanged = true;
        return;
    }
    function listItems(item){
        data.message += `\{u2713} ${item.Name} ${item.Difference}`;
    }

    return payload;
}