class WorkerStatus {
  constructor() {
    this.status = 'default'
  }

  updateStatus( msg: string ) {
    this.status = msg
  }

  getStatus() {
    return this.status
  }

}

export const worker = new WorkerStatus()
