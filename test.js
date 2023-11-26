import types from "./index.js"

const {assert, type} = types
assert(type({object: types}), "Errrrrooooorrrrr!")
console.log(types)

const {validate} = types
const list = ["1", 2]
console.log("contains only strings:", list.every(validate("string")))
console.log("contains numbers:", list.every(validate("number")))
