function runAction(t){const{data:{record:{Pricebook2Id:z,AccountId:Q,aforza__Inventory__c:j},related:{Account:[W],OrderItem:d,Product2:b,PricebookEntry:T,aforza__Inventory__c:[C]},record:D},data:F}=t;let f,h,i,y,P,s,m=!1,x=!1;const k={"2023-04-07":["All"],"2023-12-25":["All"],"2023-12-08":["All"],"2023-12-01":["All"],"2023-11-01":["All"],"2023-10-05":["All"],"2023-08-15":["All"],"2023-06-10":["All"],"2023-06-08":["All"],"2023-04-25":["All","Warehouse - Alcains"],"2023-05-01":["All"],"2023-10-22":["Warehouse - Gr\xE2ndola"],"2023-05-22":["Warehouse - Leiria"],"2023-06-13":["Warehouse - Camarate"],"2023-05-23":["Warehouse - Portalegre"],"2023-06-24":["Warehouse - Porto"],"2023-06-29":["Warehouse - Set\xFAbal","Warehouse - \xC9vora","Warehouse - Bombarral"],"2023-09-03":["Warehouse - Algoz"],"2023-05-18":["Warehouse - Beja"],"2023-07-04":["Warehouse - Coimbra"],"2023-09-07":["Warehouse - Faro"]};let I=0,a={orderChanged:!1,reprice:!1},H,u=W.Customer_Segment__c;(!u||u=="99")&&(u="06"),b.forEach(R),f&&!h&&(h=0),y&&!P&&(P=0),T.forEach(M),d.forEach(w);let v,o=D.EndDate;for(o||(o=_(new Date)),v=E(o);v;)o=_(O),v=E(o);let O=new Date(o),g=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][O.getDay()];(g=="Sunday"||g=="Saturday")&&(g="Monday");var B=["Tuesday","Thursday"].includes(g);B?(A(d,s,a),I>=h?(t.data.message="Basket Exceeds Standard Delivery Threshold, no charge",A(d,i,a)):(t.data.message="Basket does not meet Standard Delivery Threshold, delivery product added",S(d,i,a))):(A(d,i,a),I>=P?(t.data.message="Basket Exceeds Out Of Route Threshold, no charge",A(d,s,a)):(t.data.message="Basket does not meet Out Of Route Threshold, delivery product added",S(d,s,a))),a.orderChanged?(t.data.updateDeviceData={Order:!0,OrderItem:!0},t.data.reprice=a.reprice):(t.data.updateDeviceData=!1,t.data.reprice=!1);function R(e){e.ProductCode=="000000019000000031"?(f=e.Id,h=e["MOV_"+u+"__c"]):e.ProductCode=="000000019000000034"&&(y=e.Id,P=e["MOV_"+u+"__c"])}function M(e){e.Pricebook2Id==D.Pricebook2Id&&(e.Product2Id==f?i=e:e.Product2Id==y&&(s=e))}function w(e){f&&e.PricebookEntryId==i.Id?m=!0:y&&e.PricebookEntryId==s.Id?x=!0:e.TotalPrice&&(I+=e.TotalPrice)}function _(e){return e.setDate(e.getDate()+1),e.toISOString().substring(0,10)}function E(e){if(Object.keys(k).includes(e))return k[e].every(n=>["All",C.Name].includes(n))}function S(e,n,l){let r;for(let c in e)if(e[c].PricebookEntryId==n.Id){r=c;break}r?e[r].Quantity!=1&&(e[r].Quantity=1,l.orderChanged=!0):(e.push({PricebookEntryId:n.Id,Quantity:1}),l.orderChanged=!0,l.reprice=!0)}function A(e,n,l){let r;for(let c in e)if(e[c].PricebookEntryId==n.Id){r=c;break}r&&(e.splice(r,1),l.orderChanged=!0)}return t}
