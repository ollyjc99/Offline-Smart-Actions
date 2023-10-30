function runAction(n){const{data:{related:{Product2:c,OrderItem:s}},data:t}=n,d=new Set(s.map(e=>e.Product2Id)),r=new Map([["Restricted",[]],["Unrestricted",[]]]);if(c.forEach(e=>{d.has(e.Id)&&!new Set(["Tax","Promotion","Discount"]).has(e.Name)&&r.get(e.AW_Is_Restricted_Drug__c?"Restricted":"Unrestricted").push(e)}),r.get("Restricted").length>0&&r.get("Unrestricted").length>0){t.error=`You have mixed Restricted and Unrestricted Products \u274C
`,t.blockExecution=!0;for(const e of r.keys())t.error+=`
${e} products:
`,r.get(e).forEach(o=>{t.error+=`
 \u2022 ${o.Name}`}),t.error+=`
`}else t.message="Bestellung best\xE4tigt \u2713";return n}
