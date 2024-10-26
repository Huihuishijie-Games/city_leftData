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
let eventId = []
for (var i = 0; i <= 24; i++) {
    let data = getAgeData(i);
    let events = []
    if (!data.event) {
        console.log(data, i)
        return;
    }
    for (var j = 0; j < data.event.length; j++) {
        let id = getId(data.event[j])
        let eventData = eventJson[id]
        // console.log(eventData);
        if (!outputEventJson[id]) {
            outputEventJson[id] = {
                id: id,
                event: eventData.event
            }
        }
        events.push(id)
        // if (i > 15) {
        //     if (eventId.indexOf(id) === -1) {
        //         events.push(outputEventJson[id])
        //     }
        // } else {
        //     eventId.push(id)
        // }

    }
    outputJson[i] = {
        events: events
    }
}

fs.writeFileSync("./output.json", JSON.stringify(outputJson, 2, 2))
fs.writeFileSync("./outputEvent.json", JSON.stringify(outputEventJson, 2, 2))
console.log(outputJson);