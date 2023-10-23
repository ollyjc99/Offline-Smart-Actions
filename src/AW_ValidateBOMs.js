function runAction(payload) {
    const { data: {related: {Product2, OrderItem, aforza__Relationship_Rule__c}}, data} = payload;

    const bomMap = new Map();
    const productMap = new Map();
    const productIds = new Set();

    const bomOrderItems = OrderItem.filter(obj => obj.aforza__Type__c == 'BOM');

    if (!bomOrderItems){
      data.message = 'Bestellung best\{u00E4}tigt \{u2713}';
      return payload;
    }

    const itemIds = new Set(bomOrderItems.map(obj => obj.Product2Id));

    aforza__Relationship_Rule__c.filter(obj => itemIds.has(obj.aforza__Target_Product__c));

    aforza__Relationship_Rule__c.forEach(obj => {
      productIds.add(obj.aforza__Source_Product__c);
    });

    Product2.forEach(obj => {
      if (productIds.has(obj.Id) || itemIds.has(obj.Id)){
          productMap.set(obj.Id, obj);
      }
    });

    aforza__Relationship_Rule__c.forEach(obj => {

        let product = productMap.get(obj.aforza__Source_Product__c);
        let bom = productMap.get(obj.aforza__Target_Product__c);

        if (!bomMap.has(product.Name)){
          bomMap.set(product.Name, [' ' + bom.Name]);
        }
        else {
          bomMap.get(product.Name).push(' '+ bom.Name);
        }
    });

    const duplicateProducts = new Map();

    for (const [product, boms] of bomMap) {
      if (boms.length) {
        duplicateProducts.set(product, boms);
      }
    }

    if (duplicateProducts){
      data.blockExecution = true;
      data.error = 'There are duplicate products in BOMs:\n';

      for (const [product, boms] of duplicateProducts) {
        data.error += ` - ${product}:${boms}\n  `;
      }
    }
    
    else {
      data.message = 'BOMs best\{u00E4}tigt \{u2713}';
    }

    return payload;
}