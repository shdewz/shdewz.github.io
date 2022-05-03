async function calculate() {

    document.getElementById("loading").style.visibility = "visible";
    document.getElementById("playername-text").style.visibility = "hidden";

    // get values from the input fields
    let uid = document.getElementById("uid").value;
    let ppraw = parseFloat(document.getElementById("rawpp").value);
    let overwrite = parseInt(document.getElementById("overwrite").value);
    let apikey = document.getElementById("apikey").value;
    let select = document.getElementById("gamemode").value;

    saveKey(apikey);

    if (apikey == "") return;

    let scoresoldw = [];
    let weighedscores = [];

    let totalppold = 0;
    let totalpp = 0;
    let difference = 0;
    let newpp = 0;

    let diffsymbol = "";
    let differencerounded = 0;

    // adjust the gamemode
    let mode = 0;
    if (select == "taiko") { mode = 1; }
    else if (select == "catch") { mode = 2; }
    else if (select == "mania") { mode = 3; }

    let scores = await getPlays(uid, mode, apikey);
    let user = await getUser(uid, mode, apikey);

    // see if the inputted pp is below the lowest score
    if (scores.length >= 100 && ppraw < scores[scores.length - 1]) writeResults(ppraw, user.pp, user.pp, 0.00, "±");
    else {
        // apply weighting to the old scores and insert them to a new list

        scoresoldw = scores.map((score, index) => score * Math.pow(0.95, index));

        // see if overwriting is selected
        if (overwrite !== "" && Number.isInteger(overwrite) && overwrite <= 100) scores.splice(overwrite - 1, 1);
        else scores.pop();

        // add the hypothetical play to the list and sort it
        scores[scores.length] = ppraw;
        scores.sort((a, b) => b - a);

        // apply weighting again with the new score in place
        weighedscores = [];
        for (var i = 0; i < scores.length; i++) {
            weighedscores[weighedscores.length] = scores[i] * Math.pow(0.95, i);
        }

        // sum the score arrays
        totalppold = scoresoldw.reduce((a, b) => a + b, 0);
        totalpp = weighedscores.reduce((a, b) => a + b, 0);

        // calculate difference between the arrays and add it to the total pp
        difference = parseFloat(totalpp) - parseFloat(totalppold);
        newpp = parseFloat(user.pp) + parseFloat(difference);

        // change the +/- symbol
        if (difference < 0.005 && difference > -0.005) { diffsymbol = "±"; }
        else if (difference >= 0.005) { diffsymbol = "+"; }
        else { diffsymbol = ""; }

        // adjust visible decimal places based on difference value
        if (difference < 10 && difference > -10) { differencerounded = Math.round(difference * 100) / 100; }
        else if (difference < 100 && difference > -100) { differencerounded = Math.round(difference * 10) / 10; }
        else { differencerounded = Math.round(difference); }

        // write down the results
        writeResults(ppraw, user.pp, newpp, differencerounded, diffsymbol);
        document.getElementById("loading").style.visibility = "hidden";
        document.getElementById("playername-text").innerHTML = `What if ${user.username} got a ${Math.round(ppraw).toLocaleString()}pp play?`;
        document.getElementById("playername-text").style.visibility = "visible";
    }
}

async function getPlays(userid, mode, apikey) {
    return new Promise(async resolve => {
        fetch(`https://osu.ppy.sh/api/get_user_best?k=${apikey}&m=${mode}&limit=100&u=${userid}`).then(function (response) {
            return response.json();
        }).then(plays => {
            let scores = plays.map(play => Number(play.pp));
            return resolve(scores);
        });
    });
}

async function getUser(userid, mode, apikey) {
    return new Promise(async resolve => {
        fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${userid}`).then(function (response) {
            return response.json();
        }).then(user => {
            let userobj = {
                username: user[0].username,
                pp: Number(user[0].pp_raw)
            };
            return resolve(userobj);
        });
    });
}

function saveKey(key) {
    var d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `apikey=${key}; SameSite=Strict; Secure; expires=${d.toUTCString()}; path=/`;
}

function writeResults(rawpp, oldpp, newpp, diff, diffsymbol) {
    document.getElementById("resulttable").rows[0].cells[1].innerHTML = `${Math.round(oldpp).toLocaleString()}pp`;
    document.getElementById("resulttable").rows[1].cells[1].innerHTML = `${Math.round(newpp).toLocaleString()}pp`;
    document.getElementById("resulttable").rows[2].cells[1].innerHTML = `${diffsymbol}${diff.toLocaleString()}pp`;
}