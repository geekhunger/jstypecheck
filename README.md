# Tiny JavaScript type-checking library

Typechecking in JavaScript is combersome often times. And writing same code over and over again is a pain in the butt too. But with this tiny package, you can define your own types once (and for all), and then check them everywhere in your project!

> **IMPORTANT:** Version >= 3.0.0 introduces breaking changes (is now an ESM module).


## Why?

I'm not trying to reinvent the wheel here. Honestly not! But after googling for a while I felt like all other 'wheels' out there, were just equaly croocked as JavaScript itself.😅

Well, [typeok](https://github.com/kevinfiol/typeok) came actually quite close to my liking (which I only realised after I've finished writing this readme). But I still like my approach better in comparison to it because:

- [better (and more) build-in typechecks](#available-types)
- [typechecks can be nested](#nesting)
- [build-in `&&` `||` logic operators (without additional syntax)](#and-operator)
- [easier to extend by your own types](#custom-types)
- [override build-in types (same way as you add new ones)](#override-types)
- [choose custom *singular* and *plural* names for your types (instead of always having `'s'` suffixes)](#about-type-names)
- [use with `if()` or the additional `assert()` helper (can be used to throw error messages)](#assert)



<br>

## Getting started

### Install this package from NPM

```bash
npm i type-approve
```



### Include it in your project

In CommonJS (before v3.0.0):

```js
const t = require("type-approve") // include like so, then call like t.type({typename: value})
const type = require("type-approve").type // or like so
const {add, check, assert} = require("type-approve") // or like so...
const {add: addType, check: checkType, assert: assertType} = require("type-approve") // or like so (and rename exported functions)
```

In ESM (since v3.0.0):

```js
import t from "type-approve" // use the default export
import {add, type, check, validate, assert} from "type-approve"
```



<h3 id="available-types">Check out available types</h3>

```js
// useless wrappers xD
const getAllTypeDefinitions = () => validate()
const getValidationHandler = singular_name => validate(singular_name)

console.log(getAllTypeDefinitions()) // see available typechecks (build-in ones + your own definitions)
console.log(getValidationHandler("promise")) // get the validation function of type 'promise'
console.log(["one", 2].every(getValidationHandler("string"))) // as synonym for: `["one", 2].every(item => type({string: item}))`

console.log(getAllTypeDefinitions()("string", "that sould resolve to true")) // You can also call the returned function with an argument (which calls the validation handler for given type)! It's same as `type({string: "that should resolve to true"})`
```

***stdout:***
```bash
{
    'nil|nils': [Function: nil],
    'boolean|booleans': [Function: bool],
    'number|numbers': [Function (anonymous)],
    'integer|integers': [Function (anonymous)],
    'float|floats': [Function (anonymous)],
    'string|strings': [Function (anonymous)],
    'expression|expressions': [Function (anonymous)],
    'email|emails': [Function (anonymous)],
    'filepath|filepaths': [Function (anonymous)],
    'folderpath|folderpaths': [Function (anonymous)],
    'httpaddress|httpaddresses': [Function (anonymous)],
    'array|arrays': [Function: arr],
    'object|objects': [Function: obj],
    'json|jsons': [Function (anonymous)],
    'buffer|buffers': [Function (anonymous)],
    'stream|streams': [Function (anonymous)],
    'function|functions': [Function: fn],
    'promise|promises': [Function (anonymous)],
}
[Function (anonymous)]
true
```

> You can see the [build-in validator definitions](https://github.com/geekhunger/type-approve/blob/e73c3d5301f2c6ace5e92f62bb95b569a6e6dac5/index.js#L93) at GitHub.

If you try to access an undefined typecheck, then the return value would be `undefined` (obviously), instead of a validation function. For example:

```js
console.log(
    type({
        foobar: "hello world"
    })
)
```
***stdout:*** `Error: Assertion Error: Missing typecheck handler for type 'foobar'!`

The type 'foobar' is not a build-in type and it was not yet defined! Hence, the assertion of the 'type({})' call.




<br>

## Type-checking

Good. After you've installed the package and know how to include it into your project, let's take a fresh start and lern how to use it. First, let's require the package, as usual.


<h3 id="custom-types">Add custom types</h3>

Right out-of-the-box, we already have a good amount of build-in types. - But nobody knows about the 'foobar' type, aren't they? How about adding one?

Adding custom types is very easy! Let's create a new type, called 'foobar'.

```js
add("foobar", function(value) {
    return typeof value === "string" && value.includes("foo")
})
```

Btw, this is the same as:

```js
add("foobar", "foobars", function(value) {...}) // NOTICE: The second argument is a plural identifier, but sice it only appends an 's', the arguments can be omitted, because this is default behaviour anyways.
```

That was easy, eh? - Our new custom type 'foobar' will return `true` as long as the value is a text string and only if text contains the word `'foo'` somewhere inside it.

***stdin:*** `console.log(type({foobar: "lol"}), type({foobar: "hey foo bar baz"}))`<br>
***stdout:*** `false  true`


> <h4 id="custom-types">Override build-in types</h4>
> 
> Btw, it's equally easy to override build-in types, for example like `'string'` just define your own type checking function and assign it to the same name that you try to override:
> 
> ```js
> add("string", function(value) {         // demo:
>     return (
>         typeof value === "string"       // is string?
>         && value.length > 0             // text has at least 1 character?
>         && /^['"].+['"]$/g.test(value)  // text is quoted?
>     )
> })
> ```


### Use available types

Let's try using our newly created type.

```js
console.log(type({foobar: "Hello world!"})) // false
console.log(type({foobar: "My name is foo-bar, baz."})) // true
```

Great! That worked as expected!

But what if you have *many* different values and you want to typecheck *all* of them against 'foobar'???

```js
// Solution #1 is typechecking every value separately:

if(type({foobar: "Hello World"})
&& type({foobar: "My name is foo-bar, baz."})
&& type({fobbar: true}))
{
    console.error("Woooops! Why is this message showing up? It should not because not all of the values are 'foobars'!")
} else {
    console.log("Purrrfect! True, there are values that are NOT 'foobar' in this check. Got em! Easy peasy leamon squeezy!")

```

> *Have you noticed* how we compared each of the typechecks with the `&&` (logical `and` operator)? Well, this is actually build into `type-approve`!

```js
// Solution #2 is typechecking all value at once:
// (logical operator '&&' will be applied automatically)

const result = type({
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

Worked again!

However, please note that *there are two cool things happening here...*

1) We addressed our type by name `'foobars'` (with an `'s'` suffix) instead of `'foobar'`, and it still worked! How does it come, when we never defined this? - Well this is actually the default behaviour of type definition function `add(singular, [optional_plural], validation_handler)`. If a plural identifier is omitted, then it expects the plural to be the singular name + an 's'.
2) Since we had more than one value to check the same type on, we had put all our values into an array!

<h3 id="about-type-names">A little secret about type definition 🤫</h3>

*Every* type has a **singular** and a **plural** representation. When you add a new type with `type()` you have the option of passing the *singular* label - or both (singular *and plural* names) - fallowed by the check function. For example:

```js
type('foobar', 'foobarez', value => {...}) // singular: 'foobar', plural: 'foobarez'
```

Later, you can refer to this type by its singular (one) **or** plural (many) identifier!
- You use singular when you only want to pass *one single value* into the check function.
- You use the plural name when you want to pass *many values* to the same check function using an array of values.

If you do *not specify a plural* name when defining a type, then the singular + `'s'` becomes the plural name instead! For example, after adding `type('list', value => {...})`, the new type will be known as `'list'` (singular) and `'lists'` (plural).

```js
type({list: ["milk", "bread", "billy boy"]})
type({lists: [
    ["milk", "bread", "billy boy"],
    ["coffee", "pizza", "cigarette"],
]})
```

If you *do* specify both, then after adding `type('truth', 'facts' value => {...})`, the new type will be known as `'truth'` (singular) and `'facts'` (plural).

```js
type({truth: "false"]})
type({facts: ["false, true, 0]})
```


> #### **What's the benefit from this one|many hassle at all?**
> Because it allows checking multiple values for the same type within `type({})` the same call!
>
> Consider this example: `type({string: "hello", string: true})`
> Here, the result will be `false`. But not because of `{string: "hello"}` being `true` and `string: true}` being `false` and as a result `false && false` being `false`!<br>
> It evaluates to `false`, because of the second key assignment `string: true`, overrides the  first one `string: "hello"! Therefore, the first entry in the Object is completely ignored and not checked at all! So, the result is `false` because `string: true` evaluates to `false`. - This is how Objects work! You can only have one unique key in your Object and if you define it twice then the first one becomes absolete.
>
> The only solution is to wrap the values into an array, like: `type({string: ["hello", true]})`. But then again, how do you tell the difference between `type({array: [1,2,3]})` and `type({array: ["some value", true, [1,2,3]]})`? How would you know how to handle both cases?
>
> Yes, exactly! You'd need a naming convention to tell them apart!
> 
> **This is why we have a **singular** name for one value and a **plural** name for many value.**


### Find type of value (similar to `typeof`)

JS has the `typeof` check, which gives you the JavaScript type of a value. But 'type-approve' has also its own type definitions, what about them? How can we check if a value has one of those types?

Well, there is a `check(value)` method. It will always return a list of types that fit the value.

```js
import {check, type} from "type-approve"

const foobar = '[{"foo":"bar"}]'

console.log(foobar, typeof foobar) // returns "string" (default JS typechecking)
console.log(foobar, check(foobar)) // returns ["json", "string"] (because per definition of those types, both fit)

if(type({string: foobar})) // do something
if(check(foobar).includes("string")) // do something
```


## What else is included?

- <h3 id="and-operator">logical <code>&&</code> chaining</h3>

When you want to verify that **all** of the checks evaluate to `true`, then use one single object! Every `key: value` pair will be checked and all of the values will be compared with by an "and" condition.

```js
type({
    strings: ["sam", 21],
    array: ["list", "of", ["foo", "bar", "values"]],
    number: 10,
    float: 10
})
```

- <h3 id="or-operator">logical <code>||</code> comparison</h3>

When you want to verify that **some** (either one) of the checks evaluates to `true`, then pass multiple objects to the function call, separated by a comma. The compiled results of every item in the array (boolean) will be compared by an "or" condition.

```js
const result = type(
    {number: 10}, // true
    {float: 10} // false
)
console.log(result) // (true || false) === true
```

- <h3 id="nesting">nesting of checks</h3>

Sometimes you need a conditional check because you want to know multiple things within the same check, like: Is this a number? **And** is it an integer **or** a float? (And finally, chain another **'and'** condition onto it, like:) **And** is "sam" a string as well?

This is where nesting of typechecks come in handy!

```js
type({
    strings: "sam",
    array: ["list", "of", "things"],
    type({number: 10}, {float: 10})
})
```

Behind the scenes, inner typechecks get compiled first! In this example, the `type([...])` contains an array, which means that every entry will be related to another by an 'or' comparision (equally to `[].some()`). The result in this example would be boolean `true`:

```txt
                  t r u e    | |   f a l s e     ===   t r u e
                    :         :        :
    type( {number: 10},  :  {float: 10}  )
```

Next, the remaining unnested conditions get evaluated as well. They return booleans too. In this particular example the coditions reside in an object (not an array), so they get compared by an 'and'! In this example, each key would now result in a boolean `true`:

```txt
type({
    strings: "sam", .................... t r u e
                                           & &
    array: ["list", "of", "things"], ... t r u e
                                           & &
    true ............................... t r u e  (from previously nested typecheck call...)
                                           ===
                                           true
})
```

The final return value from this example would be a boolean `true`, as we see!

- <h3 id="assert"><code>assert(condition, message)</code></h3>

`assert` is just another way of saying: `if(!condition) throw new Error("message"))`. You can use `type({typename: value})` as usual and combine it with your `if` statements. Or, you combine it with `assert(type({typename: value}), "Wrong type!")`, which throws an error immediately, when your type-checking fails.

```js
if(!type(nil: "hello")) {
    console.info("Great, 'hello' is not a falsy type!")
}
```
```js
assert(type(nil: '')), "That's weird! An empty text is NOT really a falsy type... Only undefined, null and NaN are!")
```


