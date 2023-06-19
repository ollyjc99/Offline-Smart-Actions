function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem, Account: [Account]}, record}, data} = payload;
    // @author: Oliver Carter
    // RecordType.name == 'Medical Professionals'
    if (Type != 'Return Order'){
        let productIdToProduct = new Map();
        let minProducts = new Array();
        let maxProducts = new Array();

        Product2.forEach(prod => {
            productIdToProduct.set(prod.Id, prod);
        });
        data.message =`${productIdToProduct.size}`;

        if (productIdToProduct.size){
            OrderItem.forEach(getInvalidQuantities);
        }
        if(minProducts.length || maxProducts.length) {
            data.error = '';
            buildError(minProducts, maxProducts);
            data.blockExecution = true;
        }
        else {
            data.message = `Order validated ✓`;
            data.updateDeviceData = true;
            data.reprice = true;
            data.blockExecution = false;
        }
    }
    if ((Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0) && record.TotalAmount != 0 && Account.aforza__Minimum_Order_Amount__c > record.TotalAmount){
        errorMessage = `Order Total less than Account Minimum Order Amount by -€${Account.aforza__Minimum_Order_Amount__c - record.TotalAmount}`;
        if (data.error == null){
            data.error = errorMessage;
        } else {
            data.error += `\n\n${errorMessage}`;
        }
    }
    function getInvalidQuantities(obj){
        let prod = productIdToProduct.get(obj.Product2Id);
        if ((prod.DRWO_Minimum_Quantity__c != null || prod.DRWO_Minimum_Quantity__c != 0) && prod.DRWO_Minimum_Quantity__c > obj.Quantity){
            minProducts.push({'Id': prod.Id, 'Name': prod.Name, 'Quantity': obj.Quantity});
        }
        if ((prod.DRWO_Maximum_Quantity__c != null || prod.DRWO_Maximum_Quantity__c != 0) && prod.DRWO_Maximum_Quantity__c < obj.Quantity){
            maxProducts.push({'Id': prod.Id, 'Name': prod.Name, 'Quantity': obj.Quantity});
        }
    }
    function listItems(item){
        data.error += `\n✗ ${item.Name}: ${item.Quantity}`;
    }
    function buildError(minProducts, maxProducts){
        if (minProducts.length){
            data.error += 'Products under Minimum Order Quantity:';
            minProducts.forEach(listItems);
        }
        if (maxProducts.length){
            let spacer = '';
            if (data.error.length > 0){
                spacer = '\n\n';
            }
            data.error += `${spacer}Products over Maximum Order Quantity:`;
            maxProducts.forEach(listItems);
        }
    }
    return payload;
}