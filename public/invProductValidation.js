function runAction(t){const{data:{record:{aforza__Inventory__c:o},related:{OrderItem:a,Product2:c,aforza__Inventory_Product__c:d}},data:e}=t,i=d.filter(r=>r.aforza__Inventory__c===o),s=new Set(i.map(r=>r.aforza__Product__c)),u=a.filter(r=>!s.has(r.Product2Id)),_=new Set(u.map(r=>r.Product2Id)),n=c.filter(r=>_.has(r.Id)&&!new Set(["Tax","Promotion","Discount"]).has(r.Name));function l(r){e.error+=`
\u2717 ${r.Name}`}return n.length?(e.error=`Invalid Products for
Selected Plant:
`,n.forEach(l),e.blockExecution=!0,e.updateDeviceData=!1,e.reprice=!1):e.message="\u2713 Order validated",t}
