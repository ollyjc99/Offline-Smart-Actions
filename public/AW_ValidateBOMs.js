function runAction(a){const{data:{related:{Product2:i,OrderItem:m,aforza__Relationship_Rule__c:c}},data:r}=a,o=new Map,s=new Map,d=new Set,n=m.filter(e=>e.aforza__Type__c=="BOM");if(!n)return a;const u=new Set(n.map(e=>e.Product2Id));c.filter(e=>u.has(e.aforza__Target_Product__c)),c.forEach(e=>{d.add(e.aforza__Source_Product__c)}),i.forEach(e=>{(d.has(e.Id)||u.has(e.Id))&&s.set(e.Id,e)}),c.forEach(e=>{let t=s.get(e.aforza__Source_Product__c),f=s.get(e.aforza__Target_Product__c);o.has(t.Name)?o.get(t.Name).push(" "+f.Name):o.set(t.Name,[" "+f.Name])});const _=new Map;for(const[e,t]of o)t.length&&_.set(e,t);if(_){r.blockExecution=!0,r.error=`There are duplicate products in BOMs:
`;for(const[e,t]of _)r.error+=` - ${e}:${t}
  `}else r.message="BOMs Valid";return a}
