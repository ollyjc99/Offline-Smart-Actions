function runAction(o){const{data:{related:{Account:[{RecordTypeId:c}]}},data:e}=o;return c==="0125I000000HZk6QAG"?(e.error="N\xE3o \xE9 poss\xEDvel criar Pedido para Conta com Tipo: Entidade Jur\xEDdica \u274C",e.blockExecution=!0):(e.message="Tipo de conta v\xE1lido \u2714\uFE0F",e.blockExecution=!1),o}