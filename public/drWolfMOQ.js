function runAction(c){const{data:{record:{Type:f},related:{Product2:s,OrderItem:d,Account:[n]},record:a},data:e}=c;let m=new Set,i=new Map,o=new Array,_=new Array;f!="Return Order"&&(n.RecordTypeId==="TBD"||n.RecordTypeId==="TBD"||n.RecordTypeId==="TBD"||n.RecordTypeId==="0122z000002QGJtAAO"||n.RecordTypeId==="0122z000002QGJyAAO")&&(d.forEach(r=>{m.add(r.Product2Id)}),s.forEach(r=>{m.has(r.Id)&&i.set(r.Id,r)}),i.size&&d.forEach(y),o.length||_.length?(e.error="",O(o,_),e.blockExecution=!0):(e.message="Order validated \u2713",e.updateDeviceData=!0,e.reprice=!0,e.blockExecution=!1)),(n.aforza__Minimum_Order_Amount__c!=null||n.aforza__Minimum_Order_Amount__c!=0)&&a.TotalAmount!=0&&n.aforza__Minimum_Order_Amount__c>a.TotalAmount?(errorMessage=`Order Total less than Account Minimum Order Amount by \u20AC${Math.round((n.aforza__Minimum_Order_Amount__c-a.TotalAmount)*100)/100}`,e.error==null?e.error=errorMessage:e.error+=`

${errorMessage}`):e.message="Order validated \u2713";function y(r){if(!new Set(["Tax","Promotion","Discount"]).has(r.aforza__Type__c)){let t=i.get(r.Product2Id),u={Id:t.Id,Name:t.Name,Difference:null,Quantity:r.Quantity};(t.DRWO_Minimum_Quantity__c!=null||t.DRWO_Minimum_Quantity__c!=0)&&t.DRWO_Minimum_Quantity__c>r.Quantity&&(u.Difference=r.Quantity-t.DRWO_Minimum_Quantity__c,o.push(u)),(t.DRWO_Maximum_Quantity__c!=null||t.DRWO_Maximum_Quantity__c!=0)&&t.DRWO_Maximum_Quantity__c<r.Quantity&&(u.Difference=r.Quantity-t.DRWO_Maximum_Quantity__c,_.push(u))}}function l(r){e.error+=`
\u2717 ${r.Name} ${r.Difference}`}function O(r,t){if(r.length&&(e.error+="Products under Minimum Order Quantity:",r.forEach(l)),t.length){let u="";e.error.length>0&&(u=`

`),e.error+=`${u}Products over Maximum Order Quantity:`,t.forEach(l)}}return c}
