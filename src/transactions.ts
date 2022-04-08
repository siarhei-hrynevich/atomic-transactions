import { 
  Context, 
  Task, 
  TransactionOptions,
  ExecutionResult,
  ExecutionStatus,
  ExecutionInfo,
} from "./types"

async function rollbackTransactions<ContextType>(
    transactions: Task<ContextType>[], 
    context: Context<ContextType>
  ) {
  for (const transaction of transactions.reverse()) {    
    if (typeof transaction.rollback === 'function') {
      context = await transaction.rollback(context) as Context<ContextType> ?? context
    }
  }
}

export async function executeTransactions<ContextType>(
    transactions: Task<ContextType>[],
    initialContext: Context<ContextType> = {} as Context<ContextType>,
    options: TransactionOptions = {}
  ): Promise<ExecutionResult<ContextType>> {

  const executedTransactions: Task<ContextType>[] = []
  const info: ExecutionInfo<ContextType> = {
    status: ExecutionStatus.SUCCESS,
    lastExecutedTask: null
  }
  let context: Context<ContextType> = initialContext

  for (const transaction of transactions) {
    try {
      info.lastExecutedTask = transaction
      context = await transaction.execute(context) as Context<ContextType> ?? context
      executedTransactions.push(transaction)
    } catch(e) {
      info.error = e
      info.status = ExecutionStatus.FAILED

      options.rollbackLastTransaction && executedTransactions.push(transaction)
      await rollbackTransactions(executedTransactions, context)
      break
    }
  }
  
  return {
    context,
    info,
  }
}
