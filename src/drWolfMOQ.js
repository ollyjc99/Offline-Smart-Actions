function runAction(payload) {
    const {data :{record: {Type}, related: {Product2, OrderItem}}, data} = payload;
    // @authors: Oliver

    if (Type != 'Return Order'){
        // Pricebook records to get product tax rate & name
        let productIdToProduct = new Map();

        Product2.forEach(prod => {
            productIdToProduct.set(prod.Id, prod);
        });

        OrderItem.forEach(obj => {
            let prod = productIdToProduct.get(obj.Product2Id);
            

        });

        if(moqs.all >= 10) {
            data.message = '';
            data.blockExecution = false;
        }
        else {
            data.error = '';

            data.blockExecution = true;
        }
        data.updateDeviceData = false;
        data.reprice = false;
    } else { 
        data.message = '';
    }
    return payload;
}