function runAction(r){const{data:{record:{AccountId:t,aforza__Inventory__c:c},order:a,related:{Account:[n],OrderItem:_,Product2:s,PricebookEntry:d,aforza__Inventory__c:[o]}},data:e}=r;return e.message=`${n.Name}
Id: ${t}
`,e.message+=`${o.Name}
`,e.message+=`${n.Customer_Segment__c}`,e.message+=`
${n.Delivery_Day__c}`,r}
