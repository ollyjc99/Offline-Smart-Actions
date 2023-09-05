// @author: Oliver Carter
function runAction(payload) {
    const {data :{record}, data} = payload;

    if (
        record.Type == 'Product Order' &&
        record.TotalAmount < 2500                                                                                                     
    ){                                                                                           
        data.error = `Order Amount Under $2500 threshold by \{u0024}${Math.round((2500 - record.TotalAmount) * 100) / 100}`;
    } else {
        data.message = `Order Amount validated \{u2713}`;
    }
    return payload;
}