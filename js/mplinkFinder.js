async function searchMpByName(apikey, startID, keyword, searchLimit) {
    var found = false;
    for (var i = 0; i < searchLimit; i++) {
        if (found) break;
        var mplink = (parseInt(startID) + i).toString();

        try {
            await fetch(`https://osu.ppy.sh/api/get_match?k=${apikey}&mp=${mplink}`)
                .then(response => response.json())
                .then(json => {
                    if (json.length == 0 || json.match == 0) return console.log("---- empty match " + mplink);

                    console.log(json.match.name);
                    if (json.match.name.includes(keyword)) {
                        console.log(`-> https://osu.ppy.sh/mp/${mplink} <-`);
                        console.log(`Match found.`);
                        document.getElementById("result").innerHTML = `Match found!<br><em>${json.match.name}</em><br>https://osu.ppy.sh/mp/${mplink}`
                        found = true;
                        return;
                    }
                });

            document.getElementById("progress").innerHTML = `Matches processed: ${i + 1}/${searchLimit}`
        }
        catch (error) {
            if (error.name === "TypeError" || apikey == "") document.getElementById("result").innerHTML = "API key missing.";
            else document.getElementById("result").innerHTML = error;
            return console.log(error);
        }

    }

    if (!found) {
        document.getElementById("result").innerHTML = `Retry limit of ${searchLimit} reached with no matching results.`
        return console.log(`Retry limit of ${searchLimit} reached with no matching results.`);
    }
}

async function searchMpByPlayer(apikey, startID, uid, searchLimit, username) {
    var found = false;
    var totalScores = 0;
    for (var i = 0; i < searchLimit; i++) {
        if (found) break;
        var mplink = (parseInt(startID) + i).toString();

        try {
            await fetch(`https://osu.ppy.sh/api/get_match?k=${apikey}&mp=${mplink}`)
                .then(response => response.json())
                .then(async json => {
                    if (json.length == 0 || json.match == 0) return console.log("---- empty match " + mplink);

                    console.log(json.match.name);
                    for (var j = 0; j < json.games.length; j++) {
                        for (var k = 0; k < json.games[j].scores.length; k++) {
                            totalScores++;
                            document.getElementById("progress").innerHTML = `Matches processed: ${parseInt(i + 1).toLocaleString()}/${parseInt(searchLimit).toLocaleString()}<br>Scores processed: ${parseInt(totalScores).toLocaleString()}`
                            if (json.games[j].scores[k].user_id == uid) {
                                found = true;
                                console.log(`-> https://osu.ppy.sh/mp/${mplink} <-`);
                                console.log(`Match found with user '${username}'`);
                                document.getElementById("result").innerHTML = `Match found with user '${username}'!<br><em>${json.match.name}</em><br>https://osu.ppy.sh/mp/${mplink}`
                                return;
                            }
                        }
                    }
                });
        }
        catch (error) {
            document.getElementById("result").innerHTML = error;
            return console.log(error);
        }

    }

    if (!found) {
        document.getElementById("result").innerHTML = `Retry limit of ${searchLimit} reached with no matching results.`
        return console.log(`Retry limit of ${searchLimit} reached with no matching results.`);
    }
}

async function searchMpByMap(apikey, startID, mapID, searchLimit) {
    var found = false;
    var totalGames = 0;
    for (var i = 0; i < searchLimit; i++) {
        if (found) break;
        var mplink = (parseInt(startID) + i).toString();

        try {
            await fetch(`https://osu.ppy.sh/api/get_match?k=${apikey}&mp=${mplink}`)
                .then(response => response.json())
                .then(async json => {
                    if (json.length == 0 || json.match == 0) return console.log("---- empty match " + mplink);

                    console.log(json.match.name);
                    for (var j = 0; j < json.games.length; j++) {
                        totalGames++;
                        document.getElementById("progress").innerHTML = `Games processed: ${parseInt(i + 1).toLocaleString()}/${parseInt(searchLimit).toLocaleString()}<br>Scores processed: ${parseInt(totalGames).toLocaleString()}`
                        if (json.games[j].beatmap_id == mapID) {
                            found = true;
                            await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${json.games[j].beatmap_id}`)
                                .then(response => response.json())
                                .then(async mapjson => {
                                    var mapText = `${mapjson[0].artist} - ${mapjson[0].title} [${mapjson[0].version}]`
                                    console.log(`-> https://osu.ppy.sh/mp/${mplink} <-`);
                                    console.log(`Match found with map '${mapText}'`);
                                    document.getElementById("result").innerHTML = `Match found with map '${mapText}'!<br><em>${json.match.name}</em><br>https://osu.ppy.sh/mp/${mplink}`
                                    return;
                                })
                            return;
                        }
                    }
                });
        }
        catch (error) {
            document.getElementById("result").innerHTML = error;
            return console.log(error);
        }

    }

    if (!found) {
        document.getElementById("result").innerHTML = `Retry limit of ${searchLimit} reached with no matching results.`
        return console.log(`Retry limit of ${searchLimit} reached with no matching results.`);
    }
}

function searchMatch(type) {
    try {
        var apikey = document.getElementById("apikey").value;
        var startID = document.getElementById("startid").value;
        var keyword = document.getElementById("keyword").value;
        var searchLimit = document.getElementById("retries").value;
        var searchType = document.getElementById("type").value;

        document.getElementById("result").innerHTML = "";
        document.getElementById("resultbox").style.visibility = "visible";
        type = type.toLowerCase();

        if (type == "lobby name") return searchMpByName(apikey, startID, keyword, searchLimit);
        else if (type == "player") {
            fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&u=${keyword}`)
                .then(response => response.json())
                .then(userjson => {
                    var username = userjson[0].username;
                    var uid = userjson[0].user_id;
                    return searchMpByPlayer(apikey, startID, uid, searchLimit, username)
                });
        }
        else if (type == "map") return searchMpByMap(apikey, startID, keyword, searchLimit);
    }
    catch (error) {
        document.getElementById("result").innerHTML = error;
        return console.log(error);
    }
}