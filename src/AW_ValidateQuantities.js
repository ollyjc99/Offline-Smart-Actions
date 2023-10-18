function runAction(payload) {

    const { data: {record, related: {Account: [account], Product2, OrderItem, aforza__Outlet_Asset__c}}, data} = payload;

    const pharmacyTypeId = '0122z000002QGJyAAO';
    const medProfTypeId = '0123L000000RQhQQAW';
    const salespersonTypeId = '0122z000002dp2PAAQ';

    if (!new Set(['Product Order', 'Sample Order']).has(record.Type) && !new Set([pharmacyTypeId, medProfTypeId, salespersonTypeId]).has(account.RecordTypeId) && !new Set(['DE', 'AT', 'CH']).has(account.AW_Country__c)) {
        return payload;
    }

    let orderChanged = false;

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));
    const productMap = new Map();

    Product2.forEach(obj => {
        if (productIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)){
            productMap.set(obj.Id, obj); 
        }
    });

    const categorizedOrderItems = categorizeOrderItems(OrderItem);

    if (categorizedOrderItems.get('Pharmacies')){
        validatePharmacyQuantities(categorizedOrderItems.get('Pharmacies'));
    }

    if (categorizedOrderItems.get('Individual')){
        handleIndividualQuantities(categorizedOrderItems.get('Individual'));
    }

    function categorizeOrderItems(orderItems){

        const itemMap = new Map([
                ["Pharmacies", []], 
                ["Individual", []]]);

        orderItems.forEach(oi => {

            let product = productMap.get(oi.Product2Id);

            if (record.Type == 'Product Order' && account.recordType == pharmacyTypeId && product.AW_Is_Restricted_Drug__c){
                itemMap.get('Pharmacies').push(oi);
            }
            if ((record.Type == 'Product Order' && account.recordType == salespersonTypeId) || (record.Type == 'Sample Order' && account.recordType == medProfTypeId)){
                itemMap.get('Individual').push(oi);
            }
        });

        return itemMap;
    }
    function handleIndividualQuantities(orderItems){

        const mappingCodeToOrderItems = new Map(orderItems.map(oi => [oi.accountId + '-' + oi.Product2Id, []]));

        orderItems.forEach(oi => {
            let mappingCode = oi.Order.accountId + '-' +  oi.Product2Id;

            mappingCodeToOrderItems.get(mappingCode).add(oi);

        });
        aforza__Outlet_Asset__c.forEach(oa => {
            let mappingCode = oa.aforza__Account__c + oa.aforza__Product__c;

            if (!mappingCodeToOrderItems.has(mappingCode)) {
                return;
            }

            let quantityLimit;

            if (record.Type == 'Sample Order'){
                quantityLimit = productMap.get(oa.aforza__Product__c).get('AW_Doctor_Limit_' + record.AW_Country__c + '__c');
            }
            else {
                quantityLimit = oa.AW_FA_Yearly_Limit__c;
            }

            mappingCodeToOrderItems.get(mappingCode).forEach(oi => {
                
                let yearlyQuantity = oa.AW_Yearly_Quantity__c != null ? oa.AW_Yearly_Quantity__c : 0;
                let availableQuantity = quantityLimit - yearlyQuantity;
                
                
                oi.Quantity = oi.Quantity + yearlyQuantity < quantityLimit ? oi.Quantity : availableQuantity > 0 ? availableQuantity : 0;
                
                oa.AW_Yearly_Quantity__c += oi.Quantity;
            }
            );
        });
    }
    
    function validatePharmacyQuantities(oi){
        let min = productMap.get(oi.Product2Id).DRWO_Minimum_Quantity__c;
        let max = productMap.get(oi.Product2Id).DRWO_Maximum_Quantity__c;
        
        let q = oi.Quantity;
        
        let adjustedQuantity;
        
        adjustedQuantity = q < min ? min : q > max ? max : q;
        
        oi.Quantity = adjustedQuantity;
    }

    return payload;
}