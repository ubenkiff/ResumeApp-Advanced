
class CircuitBreaker {
  constructor(name, failureThreshold = 3, resetTimeout = 30000) {
    this.name = name;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.nextAttempt = Date.now();
  }

  async call(fn, fallbackFn) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker:${this.name}] Testing connection (HALF_OPEN)`);
      } else {
        console.log(`[CircuitBreaker:${this.name}] Circuit is OPEN - using fallback`);
        return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn;
    }
  }

  onSuccess() {
    if (this.state !== 'CLOSED') {
      console.log(`[CircuitBreaker:${this.name}] Success! Closing circuit.`);
    }
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure(error) {
    this.failures++;
    console.warn(`[CircuitBreaker:${this.name}] Failure ${this.failures}/${this.failureThreshold}: ${error.message}`);
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`[CircuitBreaker:${this.name}] Threshold reached. Opening circuit for ${this.resetTimeout / 1000}s`);
    }
  }
}

export default CircuitBreaker;
