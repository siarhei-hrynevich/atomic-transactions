import { Task, ExecutionStatus } from "../types"
import { executeTransactions } from "../transactions"


describe('executeTransactions', () => {
  const SUCCESSFUL_TRANSACTIONS_AMOUNT = 4
  
  beforeEach(() => {
    jest.resetAllMocks()
  })
  
  describe('successful transactions', () => {
    
    const successfulTransactions: Task<{}>[] = [...Array(SUCCESSFUL_TRANSACTIONS_AMOUNT)].map(_ => ({
      execute: jest.fn(),
      rollback: jest.fn()
    }))

    it('have to call only execution functions', async () => {

      await executeTransactions(successfulTransactions)
  
      successfulTransactions.forEach(t => {
        expect(t.execute).toBeCalledTimes(1)
      })
      successfulTransactions.forEach(t => {
        expect(t.rollback).toBeCalledTimes(0)
      })
    })
  
    it('have to return SUCCESS status', async () => {
      const result = await executeTransactions(successfulTransactions)
  
      expect(result.status).toBe(ExecutionStatus.SUCCESS)
    })
  })
  
  describe('failed transactions', () => {
    const failedTransactions: Task<{}>[] = [
      ...[...Array(SUCCESSFUL_TRANSACTIONS_AMOUNT)].map(_ => ({
        execute: jest.fn(),
        rollback: jest.fn()
      })),
      {
        execute: () => { throw new Error() },
        rollback: jest.fn(),
      },
      ...[...Array(SUCCESSFUL_TRANSACTIONS_AMOUNT)].map(_ => ({
        execute: jest.fn(),
        rollback: jest.fn()
      })),
    ]

    it('have to call correct execute / rollback functions', async () => {
      await executeTransactions(failedTransactions)

      failedTransactions.slice(0, SUCCESSFUL_TRANSACTIONS_AMOUNT).forEach(t => {
        expect(t.execute).toBeCalledTimes(1)
        expect(t.rollback).toBeCalledTimes(1)
      })
      failedTransactions.slice(SUCCESSFUL_TRANSACTIONS_AMOUNT + 1, failedTransactions.length).forEach(t => {
        expect(t.execute).toBeCalledTimes(0)
        expect(t.rollback).toBeCalledTimes(0)
      })
    })

    it('have to return ERROR status', async () => {
      const result = await executeTransactions(failedTransactions)
  
      expect(result.status).toBe(ExecutionStatus.ERROR)
    })
  })
})
