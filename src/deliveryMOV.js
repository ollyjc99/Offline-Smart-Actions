function runAction(payload) {
    const { data: { record : {Pricebook2Id, aforza__Inventory__c: InventoryId}, record, related: {Account: [Account], OrderItem, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}}, data } = payload; // Deconstruct payload
    let standardProductId, standardThreshold, standardPbe, outOfRouteProductId, outOfRouteThreshold, outOfRoutePbe;
    const holidays = {'2023-04-18': ['All'],'2023-04-07': ['All'], '2023-12-25': ['All'], '2023-12-08': ['All'], '2023-12-01': ['All'], '2023-11-01': ['All'], '2023-10-05': ['All'], '2023-08-15': ['All'], '2023-06-10': ['All'], '2023-06-08': ['All'], '2023-04-25': ['All', 'Warehouse - Alcains'], '2023-05-01': ['All'], '2023-10-22': ['Warehouse - Grândola'], '2023-05-22': ['Warehouse - Leiria'], '2023-06-13': ['Warehouse - Camarate'], '2023-05-23': ['Warehouse - Portalegre'], '2023-06-24': ['Warehouse - Porto'], '2023-06-29': ['Warehouse - Setúbal', 'Warehouse - Évora', 'Warehouse - Bombarral'], '2023-09-03': ['Warehouse - Algoz'], '2023-05-18': ['Warehouse - Beja'], '2023-07-04': ['Warehouse - Coimbra'], '2023-09-07': ['Warehouse - Faro']};
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
    PricebookEntry.forEach(getStandardAndExtraPBE);
    // Set the threshold to 0 if it's missing
    if(standardProductId && !standardThreshold) {
        standardThreshold = 0;
    }
    if(outOfRouteProductId && !outOfRouteThreshold) {
        outOfRouteThreshold = 0;
    }
    OrderItem.forEach(isStandardOrExtra);         // Sum order total

    // Decide delivery date.
    let dt, notHoliday, dayName, manualError;
    let deliveryDate = record.EndDate;
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let accountDeliveryDays = Account.Delivery_Day__c.split(';');
    if(!deliveryDate) {                                                // If no Delivery Date has been selected, calculate one
        dt = incrementDeliveryDate(new Date());                        // avoiding holidays and including account delivery days
        dayName = days[dt.getDay()];
        notHoliday = checkHolidays(dt) && accountDeliveryDays.includes(dayName);
        while (!notHoliday){
            dt = incrementDeliveryDate(dt);
            dayName = days[dt.getDay()];
            notHoliday = checkHolidays(dt) && accountDeliveryDays.includes(dayName);
        }
        record.EndDate = dt.toISOString().substring(0,10);              // Set record delivery date
    } else {
        dt = new Date(deliveryDate);
        dayName = days[dt.getDay()];
        if (!(checkHolidays(dt) && accountDeliveryDays.includes(dayName))){
            manualError = true;                                         // If a Delivery Date has been selected by a rep, flag it
        }                                                               // if it is on a public holiday or non delivery date
    }
    var standardDelivery = accountDeliveryDays.includes(dayName);
    if(standardDelivery) {
        // removeProduct(OrderItem, outOfRoutePbe, response);
        removeProduct(outOfRoutePbe);
        // Order value exceeds threshold
        if(orderTotal >= standardThreshold) {
            message = 'Basket Exceeds Standard Delivery Threshold, no charge';
            removeProduct(standardPbe);

        }
        else {
            message = 'Basket does not meet Standard Delivery Threshold, delivery product added';
            putProduct(standardPbe);
        }
    }
    else {
        removeProduct(standardPbe);

        // Order value exceeds threshold
        if(orderTotal >= outOfRouteThreshold) {
            message = 'Basket Exceeds Out Of Route Threshold, no charge';
            removeProduct(outOfRoutePbe);
        }
        else {
            message = 'Basket does not meet Out Of Route Threshold, delivery product added';
            putProduct(outOfRoutePbe);
        }
    }
    if(response.orderChanged) {
        data.updateDeviceData = {
            Order: true,
            OrderItem: true
        }
        data.reprice = response.reprice;
    }
    else {
        data.updateDeviceData = false;
        data.reprice = false;
    }
    if (manualError){
        data.error = message + `\n\nDelivery date on\nholiday: ${record.EndDate}`;
    } else {
        data.message = message + `\n\nDelivery Date: ${record.EndDate}`;
    }
    // Function to get the Standard and OutOfRoute delivery products
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
    // Function to get the Standard and OutOfRoute delivery pricebook entries
    function getStandardAndExtraPBE(pbe){
        if(pbe.Pricebook2Id == Pricebook2Id) {
            if(pbe.Product2Id == standardProductId) {
                standardPbe = pbe;
                if(pbe['MOV_' + segment + '__c']){
                    standardThreshold = pbe['MOV_' + segment + '__c'];  // Override threshold with pricebook entry
                }
            }
            else if(pbe.Product2Id == outOfRouteProductId) {
                outOfRoutePbe = pbe;
                if(pbe['MOV_' + segment + '__c']){
                    outOfRouteThreshold = pbe['MOV_' + segment + '__c'];    // Override threshold with pricebook entry
                }
            }
        }
    }
    // Function to calculate the order total excluding delivery products
    function isStandardOrExtra(orderItem){
        // if(standardProductId && orderItem.PricebookEntryId == standardPbe.Id) {
        //     hasStandard = true;
        // }
        // else if(outOfRouteProductId && orderItem.PricebookEntryId == outOfRoutePbe.Id) {
        //     hasOutOfRoute = true;
        // }
        // Sum up total order value ignoring delivery products
        
        if(orderItem.Quantity && orderItem.UnitPrice && !((orderItem.Product2Id == standardProductId) || (orderItem.Product2Id == outOfRouteProductId))){
        // else if(orderItem.Quantity && orderItem.UnitPrice){
            orderTotal += orderItem.UnitPrice * orderItem.Quantity;
        }
    }
    // Function to return an incremental delivery date
    function incrementDeliveryDate(oldDate){
        return new Date(oldDate.setDate(oldDate.getDate() + 1));  // Will return a Date() value that is incremented by 1 day
    }
    // Function to check for holidays on delivery dates
    function checkHolidays(deliveryTime){
        dateString = deliveryTime.toISOString().substring(0,10);                             // Will return true if dateString is not in Holidays keyset or,
        if ((Object.keys(holidays)).includes(dateString)){                                   // if it is in Holiday keyset, return true if its list contains 'All'
            return !holidays[dateString].some(obj => ['All', Inventory.Name].includes(obj)); // or Inventory.Name, else return false
        } else{
            return true;
        }
    }
    // Function to put Standard/OutOfRoute product in Basket
    function putProduct(pbe) {
        let index;
        // Check if product already in basket
        for(let i in OrderItem) {
            if(OrderItem[i].PricebookEntryId == pbe.Id) {
                index = i;
                break;
            }
        }
        // Add it if missing
        if(!index) {
            OrderItem.push({Product2Id: pbe.Product2Id, PricebookEntryId : pbe.Id, Quantity : 1});
            response.orderChanged = true;
            response.reprice = true;
        }
        // Fix quantity to 1
        else if(OrderItem[index].Quantity != 1) {
            OrderItem[index].Quantity = 1;
            response.orderChanged = true;
        }
    }
    function removeProduct(pbe) {
        let index;
        for(let i in OrderItem) {
            if(OrderItem[i].PricebookEntryId == pbe.Id) {
                index = i;
                break;
            }
        }
        if(index) {
            OrderItem.splice(index, 1);
            response.orderChanged = true;
        }
    }
    return payload;
}