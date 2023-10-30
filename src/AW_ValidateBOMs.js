function runAction(payload) {
    const { data: {related: {Product2, OrderItem, aforza__Relationship_Rule__c}}, data} = payload;

    const bomMap = new Map();
    const productMap = new Map();
    const productIds = new Set();

    let orderItemIds = OrderItem.map(obj => obj.Product2Id);

    Product2.forEach(obj => {
      if (orderItemIds.includes(obj.Id) && obj.aforza__Type__c == 'Vertriebsstückliste'){
        productMap.set(obj.Id, obj);
    }}); 

    aforza__Relationship_Rule__c.filter(obj => obj.aforza__Target_Product__c != null && obj.aforza__Source_Product__c != null);

    aforza__Relationship_Rule__c.forEach(obj => {
      if (productMap.has(obj.aforza__Source_Product__c)){
        productIds.add(obj.aforza__Target_Product__c);
      }
    });

    Product2.forEach(obj => {
      if (productIds.has(obj.Id)){
          productMap.set(obj.Id, obj);
      }
    });

    aforza__Relationship_Rule__c.forEach(obj => {

      let product = productMap.get(obj.aforza__Source_Product__c);
      let bom = productMap.get(obj.aforza__Target_Product__c);

      if (product == null || bom == null) return;

      if (!bomMap.has(product.Name)){
        bomMap.set(product.Name, [' ' + bom.Name]);
      }
      else {
        bomMap.get(product.Name).push(' '+ bom.Name);
      }
    })

    const duplicateProducts = new Map();

    for (const [product, boms] of bomMap) {
      if (boms.length > 1) {
        duplicateProducts.set(product, boms);
      }
    }

    if (bomMap.size){
      data.blockExecution = true;
      data.error = 'There are duplicate products in BOMs:\n';

      for (const [product, boms] of bomMap) {
        data.error += ` - ${product}:${boms}\n  `;
      }
    }
    
    else {
      data.message = `BOMs best\u00E4tigt \u2713`;
    }

    return payload;
}