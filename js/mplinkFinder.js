async function searchMpByName() {
    var apikey = document.getElementById("apikey").value;
    var startID = document.getElementById("startid").value;
    var keyword = document.getElementById("keyword").value;
    var searchLimit = document.getElementById("retries").value;
    document.getElementById("result").innerHTML = "";
    document.getElementById("resultbox").style.visibility = "visible";
    var found = false;
    for (var i = 0; i < searchLimit; i++) {
        if (found) break;
        var mplink = (parseInt(startID) + i).toString();

        try {
            await fetch(`https://osu.ppy.sh/api/get_match?k=${apikey}&mp=${mplink}`)
                .then(response => response.json())
                .then(json => {
                    if (json.length == 0 || json.match == 0) return console.log("empty match " + mplink);

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
        catch (error){
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