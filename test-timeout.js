const DPromise = require('./index')

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
