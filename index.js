let public = module.exports = {}
let TYPE = Object.create(null)



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
        case 0: public.assert(false, `Missing typecheck handler for type '${typename}'!`)
        case 1: return findings[0]
        default: public.assert(false, `Too many typecheck handlers (${findings.length}) of same type: ${JSON.stringify(findings, null, 4)}`)
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
        try {return whois(singular).handler}
        catch(_) {return undefined}
    }
    public.assert(str(singular) && fn(handler), "Malformed typecheck call!")
    const name = `${singular}|${plural ?? singular + "s"}` // funny coincidence: the name is actually a valid RegExp expression
    TYPE[name] = handler
    return handler
}



public.check = function(...group) {
    let result = []
    for(const set of group) {
        if(bool(set)) {
            result.push(set)
        } else if(obj(set)) {
            let test = []
            for(const [typename, input] of Object.entries(set)) {
                const validate = whois(typename)
                switch(validate.name) {
                    case validate.singular: {
                        test.push(validate.handler(input))
                        break
                    }
                    case validate.plural: {
                        public.assert(arr(input), `Malformed value for '${validate.name}' typecheck!`)
                        for(const value of input) test.push(validate.handler(value))
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



public.type("nil",      nil)
public.type("boolean",  bool)
public.type("function", fn)
public.type("object",   obj)
public.type("array",    arr)
public.type("number",   value   => /^\-?\d*\d\.?\d*$/.test(value) || Number(value) === 0)
public.type("integer",  value   => /^\-?\d+$/.test(value) || Number(value) === 0)
public.type("float",    value   => /^\-?\d+\d\.\d{2,}$/.test(value) || Number(value) === 0)
public.type("string",   value   => typeof value === "string")
public.type("promise",  value   => !Array.isArray(value) && (typeof value === "object" || typeof value === "function") && typeof value.then === "function")
public.type("buffer",   value   => Buffer.isBuffer(value))
public.type("email",    address => {
    const alphanumeric_set = "a-z0-9"
    const specialchars_set = "!#$%&'*+/=?^_`{|}~-"
    const validation_rule  = new RegExp(`^[${alphanumeric_set}${specialchars_set}]+(?:\.[${alphanumeric_set}${specialchars_set}]+)*@(?:[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?\.)+[${alphanumeric_set}](?:[${alphanumeric_set}-]*[${alphanumeric_set}])?$`, "gi") // regex found at https://regexr.com/2rhq7
    return typeof address === "string" && address.match(validation_rule) !== null
})
