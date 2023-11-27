function runAction(payload) {

    const { data: {record, related: {Account: [account], Product2, OrderItem, aforza__Outlet_Asset__c}}, data} = payload;

    // Unfortunate hard-coding of all record type Ids due to a limitation with the Aforza App
    const pharmacyTypeIdDEV = '0122z000002QGJyAAO', pharmacyTypeIdUAT = '0123L000000RQhRQAW', pharmacyTypeIdPRD = '';
    const medProfTypeIdDEV = '0123L000000RQhQQAW', medProfTypeIdUAT = '0123L000000c7uDQAQ', medProfTypeIdPRD = '';
    const masterMedProfTypeIdDEV = '0123L000000RQhQQAW', masterMedProfTypeIdUAT = '0123L000000bxrXQAQ', masterMedProfTypeIdPRD = '';
    const salespersonTypeIdDEV = '0122z000002dp2PAAQ', salespersonTypeIdUAT = '0123L000000RoylQAC', salespersonTypeIdPRD = '';

    const pharmacyRecordTypes = new Set([pharmacyTypeIdDEV, pharmacyTypeIdUAT, pharmacyTypeIdPRD]);
    const medProfRecordTypes = new Set([medProfTypeIdDEV, medProfTypeIdUAT, medProfTypeIdPRD]);
    const masterMedProfRecordTypes = new Set([masterMedProfTypeIdDEV, masterMedProfTypeIdUAT, masterMedProfTypeIdPRD]);
    const salespersonRecordTypes = new Set([salespersonTypeIdDEV, salespersonTypeIdUAT, salespersonTypeIdPRD]);

    if (!new Set(['Product Order', 'Sample Order']).has(record.Type) || !new Set([...pharmacyRecordTypes, ...medProfRecordTypes, ...masterMedProfRecordTypes, ...salespersonRecordTypes]).has(account.RecordTypeId)) {
        return payload;
    }

    const adjustedQuantities = [];

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));
    const productMap = new Map();

    Product2.forEach(obj => {
        if (productIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)){
            productMap.set(obj.Id, obj); 
        }
    });

    const orderItemsToProcess = OrderItem.filter((obj) => productMap.has(obj.Product2Id));

    const categorizedOrderItems = categorizeOrderItems(orderItemsToProcess);

    if (categorizedOrderItems.get('Product').length){
        categorizedOrderItems.get('Product').forEach(oi => {
            adjustQuantityFromProduct(oi)
        });
    }

    if (categorizedOrderItems.get('Outlet Asset').length){
        validateAgainstOutletAssetLimits(categorizedOrderItems.get('Outlet Asset'));
    }

    if (adjustedQuantities.length){
        // Some quantities have been adjusted to comply with the limits
        data.message = 'Einige Mengen wurden angepasst, um die Grenzwerte einzuhalten:\n';
        adjustedQuantities.forEach(obj => {
            data.message += `\n \u2022 ${obj.Name}: ${obj.Difference}`;
        });
    }
    else {
        // Order validated
        data.message = `Mengen best\u00E4tigt \u2713`;
    }

    function categorizeOrderItems(orderItems){

        let itemMap = new Map([
                ["Product", []], 
                ["Outlet Asset", []]]);

        orderItems.forEach(oi => {

            let product = productMap.get(oi.Product2Id);

            if (record.Type == 'Product Order' && pharmacyRecordTypes.has(account.RecordTypeId)){
                itemMap.get('Product').push(oi);
            }
            if ((record.Type == 'Sample Order' && new Set([...medProfRecordTypes, masterMedProfRecordTypes]).has(account.RecordTypeId) && product.AW_Is_Restricted_Drug__c) || record.Type == 'Product Order' && salespersonRecordTypes.has(account.RecordTypeId)){
                itemMap.get('Outlet Asset').push(oi);
            }
        });

        return itemMap;
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

            const mappingCode = oa.aforza__Account__c + '-' + oa.aforza__Product__c;
            
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
        
        if (new Set([...medProfRecordTypes, masterMedProfRecordTypes]).has(account.RecordTypeId)){
            limit = product['AW_Doctor_Limit_' + accountCountry + '__c'];
        }
        else if (salespersonRecordTypes.has(account.RecordTypeId)){
            limit = product.AW_FA_Yearly_Limit__c;
        }
        return limit;
    }

    function adjustQuantityFromOA(oa, oi, limit){
        
        let yearlyQuantity = oa.AW_Yearly_Quantity__c != null ? oa.AW_Yearly_Quantity__c : 0;
        let availableQuantity = limit - yearlyQuantity;

        let q = oi.Quantity;

        oi.Quantity = q + yearlyQuantity < limit ? q : availableQuantity > 0 ? availableQuantity : 0;

        oa.AW_Yearly_Quantity__c += oi.Quantity;

        if (q != oi.Quantity){
            getQuantityDifference(q, oi);
        }
    }
    
    function adjustQuantityFromProduct(oi){

        let min = productMap.get(oi.Product2Id).DRWO_Minimum_Quantity__c;
        let max = productMap.get(oi.Product2Id).DRWO_Maximum_Quantity__c;
        
        let q = oi.Quantity;

        oi.Quantity = q < min ? min : q > max ? max : q;

        if (q != oi.Quantity){
            getQuantityDifference(q, oi);
        }
    }

    function getQuantityDifference(q, oi){
        let diff = oi.Quantity - q;

        adjustedQuantities.push({"Name": productMap.get(oi.Product2Id).Name, "Difference": diff < 0 ? diff : '+' + diff});
    }

    return payload;
}