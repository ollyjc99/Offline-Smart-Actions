function runAction(c){const{data:{related:{Product2:d,OrderItem:n}},data:t}=c,s=new Set(n.map(e=>e.Product2Id)),r=new Map([["Restricted",[]],["Unrestricted",[]]]);if(d.forEach(e=>{s.has(e.Id)&&r.get(e.AW_Is_Restricted_Drug__c?"Restricted":"Unrestricted").push(e)}),r.get("Restricted").length>0&&r.get("Unrestricted").length>0){t.error=`You have mixed Restricted and Unrestricted Products:
`,t.blockExecution=!0;for(const e of r.keys())t.error+=`
${e} products:
`,r.get(e).forEach(o=>{t.error+=`
${o.Name}`}),t.error+=`
`}else t.message="Products Validated {u2713}";return c}
