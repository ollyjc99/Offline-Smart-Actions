function runAction(e){const{data:{record:a,related:{Account:[o],Product2:l,OrderItem:u,aforza__Outlet_Asset__c:I}},data:d}=e;if(a.Type!=="Muster"||o.RecordTypeId!=="0123L000000RQhQQAW"||!new Set(["DE","AT"]).has(o.AW_Country))return e;let n=!1;const s=new Set(u.map(t=>t.Product2Id)),i=new Map,_=new Map;l.forEach(t=>{s.has(t.Id)&&i.set(t.Id,t)}),I.forEach(t=>{t.aforza__Account__c===a.AccountId&&s.has(t.aforza__Product__c)&&_.set(t.aforza__Product__c,t)}),u.forEach(h),n&&(d.updateDeviceData={OrderItem:!0},d.reprice=!0,e.data.message="The quantities of some products have been adjusted to comply with yearly limits.");function h(t){const f=i.get(t.Product2Id)["AW_Doctor_"+o.AW_Country];let r=_.get(t.Product2Id).AW_Yearly_Quantity,y=t.Quantity;if(r+y>f){let c=f-r;c<0&&(c=0),t.Quantity=c,r+=c,n=!0}else r+=y}return e}