function runAction(payload) {
  const { data: { record : {aforza__Inventory__c}, related: { OrderItem, Product2, aforza__Inventory_Product__c}}, data } = payload; // Deconstruct payload
  
  const inventoryProducts = aforza__Inventory_Product__c.filter(obj => obj.aforza__Inventory__c === aforza__Inventory__c); // Filter inventory products for selected inventory
  const inventoryIds = new Set(inventoryProducts.map(obj => obj.aforza__Product__c));  // Create a set of product ids from inventory products
  
  const invalidOrderItems = OrderItem.filter(obj => !inventoryIds.has(obj.Product2Id)); // Filter order products to those that don't have a corresponding inventory product
  const invalidIds = new Set(invalidOrderItems.map(obj => obj.Product2Id));  // Create an array of product ids from order products
  
  const invalidProducts = Product2.filter((obj) => invalidIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name)); // Filter products with the array of invalid ids excluding Tax, Promotion and Discount
  
  function buildError(item){
    data.error += `\n✗ ${item.Name}`;   // For each invalid product, add product name to error message with an escape sequence character
  }
  if (invalidProducts.length){   // If invalidProducts is not empty, block progression within order capture
    data.error = `Invalid Products for\nSelected Plant:\n`; // Creates the opening header for return error message
    invalidProducts.forEach(buildError);  // Build return error message with invalid products, function is not executed if list is empty
    data.blockExecution = true;
    data.updateDeviceData = false;
    data.reprice = false;
  } else{
    data.message = '✓ Order validated';  // If invalidProducts is empty, proceed with order completion
  }
  return payload;
}