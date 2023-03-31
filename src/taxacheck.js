function runAction(payload) { // On Checkout Entry
  const { data: { record : {Pricebook2}, related: {OrderItem, Product2, PricebookEntry}}, data } = payload; // Deconstruct payload

  const  pricebookEntries = PricebookEntry.filter(obj => obj.Pricebook2Id = Pricebook2.Id);
  const mov = [pricebookEntries].mov;

  const taxaProduct = [Product2.filter(obj => 'Taxa'.includes(obj.Name))];
  const taxa = [OrderItem.filter(obj => obj.Product2Id = taxa.Id)];
  const fee = taxa.TotalPrice;

  const products = Product2.filter(obj => OrderItem.map(obj=>obj.product2Id).includes(obj.Id) && !['Tax', 'Taxa'].includes(obj.Name));
  const productIds = products.map(obj => obj.Id);

  const OrderProducts = OrderItem.filter(obj => productIds.includes(obj.Product2Id));
  const itemPrices = OrderItem.map(obj => obj.TotalPrice);

  const orderSum = itemPrices.reduce((temp, i) => temp + i, 0);

  if (orderSum > fee){
    // Remove product
    OrderItem = OrderItem.filter(obj => obj.id != taxa.id);
  }
  data.message = 'Order Validated';
  return payload;
}