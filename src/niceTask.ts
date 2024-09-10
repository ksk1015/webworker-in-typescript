type NiceTaskParams = {
  name: string
  age: 20
}

type NiceTaskResult = string

type CallMessage = {
  id: string
  params: NiceTaskParams
}

type ResultMessage = {
  id: string
  result: NiceTaskResult
}

export const niceTask = ({ name, age }: NiceTaskParams): NiceTaskResult => {
  return `I'm ${name} and ${age} years old`
}

export const registerNiceTask = () => {
  self.addEventListener('message', (e: MessageEvent<CallMessage>) => {
    const { id, params } = e.data
    const result = niceTask(params)
    const resultMessage: ResultMessage = { id, result }
    self.postMessage(resultMessage)
  })
}

export const getNiceTaskCaller = (worker: Worker) => {
  return async (params: NiceTaskParams) => {
    return new Promise<NiceTaskResult>((resolve) => {
      const id = Math.random().toString(36) + performance.now().toString(36)
      const handleMessage = (e: MessageEvent<ResultMessage>) => {
        if (e.data.id === id) {
          resolve(e.data.result)
          worker.removeEventListener('message', handleMessage)
        }
      }
      worker.addEventListener('message', handleMessage)
      const callMessage: CallMessage = { id, params }
      worker.postMessage(callMessage)
    })
  }
}
