import { Context, Task, TransactionOptions, ExecutionResult } from "./types"

async function rollbackTransactions<ContextType>(
    transactions: Task<ContextType>[], 
    context: Context<ContextType>
  ) {
  transactions
    .reverse()
    .forEach(async (transaction) => {
      if (typeof transaction.rollback === 'function') {
        context = await transaction.rollback(context) ?? context
      }
    })
} 

export async function executeTransactions<ContextType>(
    transactions: Task<ContextType>[],
    initialContext: Context<ContextType> = {},
    options: TransactionOptions = {}
  ): Promise<ExecutionResult<ContextType>> {

  const executedTransactions = []
  let context: Context<ContextType> = initialContext
  for (let transaction of transactions) {
    try {
      context = await transaction.execute(context) ?? context
      executedTransactions.push(transaction)
    } catch(e) {
      options.rollbackLastTransaction ?? executedTransactions.push(transaction)
      rollbackTransactions(executedTransactions, context)
      return
    }
  }
  return {
    context
  }
}
