function runAction(a){const{data:{related:{Product2:i,OrderItem:m,aforza__Relationship_Rule__c:c}},data:r}=a,o=new Map,s=new Map,_=new Set,n=m.filter(e=>e.aforza__Type__c=="BOM");if(!n)return r.message="Bestellung best{u00E4}tigt {u2713}",a;const d=new Set(n.map(e=>e.Product2Id));c.filter(e=>d.has(e.aforza__Target_Product__c)),c.forEach(e=>{_.add(e.aforza__Source_Product__c)}),i.forEach(e=>{(_.has(e.Id)||d.has(e.Id))&&s.set(e.Id,e)}),c.forEach(e=>{let t=s.get(e.aforza__Source_Product__c),f=s.get(e.aforza__Target_Product__c);o.has(t.Name)?o.get(t.Name).push(" "+f.Name):o.set(t.Name,[" "+f.Name])});const u=new Map;for(const[e,t]of o)t.length&&u.set(e,t);if(u){r.blockExecution=!0,r.error=`There are duplicate products in BOMs:
`;for(const[e,t]of u)r.error+=` - ${e}:${t}
  `}else r.message="BOMs best{u00E4}tigt {u2713}";return a}
