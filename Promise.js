const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function isFunction(fn) {
    return typeof fn === 'function'
}

class Promise {
    constructor(executor) {
        this.status = PENDING
        this.data = null
        this.fulfilledCallback = undefined
        this.rejectedCallback = undefined
        const self = this

        function resolve(value) {
            if (this.status === PENDING) {
                this.status = FULFILLED
                this.data = value
                if (typeof this.fulfilledCallback === 'function') {
                    setTimeout(_ => this.fulfilledCallback(value))
                }
            }
        }

        function reject(reason) {
            if (this.status === PENDING) {
                this.status = REJECTED
                this.data = reason
                if (typeof this.rejectedCallback === 'function') {
                    setTimeout(_ => this.rejectedCallback(reason))
                }
            }
        }
        executor(resolve.bind(this), reject.bind(this))
    }

    then(onFulfilled, onRejected) {
        onRejected = isFunction(onRejected) ? onRejected : reason => reason
        if (this.status === PENDING) {
            return new Promise((resolve, reject) => {
                this.fulfilledCallback = value => {
                    resolve(onFulfilled(value))
                }
                this.rejectedCallback = reason => {
                    reject(onRejected(reason))
                }
            })
        }

        if (this.status === FULEILLED) {
            const value = this.data
            return new Promise((resolve, reject) => {
                setTimeout(_ => resolve(onFulfilled(value)))
            })
        }

        if (this.status === REJECTED) {
            const reason = this.data
            return new Promise((resolve, reject) => {
                setTimeout(_ => reject(onRejected(reason)))
            })
        }
    }
}


let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('reject')
    }, 3000)
}).then(data => {
    console.log(data)
    return data
}, reason => {
    console.log(`reject ${reason}`)
}).then(data2 => {
    console.log(`data2 ${data2}`)
})
