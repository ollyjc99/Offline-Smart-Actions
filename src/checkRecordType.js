function runAction(payload) {
    const {data :{related: {Account : [{RecordTypeId}]}}, data} = payload;

    switch (RecordTypeId){
         // Cannot create Order for Account with Record Type: Legal Entity'
        case '0125I000000HZk6QAG':
            data.error = 'Não é possível criar Pedido para Conta com Tipo: Entidade Jurídica ❌';
            data.blockExecution = true;

         // Cannot create Order for Account with Record Type: Prospect'
        case '0125I000000HZk8QAG':
            data.error = 'Não é possível criar Pedido para Conta com Tipo: Cliente Potencial ❌';
            data.blockExecution = true;

        default:
            // Account Record Type Valid
            data.message = `Tipo de conta válido ✔️`;
            data.blockExecution = false;

    }
    return payload;
}