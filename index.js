const isFunction = (v) => {
  return typeof v === 'function'
}
const PENDING = 'pending'
const FULEILLED = 'fulfilled'
const REJECTED = 'rejected'

const SYMBOL_STATUS = Symbol('status')
const SYMBOL_DATA = Symbol('data')
const SYMBOL_FULFILLED_CALLBACK = Symbol('fulfilledCallback')
const SYMBOL_REJECTED_CALLBACK = Symbol('rejectedCallback')
const SYMBOL_RESOLVE_VALUE = Symbol('resolveValue')

class DPromise {
  constructor(executor) {
    if (!isFunction(executor)) {
      throw Error(`DPromise executor ${executor} is not function`)
    }

    const status = this[SYMBOL_STATUS] = PENDING // 初始化状态为 pending
    this[SYMBOL_FULFILLED_CALLBACK] = undefined
    this[SYMBOL_REJECTED_CALLBACK] = undefined
    this[SYMBOL_DATA] = undefined

    const self = this

    function resovle(value) {
      if (self[SYMBOL_STATUS] === PENDING) {
        const fulfilledCallback = self[SYMBOL_FULFILLED_CALLBACK]
        self[SYMBOL_STATUS] = FULEILLED
        self[SYMBOL_DATA] = value
        if (isFunction(fulfilledCallback)) {
          setTimeout(() => {
            fulfilledCallback(value)
          })
        }
      }
    }

    function reject(reason) {
      if (self[SYMBOL_STATUS] === PENDING) {
        const rejectedCallback = self[SYMBOL_REJECTED_CALLBACK]
        self[SYMBOL_STATUS] = REJECTED  // 状态转换
        self[SYMBOL_DATA] = reason  // 保存失败理由

        if (isFunction(rejectedCallback)) {
          setTimeout(() => {  // 不阻塞主流程，在下一个事件轮询中再调用rejected回调函数
            rejectedCallback(reason)
          })
        }
      }
    }

    try{
      executor(resovle, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    const status = this[SYMBOL_STATUS]
    const data = this[SYMBOL_DATA]
    const resolveValue = this[SYMBOL_RESOLVE_VALUE] = (value, resolve, reject) => {
      if (value instanceof DPromise) {
        value.then(resolve, reject)
      } else {
        resolve(value)
      }
    }
    const fulfilledCallback = isFunction(onFulfilled) ? onFulfilled : value => value
    const rejectedCallback = isFunction(onRejected) ? onRejected : value => value

    const fulfilledExecutor = (value, resolve, reject) => {
      try{
        const newValue = fulfilledCallback(value)
        resolveValue(newValue, resolve, reject)
      } catch (e) {
        reject(e)
      }
    }

    const rejectedExecutor = (reason, resolve, reject) => {
      try{
        const newReason = rejectedCallback(reason)
        resolveValue(newReason, resolve, reject)
      } catch (e) {
        reject(e)
      }
    }

    if (status === PENDING) {
      return new DPromise((resolve, reject) => {
        this[SYMBOL_FULFILLED_CALLBACK] = value => fulfilledExecutor(value, resolve, reject)
        this[SYMBOL_REJECTED_CALLBACK] = reason => rejectedExecutor(reason, resolve, reject)
      })
    }

    if (status === FULEILLED) {
      return new DPromise((resolve, reject) => {
        setTimeout(() => {
          fulfilledExecutor(data, resolve, reject)
        })
      })
    }

    if (status === REJECTED) {
      return new DPromise((resolve, reject) => {
        setTimeout(() => {
          rejectedExecutor(data, resolve, reject)
        })
      })
    }
  }
  catch(onRejected) {
    this.then(null, onRejected)
  }
  static resolve(data) {
    if (data instanceof DPromise) {
      return data
    }
    return new DPromise(resolve => {
      resolve(data)
    })
  }
  static reject(reason) {
    return new DPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static race(values) {
    if (!values || !values[Symbol.iterator]) {
      return DPromise.reject(new Error(`DPromise all param must can be iterator`))
    }
    return new DPromise((resolve, reject) => {
      for (let i in values) {
        DPromise.resolve(values[i]).then(data => {
          resolve(data)
        }, reason => {
          reject(reason)
        })
      }
    })
  }

  static all(values) {
    if (!values || !values[Symbol.iterator]) {
      return DPromise.reject(new Error(`DPromise all param must can be iterator`))
    }
    return new DPromise((resolve, reject) => {
      let result = []
      let index = 0
      let countValues = values.length
      function doResolve(index, value) {
        DPromise.resolve(value).then(data => {
          values[index] = data
          countValues--
          if (countValues === 0) {
            resolve(values)
          }
        }, reason => {
          reject(reason)
        })
      }
      for (let i in values) {
        doResolve(index++, values[i])
      }
    })
  }
}



new DPromise((resolve, reject) => {
  console.log(1)
  resolve(2)
  console.log(3)
}).then(data => {
  console.log(data)
})
setTimeout(console.log, 0, 0)

setTimeout(() => {
  console.log('next timeout ')
  new Promise((resolve, reject) => {
    console.log(1)
    resolve(2)
    console.log(3)
  }).then(data => {
    console.log(data)
  })
  setTimeout(console.log, 0, 0)
}, 100)

setTimeout(() => {
  console.log('next timeout ')
  setTimeout(console.log, 0, 0)
  new Promise((resolve, reject) => {
    console.log(1)
    resolve(2)
    console.log(3)
  }).then(data => {
    console.log(data)
  })
}, 200)

module.exports = DPromise
