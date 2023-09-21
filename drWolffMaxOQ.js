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
    const productIdToAsset = new Map();

    // Get a set of ProductIds
    Product2.forEach(obj => {
        if (productIds.has(obj.Id)){
            productIdToProduct.set(obj.Id, obj); 
        }
    });
    // Build a map of ProductIds to Outlet Assets
    aforza__Outlet_Asset__c.forEach(asset => {
        if (asset.aforza__Account__c === record.AccountId && productIds.has(asset.aforza__Product__c)){
            productIdToAsset.set(asset.aforza__Product__c, asset); 
        }
    });

    OrderItem.forEach(evaluateYearlyLimit);

    if (orderChanged) {
        data.updateDeviceData = {
            OrderItem: true,
            aforza__Outlet_Asset__c: true
        }
        data.reprice = true;

        payload.data.message = "The quantities of some products have been adjusted to comply with yearly limits.";
    }
    
    function evaluateYearlyLimit(item){
        const product = productIdToProduct.get(item.Product2Id);
        
        // Get the yearly limit of the related Product using on the Account country field
        const yearlyLimit = product["AW_Doctor_"+ account.AW_Country];

        //
        const asset = productIdToAsset.get(item.Product2Id);

        // Calculate the total quantity of the SKU ordered this year
        let totalQuantityThisYear = asset.AW_Yearly_Quantity;

        let quantityInOrder = item.Quantity;
        if (totalQuantityThisYear + quantityInOrder > yearlyLimit) {
            // Calculate the adjusted quantity
            let adjustedQuantity = yearlyLimit - totalQuantityThisYear;
            if (adjustedQuantity < 0) {
                adjustedQuantity = 0;
            }
            // Adjust the quantity in the order and set the flag indicating we modified the order
            item.Quantity = adjustedQuantity;
            totalQuantityThisYear += adjustedQuantity;

            orderChanged = true;
        } else {
            totalQuantityThisYear += quantityInOrder;
        }
    }
    return payload;
}