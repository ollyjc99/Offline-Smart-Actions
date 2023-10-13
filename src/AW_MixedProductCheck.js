// @author: Oliver Carter
function runAction(payload) {
    const { data: {related: {Product2, OrderItem}}, data} = payload;

    const productIds = new Set(OrderItem.map(obj => obj.Product2Id));

    const mixedProductMap = new Map([["Restricted", []], ["Unrestricted", []]]);

    Product2.forEach(obj => {
        if (productIds.has(obj.Id)){
            mixedProductMap.get(obj.AW_Is_Restricted_Drug__c ? "Restricted" : "Unrestricted").push(obj);
        }
    });

    if (mixedProductMap.get('Restricted').length > 0 && mixedProductMap.get('Unrestricted').length > 0){

        data.error = 'You have mixed Restricted and Unrestricted Products:\n';
        data.blockExecution = true;

        for (const key of mixedProductMap.keys()){
            data.error += `\n${key} products:\n`;
            mixedProductMap.get(key).forEach(obj => {
                data.error += `\n${obj.Name}`;
            });
            data.error += '\n';
        }
    }
    else {
        data.message = `Products Validated \{u2713}`;
    }
    return payload;
}