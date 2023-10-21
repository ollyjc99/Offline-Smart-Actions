function runAction(payload) {

    const { data: {record, related: {Account: [account], Product2, OrderItem, aforza__Outlet_Asset__c}}, data} = payload;

    const pharmacyTypeId = '0122z000002QGJyAAO';
    const medProfTypeId = '0123L000000RQhQQAW';
    const salespersonTypeId = '0122z000002dp2PAAQ';

    if (!new Set(['Product Order', 'Sample Order']).has(record.Type) && !new Set([pharmacyTypeId, medProfTypeId, salespersonTypeId]).has(account.RecordTypeId) && !new Set(['DE', 'AT', 'CH']).has(account.AW_Country__c)) {
        return payload;
    }

    let orderChanged = false;
    const adjustedProducts = [];

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));
    const productMap = new Map();

    Product2.forEach(obj => {
        if (productIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)){
            productMap.set(obj.Id, obj); 
        }
    });

    const orderItemsToProcess = OrderItem.filter((obj) => productMap.has(obj.Product2Id));

    data.message = '';

    const categorizedOrderItems = categorizeOrderItems(orderItemsToProcess);

    if (categorizedOrderItems.get('Product').length){
        validateAgainstProductLimits(categorizedOrderItems.get('Product'));
    }

    if (categorizedOrderItems.get('Outlet Asset').length){
        validateAgainstOutletAssetLimits(categorizedOrderItems.get('Outlet Asset'));
    }

    function categorizeOrderItems(orderItems){

        let itemMap = new Map([
                ["Product", []], 
                ["Outlet Asset", []]]);

        orderItems.forEach(oi => {

            let product = productMap.get(oi.Product2Id);

            if (record.Type == 'Product Order' && account.RecordTypeId == pharmacyTypeId){
                itemMap.get('Product').push(oi);
            }
            if ((record.Type == 'Sample Order' && account.RecordTypeId == medProfTypeId && product.AW_Is_Restricted_Drug__c) || record.Type == 'Product Order' && account.RecordTypeId == salespersonTypeId){
                itemMap.get('Outlet Asset').push(oi);
            }
        });
        return itemMap;
    }

    function validateAgainstProductLimits(newOrderItems){
        newOrderItems.forEach(oi => {
            adjustQuantityFromProduct(oi)
        });
    }

    function validateAgainstOutletAssetLimits(newOrderItems){

        const mappingCodeToOrderItems = new Map();

        newOrderItems.forEach(oi => {

            let mappingCode = record.AccountId + '-' + oi.Product2Id;
            
            if (!mappingCodeToOrderItems.has(mappingCode)){
                mappingCodeToOrderItems.set(mappingCode, [oi]);
            }  
            else {
                mappingCodeToOrderItems.get(mappingCode).push(oi);
            }
        });
        aforza__Outlet_Asset__c.forEach(oa => {

            const mappingCode = record.AccountId + '-' + oa.aforza__Product__c;
            
            if (!mappingCodeToOrderItems.has(mappingCode)) {
                return;
            }
            const assetQuantitiesToAdjust = mappingCodeToOrderItems.get(mappingCode);

			const limit = getQuantityLimit(oa, account.AW_Country__c);
            
            assetQuantitiesToAdjust.forEach(oi => {
                adjustQuantityFromOA(oa, oi, limit);
            });
        });
    }

    function getQuantityLimit(oa, accountCountry){
        
        let limit;
        let product = productMap.get(oa.aforza__Product__c);
        
        if (account.RecordTypeId == medProfTypeId){
            limit = product['AW_Doctor_Limit_' + accountCountry + '__c'];
        }

        else if (account.RecordTypeId == salespersonTypeId){
            limit = product.AW_FA_Yearly_Limit__c;
        }
        return limit;
    }

    function adjustQuantityFromOA(oa, oi, limit){
        
        let yearlyQuantity = oa.AW_Yearly_Quantity__c != null ? oa.AW_Yearly_Quantity__c : 0;
        let availableQuantity = limit - yearlyQuantity;

        oi.Quantity = oi.Quantity + yearlyQuantity < limit ? oi.Quantity : availableQuantity > 0 ? availableQuantity : 0;

        oa.AW_Yearly_Quantity__c += oi.Quantity;

    }
    
    function adjustQuantityFromProduct(oi){

        let min = productMap.get(oi.Product2Id).DRWO_Minimum_Quantity__c;
        let max = productMap.get(oi.Product2Id).DRWO_Maximum_Quantity__c;
        
        let q = oi.Quantity;

        oi.Quantity = q < min ? min : q > max ? max : q;
    }

    return payload;
}