function runAction(r){const{data:{record:e,related:{Account:[t]}},data:n}=r;if(e.Type=="Product Order"&&(t.aforza__Minimum_Order_Amount__c!=null||t.aforza__Minimum_Order_Amount__c!=0)&&e.TotalAmount!=0&&t.aforza__Minimum_Order_Amount__c>e.TotalAmount){let u=Math.round((t.aforza__Minimum_Order_Amount__c-e.TotalAmount)*100)/100;n.error=`Die Bestellsumme liegt um weniger als der Mindestbestellwert: ${u}`}else n.message="Bestellung best\xE4tigt \u2713";return r}
