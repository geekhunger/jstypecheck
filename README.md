# Tiny JavaScript type-checking library

Typechecking in JavaScript is combersome often times. And writing same code over and over again is a pain in the butt too. But with this tiny package, you can define your own types once (and for all), and then check them everywhere in your project!


## Why?

I'm not trying to reinvent the wheel here. Honestly not! But after googling for a while I felt like all other 'wheels' out there, were just equaly croocked as JavaScript itself.😅

Well, [typeok](https://github.com/kevinfiol/typeok) came actually quite close to my liking (which I only realised after I've finished writing this readme). But I still like my approach better in comparison to it because:

- better (and more) build-in typechecks
- typechecks can be nested
- build-in `&&` `||` logic operators (without additional syntax)
- easier to extend by your own types
- override build-in types (same way as you add new ones)
- choose custom *singular* and *plural* names for your types (instead of always having `'s'` suffixes)
- use with `if()` or the additional `assert()` helper (can be used to throw error messages)



<br>

## Getting started

### Install this package from NPM

```bash
npm i type-approve
```




### Include it in your project

```js
const t = require("type-approve") // include like so, then call like t.check({typename: value})
const typecheck = require("type-approve").check // or like so and call typecheck({})
const {add, check, assert} = require("type-approve") // or like so...
const {add: typeadd, check: typecheck, assert} = require("type-approve") // or like so (and rename exported functions)
```




### Check out available types

```js
const types = require("type-approve").add

console.log(types()) // see available typechecks (build-in + your own)
console.log(types("promise")) // get the validation function of type 'promise'

// you can run the returned function with an argument too, if you want...
const isstring = types("string", "that sould resolve to true") // true
console.log(isstring === true) // true
```

***stdout:***
```bash
{
    'nil|nils': [Function: nil],
    'boolean|booleans': [Function: bool],
    'function|functions': [Function: fn],
    'object|objects': [Function: obj],
    'array|arrays': [Function: arr],
    'number|numbers': [Function (anonymous)],
    'integer|integers': [Function (anonymous)],
    'float|floats': [Function (anonymous)],
    'string|strings': [Function (anonymous)],
    'promise|promises': [Function (anonymous)],
    'buffer|buffers': [Function (anonymous)],
    'email|emails': [Function (anonymous)]
}
[Function (anonymous)]
true
```

If you try to access an undefined typecheck, then the return value would be `undefined` (obviously), instead of a validation function. For example:

```js
console.log(typecheck({foobar: "hello world"}))
```
***stdout:*** `Error: Assertion Error: Missing typecheck handler for type 'foobar'!`




<br>

## Type-checking

Good. After you've installed the package and know how to include it into your project, let's take a fresh start and lern how to use it. First, let's require the package, as usual.

```js
// include packackage
const jstypecheck = require("type-approve")
const typeadd = jstypecheck.add
const typecheck = jstypecheck.check
```

### Add custom types

Right out-of-the-box, we already have a good amount of build-in types. - But nobody knows about the 'foobar' type, aren't they? How about adding one?

Adding custom types is very easy! Let's create a new type, called 'foobar'.

```js
typeadd("foobar", function(value) {
    return typeof value === "string" && value.includes("foo")
})
```

That was easy, eh? - Our new custom type 'foobar' will return `true` as long as the value is a text string and only if text contains the word `'foo'` somewhere inside it. Shall we try?


### Use available types

```js
console.log(typecheck({foobar: "Hello world!"})) // false
console.log(typecheck({foobar: "My name is foo-bar, baz."})) // true
```

Great! That worked as expected! But what if you have *many* different values and you want to typecheck *all* of them against 'foobar'?

```js
// Solution #1 is typechecking every value separately:

if(typecheck({foobar: "Hello World"})
&& typecheck({foobar: "My name is foo-bar, baz."})
&& typecheck({fobbar: true}))
{
    console.error("Woooops! Why is this message showing up? It should not because not all of the values are 'foobars'!")
} else {
    console.log("Purrrfect! True, there are values that are NOT 'foobar' in this check. Got em! Easy peasy leamon squeezy!")

```

*Have you noticed* how we compared each of the typechecks with the `&&` (logical `and` operator)? Well, this is actually build into `type-approve`!

```js
// Solution #2 is typechecking all value at once:
// (logical operator '&&' will be applied automatically)

const result = typecheck({
    foobars: [
        "Hello World", // false
        "My name is foo-bar, baz.", // true
        true // false
    ]
})

console.log("result:", result) // (false && true && false) === false

assert(result === false, "Cool! NOT all values are actually 'foobar' in this check. I knew it! Got 'em again! Easy peasy leamon squeezy!") // THIS WILL TRHOW AN ERROR because we intentionally inverted the condition!

console.log("Woooops! Shit happened, somehow!")
```

Worked again! However, *there are two cool things happening here...*

1) We addressed our type by name `'foobars'` (with `'s'` suffix) instead of `'foobar'`, and it still worked! **But How?**
2) We had to use an array to pass all of the values to the check function of type 'foobars'. **But why?**

### A little secret about type definition 🤫

*Every* type has a **singular** and a **plural** representation. When you add a new type with `typeadd()` you have the option of passing the *singular* label - or both (singular *and plural* names) - fallowed by the check function. For example:

`typeadd('foobar', 'foobarez', value => {...})`

Later, you can refer to this type by its singular (one) **or** plural (many) identifier!
- You use singular when you only want to pass *one single value* into the check function.
- You use the plural name when you want to pass *many values* to the same check function.

If you do *not specify a plural* name when defining a type, then the singular + `'s'` becomes the plural name instead! For example, after adding `typeadd('list', value => {...})`, the new type will be known as `'list'` (singular) and `'lists'` (plural).

```js
typecheck({list: ["milk", "bread", "billy boy"]})
typecheck({lists: [
    ["milk", "bread", "billy boy"],
    ["coffee", "pizza", "cigarette"],
]})
```

If you *do* specify both, then after adding `typeadd('truth', 'facts' value => {...})`, the new type will be known as `'truth'` (singular) and `'facts'` (plural).

```js
typecheck({truth: "false"]})
typecheck({facts: ["false, true, 0]})
```


> #### **What's the benefit from this one|many hassle at all?**
> Because it allows checking multiple values for the same type within `typecheck({})` the same call!
>
> Consider this example: `typecheck({string: "hello", string: true})`
> Here, the result will be `false`. But not because of `{string: "hello"}` being `true` and `string: true}` being `false` and as a result `false && false` being `false`.
>
> It evaluates to false, because of the second key assignment `string: true`, overrides the  first one, with value `"hello"`! Therefore, the first entry in the Object is completely ignored and not checked at all! This is how Objects work! You can only have one unique key in your Object and if you define it twice then the first one becomes absolete.
>
> The only solution is to assign an array to it, like `typecheck({string: ["hello", true]})`. But then again, how do you handle `typecheck({array: [1,2,3]})` versus `typecheck({array: ["some value", true, [1,2,3]]})`?
>
> Yes, you'd need a naming convention to tell them apart! **This is why we have a **singular** name for one value and a **plural** name for many value.**


## What else is included?

You can use `typecheck({typename: value})` as usual and combine it with your `if` statements. You could also try out **`assert(typecheck({typename: value}), "error message")`** if you want, which throws an error immediately, when your check fails. (Choose your enemy!)


