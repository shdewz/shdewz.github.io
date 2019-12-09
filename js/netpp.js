function calculate() {

    // get values from the input fields
    var uid = document.getElementById("uid").value;
    var ppraw = parseFloat(document.getElementById("rawpp").value); 
    var overwrite = parseInt(document.getElementById("overwrite").value);   
    var apikey = document.getElementById("apikey").value;
    var select = document.getElementById("gamemode").value;

    // declare the variables
    var scores = [];
    var scoresoldw = [];
    var weighedscores = [];

    var ppfull = 0;
    var bottomscore = 0;

    var totalppold = 0;
    var totalpp = 0;
    var difference = 0;
    var newpp = 0;

    var diffsymbol = "";
    var differencerounded = 0;

    var mode = 0;

    // adjust the gamemode
    if (select == "taiko"){ mode = 1; }
    else if (select == "catch"){ mode = 2; }
    else if (select == "mania"){ mode = 3; }
    else { mode = 0; } // unnecessary but whatever

    // get the top 100 plays from the api
    fetch(`https://osu.ppy.sh/api/get_user_best?k=${apikey}&m=${mode}&limit=100&u=${uid}`).then(function (response) {
        return response.json();
    }).then(function (rawjson) {

        // add the pp values of the plays to an array
        var json_array = rawjson;                 
        for (var j in json_array) {
            scores[scores.length] = parseFloat(json_array[j].pp);
        }

        // get the lowest score on the list
        bottomscore = parseInt(scores[scores.length - 1]);

        // get user stats
        fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`).then(function (response) {
            return response.json();
        }).then(function (rawjsonuser) {

            // take the total pp
            var json_array_user = rawjsonuser;               
            for (var ju in json_array_user) {
                ppfull = json_array_user[ju].pp_raw;
            }

            // see if the inputted pp is below the lowest score
            if (scores.length >= 100 && ppraw < scores[scores.length - 1]){
                console.log('Play outside top100.');
                document.getElementById("result").innerHTML = `<b>${ppraw}pp</b> is outside of your top 100 plays (lowest <b>${bottomscore}pp</b>).<br/><br/>No change in total pp.`;
            }
            else{
                // apply weighting to the old scores and insert them to a new list
                var i = 1;
                for (var score in scores){
                    scoresoldw[scoresoldw.length] = scores[i - 1] * Math.pow(0.95, i - 1);
                    i++;
                }
                // see if overwriting is selected
                if (overwrite !== "" && Number.isInteger(overwrite) && overwrite <= 100){
                    // remove the corresponding score
                    scores.splice(overwrite - 1, 1);
                }
                else{
                    // remove the last score
                    scores.pop();
                }

                // add the hypothetical play to the list and sort it
                scores[scores.length] = ppraw;
                scores.sort((a, b) => b - a);

                // apply weighting again with the new score in place
                var ii = 1;
                for (var score in scores){
                    weighedscores[weighedscores.length] = scores[ii - 1] * Math.pow(0.95, ii - 1);
                    ii++;
                }

                // sum the score arrays
                totalppold = scoresoldw.reduce((a, b) => a + b, 0);
                totalpp = weighedscores.reduce((a, b) => a + b, 0);

                // calculate difference between the arrays and add it to the total pp
                difference = parseFloat(totalpp) - parseFloat(totalppold);
                newpp = parseFloat(ppfull) + parseFloat(difference);

                // debug outputs
                console.log('old pp (calculated) ', totalppold);
                console.log('old pp (true) ', ppfull);
                console.log('difference ', difference);
                console.log('new pp (calculated) ', totalpp);
                console.log('new pp (true)', newpp);

                // change the +/- symbol
                if (difference < 0.005 && difference > -0.005) { diffsymbol = "±"; }
                else if (difference >= 0.005) { diffsymbol = "+"; }
                else { diffsymbol = ""; }

                // adjust visible decimal places based on difference value
                if (difference < 10 && difference > -10) { differencerounded = Math.round(difference * 100) / 100; }
                else { differencerounded = Math.round(difference); }

                // write down the results
                document.getElementById("result").innerHTML = "";
                document.getElementById("result").innerHTML = `<span class="desc">Current pp:</span> <b>${Math.round(ppfull)}pp</b><br/><span class="desc">pp after ${Math.round(ppraw)}pp play:</span> <b>${Math.round(newpp)}pp</b><br/><hr/><span class="desc">Difference:</span> <b>${diffsymbol}${differencerounded}pp</b>`;
            }

            }).catch(function (error) {
                console.error('something broke');
                console.error(error);
                document.getElementById("result").innerHTML = error;
            })

        }).catch(function (error) {
            console.error('something broke');
            console.error(error);
            document.getElementById("result").innerHTML = error;
        })

        
    }