function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem}}, data} = payload;
    // @authors: Matt & James

    if (Type != 'Return Order'){
        // Pricebook records to get product tax rate & name
        let productIdToProduct = new Map();

        let moqs = {
            all: 0,
            cases: 0,
            l20: 0,
            l30: 0,
            l50: 0
        };
        Product2.forEach(prod => {
            productIdToProduct.set(prod.Id, prod);
        });

        OrderItem.forEach(obj => {
            let prod = productIdToProduct.get(obj.Product2Id);

            moqs.all += obj.Quantity;

            if(prod.QuantityUnitOfMeasure == 'Case') {
                moqs.cases += obj.Quantity;
            } 
            else if(prod.QuantityUnitOfMeasure == 'Each') {
                if(prod.Product_Volume__c == 0.5) {
                    moqs.l50 += obj.Quantity;
                }
                else if(prod.Product_Volume__c == 0.3) {
                    moqs.l30 += obj.Quantity;
                }
                else if(prod.Product_Volume__c == 0.2) {
                    moqs.l20 += obj.Quantity;
                }
            }
        });

        if(moqs.all >= 10 || moqs.cases >= 10 || moqs.l50 >= 2 || moqs.l30 >= 3 || moqs.l20 >= 5) {
            data.message = 'Minimum Order Quantity met.';
            data.blockExecution = false;
        }
        else {
            data.error = 'Deliveries by NBL to your outlet will only be done for a Minimum Order Quantity (MOQ*). Orders should include at least one of the following items:\n' +
            '\n' +
            '    10 assorted cases;\n' +
            '    2x50 litres kegs;\n' +
            '    3x30 litres kegs; or\n' +
            '    5 kegs of any capacity.\n' +
            '\n' +
            '*MOQ is the fewest number of units required to be purchased at one time. ';

            data.blockExecution = true;
        }
        data.updateDeviceData = false;
        data.reprice = false;
    } else { 
        data.message = 'MOQ is not needed for Ullages\nPlease continue.';
    }
    return payload;
}