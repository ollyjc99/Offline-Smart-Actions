function runAction(S){const{data:{record:{Pricebook2Id:j,aforza__Inventory__c:F},record:u,related:{Account:[b],OrderItem:d,Product2:B,PricebookEntry:w,aforza__Inventory__c:[R]}},data:o}=S;let D,g,s,P,v,c;const W={"2023-04-14":["Test 2"],"2023-04-15":["All"],"2023-04-07":["All"],"2023-12-25":["All"],"2023-12-08":["All"],"2023-12-01":["All"],"2023-11-01":["All"],"2023-10-05":["All"],"2023-08-15":["All"],"2023-06-10":["All"],"2023-06-08":["All"],"2023-04-25":["All","Warehouse - Alcains"],"2023-05-01":["All"],"2023-10-22":["Warehouse - Gr\xE2ndola"],"2023-05-22":["Warehouse - Leiria"],"2023-06-13":["Warehouse - Camarate"],"2023-05-23":["Warehouse - Portalegre"],"2023-06-24":["Warehouse - Porto"],"2023-06-29":["Warehouse - Set\xFAbal","Warehouse - \xC9vora","Warehouse - Bombarral"],"2023-09-03":["Warehouse - Algoz"],"2023-05-18":["Warehouse - Beja"],"2023-07-04":["Warehouse - Coimbra"],"2023-09-07":["Warehouse - Faro"]};let I=0,t={orderChanged:!1,reprice:!1},i,f=b.Customer_Segment__c;(!f||f=="99")&&(f="06"),B.forEach(M),D&&!g&&(g=0),P&&!v&&(v=0),w.forEach(N),d.forEach(Q);let r,_=!1,n,T,C=u.EndDate,k=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],A=b.Delivery_Day__c.split(";");if(C)r=new Date(C),n=k[r.getDay()],O(r)&&A.includes(n)||(T=!0);else{for(r=m(new Date),n=k[r.getDay()],_=O(r)&&A.includes(n);!_;)r=m(r),n=k[r.getDay()],_=O(r)&&A.includes(n);u.EndDate=r.toISOString().substring(0,10)}var z=A.includes(n);z?(E(d,c,t),I>=g?(i="Basket Exceeds Standard Delivery Threshold, no charge",E(d,s,t)):(i="Basket does not meet Standard Delivery Threshold, delivery product added",x(d,s,t))):(E(d,s,t),I>=v?(i="Basket Exceeds Out Of Route Threshold, no charge",E(d,c,t)):(i="Basket does not meet Out Of Route Threshold, delivery product added",x(d,c,t))),t.orderChanged?(o.updateDeviceData={Order:!0,OrderItem:!0},o.reprice=t.reprice):(o.updateDeviceData=!1,o.reprice=!1),T?o.error=i+`

Invalid Delivery Date:
${u.EndDate}`:o.message=i+`

New Delivery Date:
${u.EndDate}`;function M(e){e.ProductCode=="000000019000000031"?(D=e.Id,g=e["MOV_"+f+"__c"]):e.ProductCode=="000000019000000034"&&(P=e.Id,v=e["MOV_"+f+"__c"])}function N(e){e.Pricebook2Id==u.Pricebook2Id&&(e.Product2Id==D?s=e:e.Product2Id==P&&(c=e))}function Q(e){e.TotalPrice&&!(D&&e.PricebookEntryId==s.Id||P&&e.PricebookEntryId==c.Id)&&(I+=e.TotalPrice)}function m(e){return new Date(e.setDate(e.getDate()+1))}function O(e){return dateString=e.toISOString().substring(0,10),Object.keys(W).includes(dateString)?!W[dateString].some(l=>["All",R.Name].includes(l)):!0}function x(e,l,y){let a;for(let h in e)if(e[h].PricebookEntryId==l.Id){a=h;break}a?e[a].Quantity!=1&&(e[a].Quantity=1,y.orderChanged=!0):(e.push({PricebookEntryId:l.Id,Quantity:1}),y.orderChanged=!0,y.reprice=!0)}function E(e,l,y){let a;for(let h in e)if(e[h].PricebookEntryId==l.Id){a=h;break}a&&(e.splice(a,1),y.orderChanged=!0)}return S}
