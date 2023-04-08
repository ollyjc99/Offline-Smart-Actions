function runAction(payload) {
    const { data: { record : {Pricebook2Id, AccountId, aforza__Inventory__c: InventoryId}, record, related: {Account: [Account], OrderItem, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}}, data } = payload; // Deconstruct payload
    let standardProductId, standardThreshold, standardPbe, outOfRouteProductId, outOfRouteThreshold, outOfRoutePbe;
    let hasStandard = false;
    let hasOutOfRoute = false;
    const holidays = {'2023-04-07': ['All'], '2023-12-25': ['All'], '2023-12-08': ['All'], '2023-12-01': ['All'], '2023-11-01': ['All'], '2023-10-05': ['All'], '2023-08-15': ['All'], '2023-06-10': ['All'], '2023-06-08': ['All'], '2023-04-25': ['All', 'Warehouse - Alcains'], '2023-05-01': ['All'], '2023-10-22': ['Warehouse - Grândola'], '2023-05-22': ['Warehouse - Leiria'], '2023-06-13': ['Warehouse - Camarate'], '2023-05-23': ['Warehouse - Portalegre'], '2023-06-24': ['Warehouse - Porto'], '2023-06-29': ['Warehouse - Setúbal', 'Warehouse - Évora', 'Warehouse - Bombarral'], '2023-09-03': ['Warehouse - Algoz'], '2023-05-18': ['Warehouse - Beja'], '2023-07-04': ['Warehouse - Coimbra'], '2023-09-07': ['Warehouse - Faro']};
    let orderTotal = 0;
    let response = {orderChanged : false, reprice : false};
    let message;

    // Get the customer segment and default to 06 (Occasional) if not found
    let segment = Account.Customer_Segment__c;
    if(!segment || segment == '99') {
        segment = '06';
    }
    // Find the standard / out of route products and grab the ids / and minimum order value thresholds
    Product2.forEach(getStandardAndExtraProducts);

    // Set the threshold to 0 if it's missing
    if(standardProductId && !standardThreshold) {
        standardThreshold = 0;
    }
    if(outOfRouteProductId && !outOfRouteThreshold) {
        outOfRouteThreshold = 0;
    }
    PricebookEntry.forEach(getStandardAndExtraPBE);
    OrderItem.forEach(isStandardOrExtra);

    // Decide delivery date.
    let dt;
    let notHoliday;
    let deliveryDate = record.EndDate;
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if(!deliveryDate) {
        dt = new Date();
        deliveryDate = getDeliveryDate(dt);
    } else {
        
    }
    notHoliday = checkHolidays(deliveryDate.toISOString().substring(0,10));
    while (notHoliday){
        let dayName = days[dt.getDay()];
        if(dayName == 'Sunday' || dayName == 'Saturday') {
            dayName = 'Monday';
        }
        deliveryDate = getDeliveryDate(dt);
        notHoliday = checkHolidays(deliveryDate.toISOString().substring(0,10));
    }
    dt = new Date(deliveryDate);
    let accountDeliveryDays = Account.Delivery_Day__c.split(';');
    var standardDelivery = accountDeliveryDays.includes(dayName);
    if(standardDelivery) {
        removeProduct(OrderItem, outOfRoutePbe, response);
        // Order value exceeds threshold
        if(orderTotal >= standardThreshold) {
            payload.data.message = 'Basket Exceeds Standard Delivery Threshold, no charge';
            removeProduct(OrderItem, standardPbe, response);
        }
        else {
            payload.data.message = 'Basket does not meet Standard Delivery Threshold, delivery product added';
            putProduct(OrderItem, standardPbe, response);
        }
    }
    else {
        removeProduct(OrderItem, standardPbe, response);
        // Order value exceeds threshold
        if(orderTotal >= outOfRouteThreshold) {
            payload.data.message = 'Basket Exceeds Out Of Route Threshold, no charge';
            removeProduct(OrderItem, outOfRoutePbe, response);
        }
        else {
            payload.data.message = 'Basket does not meet Out Of Route Threshold, delivery product added';
            putProduct(OrderItem, outOfRoutePbe, response);
        }
    }
    if(response.orderChanged) {
        payload.data.updateDeviceData = {
            Order: true,
            OrderItem: true
        }
        payload.data.reprice = response.reprice;
    }
    else {
        payload.data.updateDeviceData = false;
        payload.data.reprice = false;
    }
    function getStandardAndExtraProducts(product){
        if(product.ProductCode == "000000019000000031") {
            standardProductId = product.Id;
            standardThreshold = product['MOV_' + segment + '__c'];
        }
        else if(product.ProductCode == "000000019000000034") {
            outOfRouteProductId = product.Id;
            outOfRouteThreshold = product['MOV_' + segment + '__c'];
        }
    }
    function getStandardAndExtraPBE(pbe){
        if(pbe.Pricebook2Id == record.Pricebook2Id) {
            if(pbe.Product2Id == standardProductId) {
                standardPbe = pbe;
            }
            else if(pbe.Product2Id == outOfRouteProductId) {
                outOfRoutePbe = pbe;
            }
        }
    }
    function isStandardOrExtra(orderItem){
        if(standardProductId && orderItem.PricebookEntryId == standardPbe.Id) {
            hasStandard = true;
        }
        else if(outOfRouteProductId && orderItem.PricebookEntryId == outOfRoutePbe.Id) {
            hasOutOfRoute = true;
        }
        // Sum up total order value ignoring delivery products
        else if(orderItem.TotalPrice) {
            orderTotal += orderItem.TotalPrice;
        }
    }
    function getDeliveryDate(oldDate){
        return oldDate.setDate(oldDate.getDate() + 1);         // Function to return an incremental delivery date
    }
    // function getDeliveryDate(oldDate){
    //     oldDate.setDate(oldDate.getDate() + 1);         // Function to return an incremental delivery date as a string
    //     return oldDate.toISOString().substring(0,10)
    // }
    function checkHolidays(deliveryTime){
        dateString = deliveryTime.toISOString().substring(0,10);
        if ((Object.keys(holidays)).includes(deliveryTime)){                    // Function to check for holidays on delivery dates
            return holidays[deliveryTime].every(obj => ['All', Inventory.Name].includes(obj));
        }
    }
    function putProduct(orderItems, pbe, response) {
        let index;
        // Check if product already in basket
        for(let i in orderItems) {
            if(orderItems[i].PricebookEntryId == pbe.Id) {
                index = i;
                break;
            }
        }
        // Add it if missing
        if(!index) {
            orderItems.push({PricebookEntryId : pbe.Id, Quantity : 1});
            response.orderChanged = true;
            response.reprice = true;
        }
        // Fix quantity to 1
        else if(orderItems[index].Quantity != 1) {
            orderItems[index].Quantity = 1;
            response.orderChanged = true;
        }
    }
    function removeProduct(orderItems, pbe, response) {
        let index;
        for(let i in orderItems) {
            if(orderItems[i].PricebookEntryId == pbe.Id) {
                index = i;
                break;
            }
        }
        if(index) {
            orderItems.splice(index, 1);
            response.orderChanged = true;
        }
    }
    return payload;
}