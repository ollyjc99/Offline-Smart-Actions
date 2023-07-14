// @author: Oliver Carter 14.07.23
function runAction(payload) {
    const {data :{related: {Account : [{RecordTypeId}]}}, data} = payload;
    if (
        // RecordType Developer Names cannot be accessed via payload so have hard-coded Ids for each environment
        // Checks for if the RecordType Id is that of Legal Entities
        RecordTypeId === '0125I000000HZk6QAG'  // Production/Pre/Partial
        ){
            // Cannot create Order for Account with Record Type: Legal Entity'
            data.error = 'Não é possível criar Pedido para Conta com Tipo: Entidade Jurídica ❌';
            data.blockExecution = true;
        } else {
            // Account Record Type Valid
            data.message = `Tipo de conta válido ✔️`;
            data.blockExecution = false;
        }
    return payload;
}