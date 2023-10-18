function runAction(payload) {
  // Deconstruct payload
  const { data: { record : {aforza__Inventory__c}, related: { OrderItem, Product2, aforza__Inventory_Product__c}}, data } = payload; 
  
  // Filter inventory products for selected inventory
  const inventoryProducts = aforza__Inventory_Product__c.filter(obj => obj.aforza__Inventory__c === aforza__Inventory__c);

  // Create a set of product ids from inventory products
  const inventoryIds = new Set(inventoryProducts.map(obj => obj.aforza__Product__c)); 
  
  // Filter order products to those that don't have a corresponding inventory product
  const invalidOrderItems = OrderItem.filter(obj => !inventoryIds.has(obj.Product2Id));

  // Create an array of product ids from order products
  const invalidIds = new Set(invalidOrderItems.map(obj => obj.Product2Id));
  
  // Filter products with the array of invalid ids excluding Tax, Promotion and Discount
  const invalidProducts = Product2.filter((obj) => invalidIds.has(obj.Id) && !new Set(['Tax', 'Promotion', 'Discount']).has(obj.Name));
  
  // For each invalid product, add product name to error message with an escape sequence character
  function buildError(item){
    data.error += `\n✗ ${item.Name}`;  
  }
  // If invalidProducts is not empty, block progression within order capture
  if (invalidProducts.length){  
     // Creates the opening header for return error message
    data.error = `Invalid Products for\nSelected Plant:\n`;

    // Build return error message with invalid products, function is not executed if list is empty
    invalidProducts.forEach(buildError); 
    data.blockExecution = true;
    data.updateDeviceData = false;
    data.reprice = false;
  } 
  // If invalidProducts is empty, proceed with order completion
  else{
    data.message = '✓ Order validated';  
  }
  return payload;
}