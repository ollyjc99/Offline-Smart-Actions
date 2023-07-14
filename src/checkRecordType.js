// @author: Oliver Carter 14.07.23
function runAction(payload) {
    const {data :{related: {Account : [{RecordTypeId}]}}, data} = payload;
    if (
        // RecordType Developer Names cannot be accessed via payload so have hard-coded Ids for each environment
        // Checks for if the RecordType Id is equal to Medical Professionals or Pharmacies
        RecordTypeId === '0125I000000HZk6QAG' ||  // Production
        RecordTypeId === '0125I000000HZk6QAG' ||   // Pre
        RecordTypeId === 'TBD' ||   // Partial
        RecordTypeId === 'TBD'     // Dev
        ){
            // Cannot create Order for Account with Record Type: Legal Entity'
            data.error = 'Não é possível criar Pedido para Conta com Tipo: Pessoa Jurídica ❌';
            data.blockExecution = true;
        } else {
            // Account Record Type Valid
            data.message = `Tipo de conta válido ✔️`;
            data.blockExecution = false;
        }
    return payload;
}