function runAction(payload) {
    const { data: { record : {Pricebook2Id, AccountId, aforza__Inventory__c: InventoryId}, related: {Account: [Account], OrderItem, Product2, PricebookEntry, aforza__Inventory__c: [Inventory]}, record}, data } = payload; // Deconstruct payload
    // const [inventory] = aforza__Inventory__c.filter(obj => obj.id === InventoryId);
    let standardProductId, standardThreshold, standardPbe, outOfRouteProductId, outOfRouteThreshold, outOfRoutePbe, hasStandard = false, hasOutOfRoute = false;
    const holidays = {'2023-04-07': ['All'], '2023-12-25': ['All'], '2023-12-08': ['All'], '2023-12-01': ['All'], '2023-11-01': ['All'], '2023-10-05': ['All'], '2023-08-15': ['All'], '2023-06-10': ['All'], '2023-06-08': ['All'], '2023-04-25': ['All', 'Warehouse - Alcains'], '2023-05-01': ['All'], '2023-10-22': ['Warehouse - Grândola'], '2023-05-22': ['Warehouse - Leiria'], '2023-06-13': ['Warehouse - Camarate'], '2023-05-23': ['Warehouse - Portalegre'], '2023-06-24': ['Warehouse - Porto'], '2023-06-29': ['Warehouse - Setúbal', 'Warehouse - Évora', 'Warehouse - Bombarral'], '2023-09-03': ['Warehouse - Algoz'], '2023-05-18': ['Warehouse - Beja'], '2023-07-04': ['Warehouse - Coimbra'], '2023-09-07': ['Warehouse - Faro']};
    let orderTotal = 0;
    let response = {orderChanged : false, reprice : false};
    let message;

    let notHoliday;
    let deliveryDate = record.EndDate;
    if(!deliveryDate) {
        let dt = new Date();
        deliveryDate = getDeliveryDate(dt);
    }
    notHoliday = checkHolidays(deliveryDate);
    while (notHoliday){
        deliveryDate = getDeliveryDate(dt);
        notHoliday = checkHolidays(deliveryDate);
    }
    let dt = new Date(deliveryDate);
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dayName = days[dt.getDay()];
    if(dayName == 'Sunday' || dayName == 'Saturday') {
        dayName = 'Monday';
    }
    // let accountDeliveryDays = Account.Delivery_Day__c.split(';');
    let accountDeliveryDays = ['Tuesday', 'Thursday'];
    var standardDelivery = accountDeliveryDays.includes(dayName);

    data.message = dt;
    data.message += `/n${dayName}`;
    data.message += `/n${Account.Delivery_Day__c}`;

    function getDeliveryDate(oldDate){
        oldDate.setDate(oldDate.getDate() + 1);         // Function to return an incremental delivery date as a string
        return oldDate.toISOString().substring(0,10)
    }
    function checkHolidays(deliveryTime){
        if ((Object.keys(holidays)).includes(deliveryTime)){                    // Function to check for holidays on delivery dates
            return holidays[deliveryTime].every(obj => ['All', Inventory.Name].includes(obj));
        }
    }
    return payload;
}