function runAction(payload) {
    const { data } = payload;
    data.message = 'Hello World';
    return payload;
  }