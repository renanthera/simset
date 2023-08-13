class RequestValidation {
  private key: string;
  // private keyfile: string;

  constructor() {
    // TODO: load from persistent keyfile
    this.key = 'asdf'
  }

  validateRequest(req: FastifyRequest) {
    const { authorization } = req.headers
    if (authorization === this.key) {
      return true
    }
    return false
  }

  updateKey(new_key: string) {
    // TODO: update keyfile
    this.key = new_key
    return true
  }
}

export default new RequestValidation()
