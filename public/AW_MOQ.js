function runAction(a){const{data:{record:{Type:f},related:{Product2:s,OrderItem:o,Account:[d]}},data:n}=a;let _=new Set,u=new Map,i=new Array,c=new Array;if(f!="Product Order"&&d.RecordTypeId!=="0123L000000RQhRQAW"&&d.RecordTypeId!=="0123L000000RQhQQAW"||(o.forEach(e=>{_.add(e.Product2Id)}),s.forEach(e=>{_.has(e.Id)&&!new Set(["Tax","Promotion","Discount"]).has(obj.Name)&&u.set(e.Id,e)}),!u.size))return;o.forEach(m),i.length||c.length?(n.error="",h(i,c),n.blockExecution=!0):(n.message="Bestellung best{u00E4}tigt {u2713}",n.updateDeviceData=!0,n.reprice=!0,n.blockExecution=!1);function m(e){let t=u.get(e.Product2Id),r={Id:t.Id,Name:t.Name,Difference:null};t.DRWO_Minimum_Quantity__c!=null&&t.DRWO_Minimum_Quantity__c!=0&&t.DRWO_Minimum_Quantity__c>e.Quantity&&(r.Difference=e.Quantity-t.DRWO_Minimum_Quantity__c,i.push(r)),t.DRWO_Maximum_Quantity__c!=null&&t.DRWO_Maximum_Quantity__c!=0&&t.DRWO_Maximum_Quantity__c<e.Quantity&&(r.Difference=`+${e.Quantity-t.DRWO_Maximum_Quantity__c}`,c.push(r))}function l(e){n.error+=`\u2717 ${e.Name} ${e.Difference}`}function h(e,t){if(e.length&&(n.error+="Die folgenden Produkte liegen unter der Mindestmenge:",e.forEach(l)),t.length){let r="";n.error.length>0&&(r=`

`),n.error+=`${r}Die folgenden Produkte {u00FC}berschreiten die H{u00F6}chstmenge:`,t.forEach(l)}}return a}
