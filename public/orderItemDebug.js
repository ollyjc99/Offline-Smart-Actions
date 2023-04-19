function runAction(t){const{related:{OrderItem:n,Product2:s}}=t.data;t.data.message="",n.forEach(r);const a=n.map(e=>e.Product2Id);function r(e){t.data.message+=`Pro: ${e.Product2Id}
`,t.data.message+=`Type: ${e.aforza__Type__c}
`,t.data.message+=`Qty: ${e.Quantity}
`,t.data.message+=`$: ${e.UnitPrice*e.Quantity}

`}return t}
