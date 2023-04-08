function runAction(n){const{data:{record:{AccountId:t,aforza__Inventory__c:c},order:_,related:{Account:[r],OrderItem:a,Product2:s,PricebookEntry:m,aforza__Inventory__c:[o]}},data:e}=n;return e.message="",e.message+=`${r.Name}
Id: ${t}
`,e.message+=`${o.Name}
`,e.message+=`${r.Delivery_Day__c}
`,e.message+=`${r.Point_of_Delivery_Name__c}
`,e.message+=`${n.data.related.Account[0].Customer_Segment__c}
`,n}
