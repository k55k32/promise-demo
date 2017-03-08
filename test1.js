const DPromise = require('./index');

DPromise.all(null).catch(reason => console.log(`null catch ${reason}`))

DPromise.all([
  'hello',
  new DPromise(resolve => setTimeout(resolve, 1000, '1000 timeout')),
  new DPromise(resolve => setTimeout(resolve, 500, '500 timeout'))
])
.then(data => console.log(`all then data ${data}`))
.catch(error => {
  console.log(`all then error ${error}`)
})

DPromise.race([
  new DPromise(resolve => setTimeout(resolve, 1000, '1000 timeout')),
  new DPromise(resolve => setTimeout(resolve, 500, '500 timeout')),
  new DPromise(resolve => setTimeout(resolve, 800, '800 timeout')),
  new DPromise((resolve, reject) => setTimeout(reject, 400, '400 error timeout')),
]).then(data => {
  console.log(`race then data ${data}`)
}, reason => {
  console.log(`race catch reason ${reason}`)
})

DPromise.reject(new DPromise(resolve => setTimeout(resolve, 800, '800 timeout')))
.catch(e => {console.log(`reject e ${e.then(data => {console.log(`reject e child ${data}`)})}`)})

DPromise.resolve(new DPromise((resolve, reject) => {
  setTimeout(reject, 0, 'static test')
})).then(data => {
  console.log(data)
}, reason => {
  console.log(`reason ${reason}`)
})
