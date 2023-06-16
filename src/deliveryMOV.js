function runAction(payload) {
    const { data: { record : {Pricebook2Id}, record, related: {Account: [Account], OrderItem, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}}, data } = payload; // Deconstruct payload
        let standardProductId, standardThreshold, standardPbe, outOfRouteProductId, outOfRouteThreshold, outOfRoutePbe;
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
        PricebookEntry.forEach(getStandardAndExtraPBE);

        // Set the threshold to 0 if it's missing
        if(standardProductId && !standardThreshold) {
            standardThreshold = 0;
        }
        if(outOfRouteProductId && !outOfRouteThreshold) {
            outOfRouteThreshold = 0;
        }
        // Sum order total
        OrderItem.forEach(sumOrderTotal);

        // Decide delivery date.
        let dt, isHoliday, dayName, manualError;
        let deliveryDate = record.EndDate;
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let accountDeliveryDays = Account.Delivery_Day__c.split(';');

        if(!deliveryDate) {                                                // If no Delivery Date has been selected, calculate one
            dt = incrementDeliveryDate(new Date());                        // avoiding holidays and including account delivery days
            dayName = days[dt.getDay()];
            isHoliday = checkHolidays(dt) || !accountDeliveryDays.includes(dayName);
            if (isHoliday && accountDeliveryDays.includes(dayName)){
                dt = incrementDeliveryDate(dt);
                dayName = days[dt.getDay()];                    // If new delivery date is a holiday and a delivery day then select next day
                isHoliday = false;
            }
            while (isHoliday){
                dt = incrementDeliveryDate(dt);
                dayName = days[dt.getDay()];
                isHoliday = checkHolidays(dt) || !accountDeliveryDays.includes(dayName);
                if (isHoliday && accountDeliveryDays.includes(dayName)){
                    dt = incrementDeliveryDate(dt);
                    dayName = days[dt.getDay()];                // If new delivery date is a holiday and a delivery day then select next day
                    isHoliday = false;
                }
            }
            record.EndDate = dt.toISOString().substring(0,10);              // Set record delivery date
            response.orderChanged = true;
        } else {
            dt = new Date(deliveryDate);
            dayName = days[dt.getDay()];
            if (checkHolidays(dt)|| ['Saturday', 'Sunday'].includes(dayName)){
                manualError = true;                                         // If a Delivery Date has been selected by a rep, flag it
            } 
                                                                            // if it is on a public holiday or non delivery day
        }
        if(record.Type != 'YDEV' && record.Type != 'YBLC'){ 
            var standardDelivery = accountDeliveryDays.includes(dayName) || ["PT16", "PT17", "PT25"].includes(Account.Typology__c);
            if(standardDelivery) {
                record.Shipping_Conditions__c = 'ZA';
                removeProduct(outOfRoutePbe);
                // Order value exceeds threshold
                if(orderTotal >= standardThreshold) {
                    // Basket Exceeds Standard Delivery Threshold, no charge
                    message = 'A cesta excede o limite de entrega padrão, sem custo';
                    removeProduct(standardPbe);
                }
                else {
                    // Basket does not meet Standard Delivery Threshold, delivery product added
                    message = 'A cesta não atende ao limite de entrega padrão, produto de entrega adicionado';
                    putProduct(standardPbe);
                }
            }
            else {
                record.Shipping_Conditions__c = 'ZD';
                removeProduct(standardPbe);
                // Order value exceeds threshold
                if(orderTotal >= outOfRouteThreshold) {
                    // Basket Exceeds Out Of Route Threshold, no charge
                    message = 'A cesta excede o limite fora da rota, sem custo';
                    removeProduct(outOfRoutePbe);
                }
                else {
                    // Basket does not meet Out Of Route Threshold, delivery product added
                    message = 'A cesta não atende ao limite fora da rota, produto de entrega adicionado';
                    putProduct(outOfRoutePbe);
                }
            }
        } else {
            data.message = '';
        }
        if(response.orderChanged) {
            data.updateDeviceData = {
                Order: true,
                OrderItem: true
            }
            data.reprice = true;
        }
        // else {
        //     data.updateDeviceData = false;
        //     data.reprice = false;
        // }
        if (manualError){
            // Warning, selected delivery date is a holiday or weekend
            data.message = message + `\n\nAviso, a data selecionada para entrega é um feriado ou um fim de semana \u{2757}`;
        } else {
            // New delivery date
            data.message = message + `\n\nNova data de entrega: ${record.EndDate}`;
        }
        // Function to get the Standard and OutOfRoute delivery products
        function getStandardAndExtraProducts(product){
            if(product.ProductCode == "000000019000000031") {
                standardProductId = product.Id;
            }
            else if(product.ProductCode == "000000019000000034") {
                outOfRouteProductId = product.Id;
            }
        }
        // Function to get the Standard and OutOfRoute delivery pricebook entries
        function getStandardAndExtraPBE(pbe){
            if(pbe.Pricebook2Id == Pricebook2Id) {
                if(pbe.Product2Id == standardProductId) {
                    standardPbe = pbe;
                    standardThreshold = pbe['MOV_' + segment + '__c'];  // Override threshold with pricebook entry
                }
                else if(pbe.Product2Id == outOfRouteProductId) {
                    outOfRoutePbe = pbe;
                    outOfRouteThreshold = pbe['MOV_' + segment + '__c'];    // Override threshold with pricebook entry
                }
            }
        }
        // Function to calculate the order total excluding delivery products
        function sumOrderTotal(orderItem){
            // Sum up total order value ignoring delivery products and tax
            if(orderItem.Quantity && orderItem.UnitPrice && orderItem.aforza__Type__c != "Tax" && !(orderItem.PricebookEntryId == standardPbe.Id || orderItem.PricebookEntryId == outOfRoutePbe.Id)){
                orderTotal += orderItem.UnitPrice * orderItem.Quantity;
            }
        }
        // Function to return an incremental delivery date
        function incrementDeliveryDate(oldDate){
            return new Date(oldDate.setDate(oldDate.getDate() + 1));  // Will return a Date() value that is incremented by 1 day
        }
        // Function to check for holidays on delivery dates
        function checkHolidays(deliveryTime){
            dateString = deliveryTime.toISOString().substring(0,10);                             // Will return false if dateString is not in Holidays keyset or,
            if ((Object.keys(holidays)).includes(dateString)){                                   // if it is in Holiday keyset, return true if its list contains 'All'
                return holidays[dateString].some(obj => ['All', Inventory.Name].includes(obj)); // or Inventory.Name, else return false
            } else{
                return false;
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
                OrderItem.push({Product2Id: pbe.Product2Id, PricebookEntryId : pbe.Id, Quantity : 1, UnitPrice: 0, aforza__Type__c: "Product" });
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