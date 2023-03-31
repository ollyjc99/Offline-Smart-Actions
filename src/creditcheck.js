function runAction(payload) {
  try {
    const { record: {TotalAmount}, related : {Account :{aforza__Credit_Amount__c : CreditLimit}} } = payload.data;

    if (CreditLimit === null || CreditLimit === undefined) {
      throw new Error("✗ No credit limit available");
    }
    if (TotalAmount === null || TotalAmount === undefined) {
      throw new Error("✗ No order total available");
    }
    if (TotalAmount > CreditLimit) {
      throw new Error(
        `✗ Order total ${TotalAmount} exceeds credit limit of ${CreditLimit}`
      );
    }
    payload.data.message = `✓ Order total ${TotalAmount} is within credit limit of ${CreditLimit}`;
  } catch (error) {
    payload.data.error = error?.message;
  }

  return payload;
}