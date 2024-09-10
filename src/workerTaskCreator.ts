const registeredTasks: string[] = []

/**
 * 引数のtaskをworker内で登録する関数とそれを呼び出す関数を返す
 */
export function workerTaskCreator<T, U>(
  taskname: string,
  task: ((params: T) => U) | ((params: T) => Promise<U>)
) {
  /**
   * worker内でtaskを登録する関数
   */
  const registerTask = () => {
    if (registeredTasks.includes(taskname)) {
      throw new Error(`task '${taskname}' is already registered.`)
    }
    registeredTasks.push(taskname)
    self.addEventListener(
      'message',
      async (e: MessageEvent<{ taskname: string; id: string; params: T }>) => {
        if (e.data.taskname !== taskname) return
        const { id, params } = e.data
        const result = await task(params)
        self.postMessage({ id, result })
      }
    )
  }

  /**
   * workerのtaskを呼び出す関数を返す
   */
  const getTaskCaller = (worker: Worker) => {
    return (params: T extends void ? void : T) => {
      return new Promise<U>((resolve) => {
        const id = Math.random().toString(36) + performance.now().toString(36)
        worker.postMessage({ taskname, id, params })
        const handle = (e: MessageEvent<{ id: string; result: U }>) => {
          if (e.data.id === id) {
            resolve(e.data.result)
            self.removeEventListener('message', handle)
          }
        }
        worker.addEventListener('message', handle)
      })
    }
  }

  return { registerTask, getTaskCaller }
}
