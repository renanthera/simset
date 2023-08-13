class WorkerStatus {
  constructor() {
    this.status = 'default'
    this.callbacks = () => {}
  }

  updateStatus( msg: string ) {
    this.status = msg
    this.callbacks()
    // for (const cb of this.callbacks) {
    //   cb()
    // }
  }

  addCallback(cb) {
    this.callbacks = cb
  }

  getStatus() {
    return this.status
  }

}

export const worker = new WorkerStatus()
