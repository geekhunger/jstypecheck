// NodeJS 14 or newer (because of optional-chaining operators)

const {EOL} = require("os")
let public = module.exports = {}
let TYPE = Object.create(null)


const nil  = value => value === undefined || value === null || value === NaN
const bool = value => (typeof value === "boolean" || typeof value === "string") && /^(true|false)$/i.test(value.toString().trim())
const str  = value => typeof value === "string" && value.length > 0
const fn   = value => typeof value === "function"
const obj  = value => typeof value === "object" && !Array.isArray(value) && value !== null
const arr  = value => Array.isArray(value)



public.assert = function(condition, message) {
    if(Boolen(condition)) return true
    throw new Error(`Assertion Error: ${message}`)
}



const whois = function(typename) {
    const findings = Object.entries(TYPE)
        .filter(([key, value]) => new RegExp(key).test(typename)) // search for singular or plural!
        .map(elem => {
            const nc = elem[0].split("|") // nummerus clausus
            return {
                name: nc[nc.indexOf(typename)], // did we find by singular or by plural? (name will tell you!)
                singular: nc[0],
                plural: nc[1],
                handler: elem[1]
            }
        })
    switch(findings.length) {
        case 0: return undefined
        case 1: return findings[0]
        default: this.assert(false, `Found too many validators (${findings.length}) of same type:${EOL}${JSON.stringify(findings, null, 4)}`)
    }
}



public.type = function(singular, /*optional*/plural, handler) {
    if(nil(handler) && fn(plural)) {
        handler = plural
        plural = undefined
    }
    if(nil(singular) && nil(plural) && nil(handler)) {
        return TYPE
    }
    if(nil(plural) && nil(handler)) {
        return whois(singular)?.handler
    }
    this.assert(str(singular) && fn(handler), "Malformed values in typecheck call!")
    const name = `${singular}|${plural ?? singular + "s"}` // funny coincidence: the name is actually a valid RegExp expression
    TYPE[name] = handler
    return handler
}



public.check = function(...group) {

    
    let test = []

    for(const set of group) {
        if(bool(set)) {
            test.push(set)
        } else if(obj(set)) {
            for(const [typename, value] of Object.entries(set)) {
                const check = whois(typename)

            }
        }
        this.assert(false, "Unexpected value!")
    }


    if(VARTYPE.boolean(map)[0]) {
        return map
    }
    share.fn.assert(
        VARTYPE.array(map)[0] || (VARTYPE.object(map)[0] && Object.keys(map).length === 1),
        "Could not check types! Ruleset must be an object or an array of objects. Each object must have only one entry."
    )
    const validate = rule => {
        let [type, value] = Object.entries(rule)[0] // unpack type name and value from rulecheck
        const [negate, name] = type.match(/^(\!)*(.+)/).slice(1)
        share.fn.assert(
            typeof VARTYPE[name] === "function",
            `Validation function for type '${name}' is not defined yet!`,
            0
        )
        let [test, msg] = VARTYPE[name](value) // validate rule
        if(negate === "!") test = !test // negate test result if type name is prefixed with exclamation mark
        return test
    }
    if(VARTYPE.object(map)[0]) {
        return validate(map)
    }
    if(map.every(value => VARTYPE.boolean(value)[0])) {
        return map.every(bool => bool === true)
    }
    if(map.every(value => VARTYPE.object(value)[0])) {
        return map.every(rule => validate(rule) === true)
    }
    const checks = []
    for(const rule of map) {
        checks.push(share.fn.typecheck(rule)) // dive deeper into nested ruleset
    }
    return checks.some(test => test === true)
}



public.type("nil", value => [
    value === undefined || value === null || value === NaN,
    `Value '${value}' is not a valid 'nil'! Must be one of the falsy values: undefined, null or NaN.`
])

public.type("boolean", value => [
    (typeof value === "boolean" || typeof value === "string") && /^(true|false)$/i.test(value.toString().trim()),
    `Value '${value}' is not a valid 'boolean'! Must be true or false.`
])

public.type("number", value => [
    /^\-?\d*\d\.?\d*$/.test(value) || Number(value) === 0,
    `Value '${value}' is not a valid 'number'! Must be an integer or float.`
])

public.type("integer", value => [
    /^\-?\d+$/.test(value) || Number(value) === 0,
    `Value '${value}' is not a valid 'integer'! Must be a number without decimals.`
])

public.type("float", value => [
    /^\-?\d+\d\.\d{2,}$/.test(value) || Number(value) === 0,
    `Value '${value}' is not a valid 'float'! Must be a number with two decimals.`
])

public.type("string", value => [
    typeof value === "string",
    `Value '${value}' is not a valid 'string'!`
])

public.type("function", value => [
    typeof value === "function",
    `Value '${value}' is not a valid 'function'!`
])

public.type("promise", value => [
    !Array.isArray(value) && (typeof value === "object" || typeof value === "function") && typeof value.then === "function",
    `Value '${value}' is not a valid 'promise'! Must be an object (or a function) with a chainable 'then' property.`
])

public.type("object", value => [
    typeof value === "object" && !Array.isArray(value) && value !== null,
    `Value '${value}' is not a valid 'object'! Must NOT be an array or a null object!`
])

public.type("array", value => [
    Array.isArray(value),
    `Value '${value}' is not a valid 'array'!`
])

public.type("buffer", value => [
    Buffer.isBuffer(value),
    `Value '${value}' is not a valid 'buffer'!`
])

public.type("email", address => {
    const alphanumeric_set = "a-z0-9"
    const specialchars_set = "!#$%&'*+/=?^_`{|}~-"
    const validation_rule  = new RegExp(`^[${alphanumeric_set}${specialchars_set}]+(?:\.[${alphanumeric_set}${specialchars_set}]+)*@(?:[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?\.)+[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?$`, "gi") // regex found at https://regexr.com/2rhq7
    return [
        typeof address === "string" && address.match(validation_rule) !== null,
        `Value '${address}' is not a valid 'email'! Must be a string that complies with general guidelines for naming email addresses.`
    ]
})
