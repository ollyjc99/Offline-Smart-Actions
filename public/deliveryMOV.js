function runAction(T){const{data:{record:{Pricebook2Id:p},record:n,related:{Account:[h],OrderItem:o,Product2:v,PricebookEntry:b,aforza__Inventory__c:[x]}},data:d}=T;let D,_,s,I,m,u;const C={"2023-04-07":["All"],"2023-12-25":["All"],"2023-12-08":["All"],"2023-12-01":["All"],"2023-11-01":["All"],"2023-10-05":["All"],"2023-08-15":["All"],"2023-06-10":["All"],"2023-06-08":["All"],"2023-04-25":["All","Warehouse - Alcains"],"2023-05-01":["All"],"2023-10-22":["Warehouse - Gr\xE2ndola"],"2023-05-22":["Warehouse - Leiria"],"2023-06-13":["Warehouse - Camarate"],"2023-05-23":["Warehouse - Portalegre"],"2023-06-24":["Warehouse - Porto"],"2023-06-29":["Warehouse - Set\xFAbal","Warehouse - \xC9vora","Warehouse - Bombarral"],"2023-09-03":["Warehouse - Algoz"],"2023-05-18":["Warehouse - Beja"],"2023-07-04":["Warehouse - Coimbra"],"2023-09-07":["Warehouse - Faro"]};let E=0,l={orderChanged:!1,reprice:!1},f=h.Customer_Segment__c;(!f||f=="99")&&(f="06"),v.forEach(w),b.forEach(Q),D&&!_&&(_=0),I&&!m&&(m=0),o.forEach(z);let a,i,t,W,O=n.EndDate,y=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],g=h.Delivery_Day__c.split(";");if(O)a=new Date(O),t=y[a.getDay()],(S(a)||["Saturday","Sunday"].includes(t))&&(W=!0);else{for(a=A(new Date),t=y[a.getDay()],i=S(a)||!g.includes(t),i&&g.includes(t)&&(a=A(a),t=y[a.getDay()],i=!1);i;)a=A(a),t=y[a.getDay()],i=S(a)||!g.includes(t),i&&g.includes(t)&&(a=A(a),t=y[a.getDay()],i=!1);n.EndDate=a.toISOString().substring(0,10),l.orderChanged=!0}if(!new Set(["YDEV","YBLC","YDL1"]).has(n.Type)&&n.Type!="YESL"&&!["PT16","PT17","PT25"].includes(h.Typology__c)){var L=g.includes(t)||["PT16","PT17","PT25"].includes(h.Typology__c);L?(n.Shipping_Conditions__c="ZA",c(u),E>=_?(d.message="A cesta excede o limite de entrega padr\xE3o, sem custo",c(s)):(d.message="A cesta n\xE3o atende ao limite de entrega padr\xE3o, produto de entrega adicionado",k(s))):(n.Shipping_Conditions__c="ZD",c(s),E>=m?(d.message="A cesta excede o limite fora da rota, sem custo",c(u)):(d.message="A cesta n\xE3o atende ao limite fora da rota, produto de entrega adicionado",k(u)))}else c(s),c(u),d.message="HELLO";l.orderChanged&&(d.updateDeviceData={Order:!0,OrderItem:!0},d.reprice=!0),W?d.message+=`

Aviso, a data selecionada para entrega \xE9 um feriado ou um fim de semana \u2757`:d.message+=`

Nova data de entrega: ${n.EndDate}`;function w(e){e.ProductCode=="000000019000000031"?D=e.Id:e.ProductCode=="000000019000000034"&&(I=e.Id)}function Q(e){e.Pricebook2Id==p&&(e.Product2Id==D?(s=e,_=e["MOV_"+f+"__c"]):e.Product2Id==I&&(u=e,m=e["MOV_"+f+"__c"]))}function z(e){e.Quantity&&e.UnitPrice&&e.aforza__Type__c!="Tax"&&!(e.PricebookEntryId==s.Id||e.PricebookEntryId==u.Id)&&(E+=e.UnitPrice*e.Quantity)}function A(e){return new Date(e.setDate(e.getDate()+1))}function S(e){return dateString=e.toISOString().substring(0,10),Object.keys(C).includes(dateString)?C[dateString].some(r=>["All",x.Name].includes(r)):!1}function k(e){let r;for(let P in o)if(o[P].PricebookEntryId==e.Id){r=P;break}r?o[r].Quantity!=1&&(o[r].Quantity=1,l.orderChanged=!0):(o.push({Product2Id:e.Product2Id,PricebookEntryId:e.Id,Quantity:1,UnitPrice:0,aforza__Type__c:"Product"}),l.orderChanged=!0,l.reprice=!0)}function c(e){let r;for(let P in o)if(o[P].PricebookEntryId==e.Id){r=P;break}r&&(o.splice(r,1),l.orderChanged=!0)}return T}
