function runAction(S){const{data:{record:{Pricebook2Id:x},record:f,related:{Account:[A],OrderItem:a,Product2:B,PricebookEntry:M,aforza__Inventory__c:[b]}},data:n}=S;let y,u,h,_,s,P;const k={"2023-04-18":["All"],"2023-04-07":["All"],"2023-12-25":["All"],"2023-12-08":["All"],"2023-12-01":["All"],"2023-11-01":["All"],"2023-10-05":["All"],"2023-08-15":["All"],"2023-06-10":["All"],"2023-06-08":["All"],"2023-04-25":["All","Warehouse - Alcains"],"2023-05-01":["All"],"2023-10-22":["Warehouse - Gr\xE2ndola"],"2023-05-22":["Warehouse - Leiria"],"2023-06-13":["Warehouse - Camarate"],"2023-05-23":["Warehouse - Portalegre"],"2023-06-24":["Warehouse - Porto"],"2023-06-29":["Warehouse - Set\xFAbal","Warehouse - \xC9vora","Warehouse - Bombarral"],"2023-09-03":["Warehouse - Algoz"],"2023-05-18":["Warehouse - Beja"],"2023-07-04":["Warehouse - Coimbra"],"2023-09-07":["Warehouse - Faro"]};let O=0,i={orderChanged:!1,reprice:!1},l,d=A.Customer_Segment__c;(!d||d=="99")&&(d="06"),B.forEach(Q),M.forEach(R),y&&!u&&(u=0),_&&!s&&(s=0),a.forEach(w);let r,I,o,T,W=f.EndDate,v=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],D=A.Delivery_Day__c.split(";");if(W)r=new Date(W),o=v[r.getDay()],E(r)&&D.includes(o)||(T=!0);else{for(r=m(new Date),o=v[r.getDay()],I=E(r)&&D.includes(o);!I;)r=m(r),o=v[r.getDay()],I=E(r)&&D.includes(o);f.EndDate=r.toISOString().substring(0,10)}var V=D.includes(o)||["PT16","PT17","PT25"].includes(A.Typology__c);V?(g(P),O>=u?(l="Basket Exceeds Standard Delivery Threshold, no charge",g(h)):(l="Basket does not meet Standard Delivery Threshold, delivery product added",C(h))):(g(h),O>=s?(l="Basket Exceeds Out Of Route Threshold, no charge",g(P)):(l="Basket does not meet Out Of Route Threshold, delivery product added",C(P))),i.orderChanged?(n.updateDeviceData={Order:!0,OrderItem:!0},n.reprice=i.reprice):(n.updateDeviceData=!1,n.reprice=!1),T?n.error=l+`

Delivery date on holiday: ${f.EndDate}`:n.message=l+`

Delivery Date: ${f.EndDate}`;function Q(e){e.ProductCode=="000000019000000031"?(y=e.Id,u=e["MOV_"+d+"__c"]):e.ProductCode=="000000019000000034"&&(_=e.Id,s=e["MOV_"+d+"__c"])}function R(e){e.Pricebook2Id==x&&(e.Product2Id==y?(h=e,e["MOV_"+d+"__c"]&&(u=e["MOV_"+d+"__c"])):e.Product2Id==_&&(P=e,e["MOV_"+d+"__c"]&&(s=e["MOV_"+d+"__c"])))}function w(e){e.Quantity&&e.UnitPrice&&!(e.Product2Id==y||e.Product2Id==_)&&(O+=e.UnitPrice*e.Quantity)}function m(e){return new Date(e.setDate(e.getDate()+1))}function E(e){return dateString=e.toISOString().substring(0,10),Object.keys(k).includes(dateString)?!k[dateString].some(t=>["All",b.Name].includes(t)):!0}function C(e){let t;for(let c in a)if(a[c].PricebookEntryId==e.Id){t=c;break}t?a[t].Quantity!=1&&(a[t].Quantity=1,i.orderChanged=!0):(a.push({Product2Id:e.Product2Id,PricebookEntryId:e.Id,Quantity:1,UnitPrice:0,aforza__Type__c:"Product"}),i.orderChanged=!0,i.reprice=!0)}function g(e){let t;for(let c in a)if(a[c].PricebookEntryId==e.Id){t=c;break}t&&(a.splice(t,1),i.orderChanged=!0)}return S}
