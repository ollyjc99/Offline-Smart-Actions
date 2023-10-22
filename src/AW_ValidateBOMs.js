function runAction(payload) {
    const { data: {related: {Product2, OrderItem, aforza__Relationship_Rule__c}}, data} = payload;

    const bomMap = new Map();
    const productMap = new Map();
    const childIds = new Set();
    const bomIds = new Set(OrderItem.map(obj => obj.Product2Id));

    Product2.forEach(obj => {
        if (bomIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name) && obj.aforza__Type__c == 'BOM'){
          bomMap.set(obj.Id, []);
          productMap.set(obj.Id, obj);
        }
    });
;

    if (!bomMap.size){
        return;
    }

    aforza__Relationship_Rule__c.filter(obj => bomMap.has(obj.aforza__Target_Product__c));

    aforza__Relationship_Rule__c.forEach(obj => {
        childIds.add(obj.aforza__Source_Product__c);
        bomMap.get(obj.aforza__Target_Product__c).push(obj.aforza__Source_Product__c);
    });

    Product2.forEach(obj => {
        if (childIds.has(obj.Id)){
            productMap.set(obj.Id, obj);
        }
    });

    const productToBOMs = new Map();

    for (const [bom, productsIds] of bomMap) {
      for (const id of productsIds) {
        data.message += `Id: ${id} `;
        if (!productToBOMs.has(id)) {
            productToBOMs.set(id, []);
        }
        productToBOMs.get(id).push(productMap.get(bom).Name);
      }
    }

    const duplicateProducts = new Map();

    for (const [product, boms] of productToBOMs) {
      if (boms.length) {
        duplicateProducts.set(product, boms);
      }
    }

    if (duplicateProducts){
      data.error = 'There are duplicate products in BOMs:\n';

      duplicateProducts.forEach((value, key) => {
        let product = productMap.get(key);

        data.error += ` - ${product.Name}: ${value}\n          `;
      });
    }
    else {
      data.message = 'BOMs Valid';
    }

    return payload;
}