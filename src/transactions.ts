import { 
  Context, 
  Task, 
  TransactionOptions,
  ExecutionResult,
  ExecutionStatus,
} from "./types"

async function rollbackTransactions<ContextType>(
    transactions: Task<ContextType>[], 
    context: Context<ContextType>
  ) {
  const reversedTransactions = transactions.reverse()
  for (const transaction of reversedTransactions) {    
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
  let context: Context<ContextType> = initialContext
  
  for (const transaction of transactions) {
    try {
      context = await transaction.execute(context) as Context<ContextType> ?? context
      executedTransactions.push(transaction)
    } catch(e) {
      options.rollbackLastTransaction ?? executedTransactions.push(transaction)
      await rollbackTransactions(executedTransactions, context)
      break
    }
  }
  
  const status: ExecutionStatus = 
    executedTransactions.length === transactions.length 
      ?
    ExecutionStatus.SUCCESS : ExecutionStatus.ERROR
  return {
    context,
    status
  }
}
