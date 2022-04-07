
export type TaskResult<ValueType> = Promise<ValueType> | ValueType | undefined
export type Context<ValueType> = ValueType | Object

export interface Task<ContextType> {
  name?: string
  execute: (context: Context<ContextType>) => TaskResult<ContextType>
  rollback: (context: Context<ContextType>) => TaskResult<ContextType>
}

export interface TransactionOptions {
  rollbackLastTransaction?: boolean
}

export interface ExecutionResult<ContextType> {
  context: Context<ContextType>
  status: ExecutionStatus
}

export enum ExecutionStatus {
  SUCCESS,
  ERROR,
}
