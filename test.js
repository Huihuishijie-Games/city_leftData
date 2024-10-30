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

