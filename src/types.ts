
export type TaskResult<ValueType> = Promise<ValueType> | Promise<ValueType> | ValueType | void
export type Context<ValueType> = ValueType

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
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
