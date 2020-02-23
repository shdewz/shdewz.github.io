async function searchMpByName() {
    var apikey = document.getElementById("apikey").value;
    var startID = document.getElementById("startid").value;
    var keyword = document.getElementById("keyword").value;
    var searchLimit = document.getElementById("retries").value;
    var found = false;
    for (var i = 0; i < searchLimit; i++) {
        if (found) break;
        var mplink = (parseInt(startID) + i).toString();

        await fetch(`https://osu.ppy.sh/api/get_match?k=${apikey}&mp=${mplink}`)
            .then(response => response.json())
            .then(json => {
                if (json.length == 0 || json.match == 0) return console.log("empty match " + mplink);

                console.log(json.match.name);
                if (json.match.name.includes(keyword)) {
                    console.log(`-> https://osu.ppy.sh/mp/${mplink} <-`);
                    console.log(`Match found.`);
                    found = true;
                    return;
                }
            });
    }
    if (!found) return console.log(`Retry limit of ${searchLimit} reached with no matching results.`);
}