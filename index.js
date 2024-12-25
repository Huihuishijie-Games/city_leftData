const fs = require("fs")
const ageJson = require("./age.json")
const eventJson = require("./events.json")
// console.log(eventJson)


let outputJson = {

}
let outputEventJson = {

}
function getAgeData(age) {
    if (ageJson[age]) {
        return ageJson[age]
    } else {
        for (var i in ageJson) {
            if (parseInt(ageJson[i].age) === age) {
                return ageJson[i]
            }
        }
    }
}
function getId(ids) {
    ids = '' + ids
    return ids.split("*")[0]
}
function getP(ids) {

    ids = '' + ids
    return parseFloat(ids.split("*")[1]) || 1
}

function parseCondition(condition) {

    const conditions = [];
    const length = condition.length;
    const stack = [];
    stack.unshift(conditions);
    let cursor = 0;
    const catchString = i => {
        const str = condition.substring(cursor, i).trim();
        cursor = i;
        if (str) stack[0].push(str);
    };

    for (let i = 0; i < length; i++) {
        switch (condition[i]) {
            case ' ': continue;

            case '(':
                catchString(i);
                cursor++;
                const sub = [];
                stack[0].push(sub);
                stack.unshift(sub);
                break;

            case ')':
                catchString(i);
                cursor++;
                stack.shift();
                break;

            case '|':
            case '&':
                catchString(i);
                catchString(i + 1);
                break;
            default: continue;
        }
    }

    catchString(length);

    return conditions;
}
function checkProp(condition, property) {
    const length = condition.length;
    let i = condition.search(/[><\!\?=]/);

    const prop = condition.substring(0, i);
    const symbol = condition.substring(i, i += (condition[i + 1] == '=' ? 2 : 1));
    const d = condition.substring(i, length);

    const propData = property[prop];
    const conditionData = d[0] == '[' ? JSON.parse(d) : Number(d);
    switch (symbol) {
        case '>': return propData > conditionData;
        case '<': return propData < conditionData;
        case '>=': return propData >= conditionData;
        case '<=': return propData <= conditionData;
        case '=':
            if (Array.isArray(propData))
                return propData.includes(conditionData);
            return propData == conditionData;
        case '!=':
            if (Array.isArray(propData))
                return !propData.includes(conditionData);
            return propData == conditionData;
        case '?':
            if (Array.isArray(propData)) {
                for (const p of propData)
                    if (conditionData.includes(p)) return true;
                return false;
            }
            return conditionData.includes(propData);
        case '!':
            if (Array.isArray(propData)) {
                for (const p of propData)
                    if (conditionData.includes(p)) return false;
                return true;
            }
            return !conditionData.includes(propData);

        default: return false;
    }
}
function conditionType(condition) {
    const length = condition.length;
    let i = condition.search(/[><\!\?=]/);

    const prop = condition.substring(0, i);
    const symbol = condition.substring(i, i += (condition[i + 1] == '=' ? 2 : 1));
    const d = condition.substring(i, length);

    // const propData = property[prop];
    const conditionData = d[0] == '[' ? JSON.parse(d) : Number(d);
    let info = {
        type: "-1",
        data: conditionData
    }
    switch (symbol) {
        case '>': info.type = ">"; break;
        case '<': info.type = "<"; break;
        case '>=': info.type = ">="; break;
        case '<=': info.type = "<="; break;
        case '=':
            info.type = "=";
            break;
        case '!=':
            info.type = "!=";
            break;
        case '?':
            info.type = prop;
            break;
        case '!':
            info.type = "!"
            break;
        default: info.type = "-1"; break;
    }

    return info
}
function conditionFun(condition) {
    if (!condition) {
        return []
    }
    let conditions = parseCondition(condition);

    let arr = []

    for (var i = 0; i < conditions.length; i++) {
        if (Array.isArray(conditions[i]) && conditions[i].length) {
            if (conditions[i][0].search) {
                let info = conditionType(conditions[i][0])
                if (info.type === "EVT") {

                    arr = arr.concat(info.data)
                }
            }
        } else {
            // console.log(conditions[i])
        }

    }
    return arr;

}
let allEventId = []

for (var i = 0; i <= 24; i++) {
    let data = getAgeData(i);
    let events = []
    if (!data.event) {
        console.log(data, i)
        return;
    }
    for (var j = 0; j < data.event.length; j++) {

        let id = getId(data.event[j])
        // events.push({
        //     id: id,
        //     p: getP(data.event[j])
        // })

        events.push(data.event[j])

        // if (i > 23) {
        //     if (eventId.indexOf(id) === -1) {
        //         events.push(outputEventJson[id])
        //     }
        // } else {
        //     eventId.push(id)
        // }
        allEventId.push(id)
    }
    outputJson[i] = {
        events: events
    }
}
for (var i = 0; i <= 24; i++) {
    let data = getAgeData(i);
    if (!data.event) {
        console.log(data, i)
        return;
    }
    for (var j = 0; j < data.event.length; j++) {
        let id = getId(data.event[j])
        let eventData = eventJson[id]
        // console.log(eventData);
        let includes = conditionFun(eventData.include)
        let includeStr = eventData.include
        for (var k = 0; k < includes.length; k++) {
            let id2 = includes[k] + ""
            if (allEventId.indexOf(id2) === -1) {
                includes.splice(k, 1)
                k--;
            }

        }
        if (includes.length) {
            includeStr = "lifeEvt?" + JSON.stringify(includes)
        } else {
            includeStr = undefined
        }

        let excludes = conditionFun(eventData.exclude)
        let excludeStr = eventData.exclude
        if (excludes.length) {
            excludeStr = "lifeEvt?" + JSON.stringify(excludes)
        } else {
            excludeStr = undefined
        }
        // console.log(includes)
        if (!outputEventJson[id]) {
            outputEventJson[id] = {
                id: id,
                event: eventData.event,
                include: includeStr,
                exclude: excludeStr
            }
        }
    }
}



// let d = parseCondition(`(CHR>3)&(MNY<5)&(EVT?[10199,10200,10184])`)
// console.log(d)
fs.writeFileSync("./workAge.json", JSON.stringify(outputJson, 2, 2))
fs.writeFileSync("./workEvents.json", JSON.stringify(outputEventJson, 2, 2))
// console.log(outputJson);