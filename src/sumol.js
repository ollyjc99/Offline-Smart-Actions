function runAction(payload) {
    const { data : {record : {Payment}} } = payload;
    
    return payload;
  }