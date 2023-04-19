function runAction(a){const{data:{record:{Type:n},related:{Product2:i,OrderItem:u}},data:l}=a;if(n!="Return Order"){let s=new Map,e={all:0,cases:0,l20:0,l30:0,l50:0};i.forEach(t=>{s.set(t.Id,t)}),u.forEach(t=>{let r=s.get(t.Product2Id);e.all+=t.Quantity,r.QuantityUnitOfMeasure=="Case"?e.cases+=t.Quantity:r.QuantityUnitOfMeasure=="Each"&&(r.Product_Volume__c==.5?e.l50+=t.Quantity:r.Product_Volume__c==.3?e.l30+=t.Quantity:r.Product_Volume__c==.2&&(e.l20+=t.Quantity))}),e.all>=10||e.cases>=10||e.l50>=2||e.l30>=3||e.l20>=5?(l.message="Minimum Order Quantity met.",l.blockExecution=!1):(l.error=`Deliveries by NBL to your outlet will only be done for a Minimum Order Quantity (MOQ*). Orders should include at least one of the following items:

    10 assorted cases;
    2x50 litres kegs;
    3x30 litres kegs; or
    5 kegs of any capacity.

*MOQ is the fewest number of units required to be purchased at one time. `,l.blockExecution=!0),l.updateDeviceData=!1,l.reprice=!1}else l.message=`MOQ is not needed for Ullages
Please continue.`;return a}
