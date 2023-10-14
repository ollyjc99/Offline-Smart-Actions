// @author: Oliver Carter
function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem, Account: [Account]}}, data} = payload;
    let productIds = new Set();
    let productIdToProduct = new Map();
    let minProducts = new Array();
    let maxProducts = new Array();
    // RecordType Developer Names cannot be accessed via payload so have hard-coded Ids for each environment
    // Checks for if the RecordType Id is equal to Medical Professionals or Pharmacies
    if (Type != 'Product Order' && (Account.RecordTypeId !== '0123L000000RQhRQAW' && Account.RecordTypeId !== '0123L000000RQhQQAW')){
        return;
    }

    OrderItem.forEach(obj => {
        productIds.add(obj.Product2Id);             // Get Product2Id for each OrderItem
    });

    Product2.forEach(prod => {
        if (productIds.has(prod.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)){
            productIdToProduct.set(prod.Id, prod);  // Build the Map of Product.Id to Product
        }
    });

    if (!productIdToProduct.size){
        return;
    }

    OrderItem.forEach(getInvalidQuantities);    // Loop through OrderItems after constructing Map

    if (minProducts.length || maxProducts.length) {
        data.error = '';
        buildError(minProducts, maxProducts);       // If there are invalid quantities, run start creating the error message
        data.blockExecution = true;
    } else {
        data.message = `Bestellung best\{u00E4}tigt \{u2713}`;
        data.updateDeviceData = true;                    // If no error, return 
        data.reprice = true;
        data.blockExecution = false;
    }
    
    // Function to populate the lists of products that exceed the minimum and maximimum order quantities. 
    function getInvalidQuantities(item){

        let prod = productIdToProduct.get(item.Product2Id);
        let obj = {'Id': prod.Id, 'Name': prod.Name, 'Difference': null};

        if ((prod.DRWO_Minimum_Quantity__c != null && prod.DRWO_Minimum_Quantity__c != 0) && prod.DRWO_Minimum_Quantity__c > item.Quantity){
            obj.Difference = item.Quantity - prod.DRWO_Minimum_Quantity__c;
            minProducts.push(obj);
        }
        if ((prod.DRWO_Maximum_Quantity__c != null && prod.DRWO_Maximum_Quantity__c != 0) && prod.DRWO_Maximum_Quantity__c < item.Quantity){
            obj.Difference = `+${item.Quantity - prod.DRWO_Maximum_Quantity__c}`;
            maxProducts.push(obj);
        }
    }

    function listItems(item){
        data.error += `\u2717 ${item.Name} ${item.Difference}`;
    }
    function buildError(minProducts, maxProducts){
        if (minProducts.length){
            data.error += 'Die folgenden Produkte liegen unter der Mindestmenge:';
            minProducts.forEach(listItems);
        }
        if (maxProducts.length){
            let spacer = '';
            if (data.error.length > 0){
                spacer = '\n\n';
            }
            data.error += `${spacer}Die folgenden Produkte \{u00FC}berschreiten die H\{u00F6}chstmenge:`;
            maxProducts.forEach(listItems);
        }
    }
    return payload;
}