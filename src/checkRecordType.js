function runAction(payload) {
    const {data :{related: {Account : [{RecordTypeId}]}}, data} = payload;

    if (RecordTypeId != '0125I000000HZk7QAG'){
        data.error = 'Não é possível criar Pedido para Conta com Tipo ❌';
        data.blockExecution = true;
    }
    else {
        // Account Record Type Valid
        data.message = `Tipo de conta válido ✔️`;
        data.blockExecution = false;
    }
    return payload;
}