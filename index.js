let public = module.exports = {}
let TYPE = Object.create(null)
const {Readable, Writable} = require("stream")


// private shortcuts (also used publically, see definitions at the bottom of this file!)
const nil  = value => value === undefined || value === null || value === NaN
const bool = value => (typeof value === "boolean" || typeof value === "string") && /^(true|false)$/i.test(value.toString().trim())
const str  = value => typeof value === "string" && value.length > 0
const fn   = value => typeof value === "function"
const obj  = value => typeof value === "object" && !Array.isArray(value) && value !== null
const arr  = value => Array.isArray(value)


public.assert = function(condition, message) {
    if(Boolean(condition)) return true
    throw new Error(`Assertion Error: ${message}`)
}


const whois = function(typename) {
    const findings = Object
        .entries(TYPE)
        .filter(([id, fn]) => {
            return id.split("|").includes(typename) // search for singular or plural!
        })
        .map(([id, fn]) => {
            const [singular, plural] = id.split("|")
            return {
                singular: singular,
                plural: plural,
                handler: fn,
                filter_by: typename, // query string which was used to find this typecheck resolver
                found_by: typename === singular ? "singular" : (typename === plural ? "plural" : undefined) // name of the identifier by which we found this resolver (by its singular or plural name)?
            }
        })
    switch(findings.length) {
        case 0: public.assert(false, `Missing typecheck handler for type '${typename}'!`)
        case 1: return findings[0]
        default: public.assert(false, `Too many typecheck handlers (${findings.length}) of same type: ${JSON.stringify(findings, null, 4)}`)
    }
}


public.add = function(singular, /*optional*/plural, handler) {
    if(nil(handler) && fn(plural)) {
        handler = plural
        plural = undefined
    }
    if(nil(singular) && nil(plural) && nil(handler)) { // add() returns all available type definitions
        return TYPE
    }
    if(nil(plural) && nil(handler)) { // add("singular_name") finds handler by name and returns it
        try {return whois(singular).handler}
        catch(_) {return undefined}
    }
    public.assert(str(singular) && fn(handler), "Malformed typecheck call!")
    const identifier = `${singular}|${plural ?? singular + "s"}` // funny coincidence: the name is actually a valid RegExp expression
    TYPE[identifier] = handler
    return handler
}


public.check = public.type = function(...group) {
    let result = []
    for(const set of group) {
        if(bool(set)) {
            result.push(set)
        } else if(obj(set)) {
            let test = []
            for(const [typename, input] of Object.entries(set)) {
                const resolver = whois(typename)
                const identifier = resolver[resolver.found_by]
                switch(identifier) {
                    case resolver.singular: {
                        test.push(resolver.handler(input))
                        break
                    }
                    case resolver.plural: {
                        public.assert(arr(input), `Malformed value for '${identifier}' typecheck!`)
                        for(const value of input) test.push(resolver.handler(value))
                    }
                }
            }
            result.push(test.every(Boolean))
        } else {
            public.assert(false, `Unexpected value in typecheck call: ${JSON.stringify(set)}`)
        }
    }
    return result.some(Boolean)
}


public.add("nil", nil)
public.add("boolean", bool)
public.add("function", fn)
public.add("object", obj)
public.add("array", arr)
public.add("number", value => /^\-?\d*\d\.?\d*$/.test(value) || Number(value) === 0)
public.add("integer", value => /^\-?\d+$/.test(value) || Number(value) === 0)
public.add("float", value => /^\-?\d+\d\.\d{2,}$/.test(value) || Number(value) === 0)
public.add("string", value => typeof value === "string")
public.add("function", value => typeof value === "function")
public.add("promise", value => !Array.isArray(value) && (typeof value === "object" || typeof value === "function") && typeof value.then === "function")
public.add("buffer", value => Buffer.isBuffer(value))
public.add("stream", value => value instanceof Readable || value instanceof Writable)
public.add("expression", value => /regexp/i.test(Object.prototype.toString.call(value)))

public.add("email", address => {
    const alphanumeric_set = "a-z0-9"
    const specialchars_set = "!#$%&'*+/=?^_`{|}~-"
    const validation_rule  = new RegExp(`^[${alphanumeric_set}${specialchars_set}]+(?:\.[${alphanumeric_set}${specialchars_set}]+)*@(?:[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?\.)+[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?$`, "gi") // regex found at https://regexr.com/2rhq7
    return typeof address === "string" && address.match(validation_rule) !== null
})

public.add("json", value => {
    try {
        /*
            Handle non-exception-throwing cases.
            Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking.
            However, JSON.parse(null) returns null, and typeof null === "object".
            So, we must check for that, too. Thankfully, null is falsey.
        */
        var result = JSON.parse(value)
        if(result && typeof result === "object") {
            return true
        }
    } catch(_) {
        return false
    }
})
