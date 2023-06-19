// @author: Oliver Carter
function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem, Account: [Account]}, record}, data} = payload;
    let productIds = new Set();
    let productIdToProduct = new Map();
    let minProducts = new Array();
    let maxProducts = new Array();
    if (Type != 'Return Order' &&
        // RecordType Developer Names cannot be accessed via payload so have hard-coded Ids for each environment
        // Checks for if the RecordType Id is equal to Medical Professionals or Pharmacies
        (
            Account.RecordTypeId === 'TBD' ||  // Production
            Account.RecordTypeId === 'TBD' ||   // SIT
            Account.RecordTypeId === 'TBD' ||   // UAT
            (Account.RecordTypeId === '0122z000002QGJtAAO' || Account.RecordTypeId === '0122z000002QGJyAAO')      // QA
        ))
        {
            OrderItem.forEach(obj => {
                productIds.add(obj.Product2Id);             // Get Product2Id for each OrderItem
            });
            Product2.forEach(prod => {
                if (productIds.has(prod.Id)){
                    productIdToProduct.set(prod.Id, prod);  // Build the Map of Product.Id to Product
                }
            });
            if (productIdToProduct.size){
                OrderItem.forEach(getInvalidQuantities);    // Loop through OrderItems after constructing Map
            }
            if(minProducts.length || maxProducts.length) {
                data.error = '';
                buildError(minProducts, maxProducts);       // If there are invalid quantities, run start creating the error message
                data.blockExecution = true;
            } else {
            data.message = `Order validated ✓`;
            data.updateDeviceData = true;                    // If no error, return 
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
    } else {
        data.message = `Order validated ✓`;
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