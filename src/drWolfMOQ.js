// @author: Oliver Carter
function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem, Account: [Account]}, record}, data} = payload;
    let productIds = new Set();
    let productIdToProduct = new Map();
    let minProducts = new Array();
    let maxProducts = new Array();
    if (Type != 'Return Order' &&
        // RecordType Developer Names cannot be accessed via payload so have to hardcode Ids for each environment
        (
            Account.RecordTypeId === '0122z000002QGJtAAO' ||  // Production
            Account.RecordTypeId === '0122z000002QGJtAAO' ||   // SIT
            Account.RecordTypeId === '0122z000002QGJtAAO' ||   // UAT
            Account.RecordTypeId === '0122z000002QGJtAAO'      // QA
        ))
        {
            OrderItem.forEach(obj => {
                productIds.add(obj.Product2Id);
            });
            Product2.forEach(prod => {
                if (productIds.has(prod.Id)){
                    productIdToProduct.set(prod.Id, prod);
                }
            });
            if (productIdToProduct.size){
                OrderItem.forEach(getInvalidQuantities);
            }
            if(minProducts.length || maxProducts.length) {
                data.error = '';
                buildError(minProducts, maxProducts);
                data.blockExecution = true;
            } else {
            data.message = `Order validated ✓`;
            data.updateDeviceData = true;
            data.reprice = true;
            data.blockExecution = false;
        }
    }
    if ((Account.aforza__Minimum_Order_Amount__c != null || Account.aforza__Minimum_Order_Amount__c != 0) && record.TotalAmount != 0 && Account.aforza__Minimum_Order_Amount__c > record.TotalAmount){
        errorMessage = `Order Total less than Account Minimum Order Amount by €${Math.round((Account.aforza__Minimum_Order_Amount__c - record.TotalAmount) * 100) / 100}`;
        if (data.error == null){
            data.error = errorMessage;
        } else {
            data.error += `\n\n${errorMessage}`;
        }
    }
    function getInvalidQuantities(item){
        if (!new Set(['Tax', 'Promotion', 'Discount']).has(item.aforza__Type__c)){
            let prod = productIdToProduct.get(item.Product2Id);
            let obj = {'Id': prod.Id, 'Name': prod.Name, 'Difference': null, 'Quantity': item.Quantity};
            if ((prod.DRWO_Minimum_Quantity__c != null || prod.DRWO_Minimum_Quantity__c != 0) && prod.DRWO_Minimum_Quantity__c > item.Quantity){
                obj.Difference = item.Quantity - prod.DRWO_Minimum_Quantity__c;
                minProducts.push(obj);
            }
            if ((prod.DRWO_Maximum_Quantity__c != null || prod.DRWO_Maximum_Quantity__c != 0) && prod.DRWO_Maximum_Quantity__c < item.Quantity){
                obj.Difference = item.Quantity - prod.DRWO_Maximum_Quantity__c;
                maxProducts.push(obj);
            }
        }
    }
    function listItems(item){
        data.error += `\n✗ ${item.Name} ${item.Difference}`;
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