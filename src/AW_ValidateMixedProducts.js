// @author: Oliver Carter
function runAction(payload) {
    const { data: {related: {Product2, OrderItem}}, data} = payload;

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));

    const mixedProductMap = new Map([["Restricted", []], ["Unrestricted", []]]);

    Product2.forEach(obj => {
        if (productIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)){
            mixedProductMap.get(obj.AW_Is_Restricted_Drug__c ? "Restricted" : "Unrestricted").push(obj);
        }
    });

    if (mixedProductMap.get('Restricted').length > 0 && mixedProductMap.get('Unrestricted').length > 0){

        data.error = 'You have mixed Restricted and Unrestricted Products \u274C\n';
        data.blockExecution = true;

        for (const key of mixedProductMap.keys()){
            data.error += `\n${key} products:\n`;
            mixedProductMap.get(key).forEach(obj => {
                data.error += `\n \u2022 ${obj.Name}`;
            });
            data.error += '\n';
        }
    }
    else {
        data.message = `Bestellung best\{u00E4}tigt \{u2713}`;
    }
    return payload;
}