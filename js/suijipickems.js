var rolling = false;
async function randomize() {
    if (rolling) return;

    document.getElementById("result").innerHTML = "Waiting...";
    var result = ""

    rolling = true;
    var bar = document.getElementById("bar");
    bar.style.width = "0%";

    for (var j = 0; j < 100; j++) {
        if (j >= 99) result = "**I proudly used the Suiji Pickem Randomizer to do my pickems!**<br>Here are my picks:<br><br>";
        for (var i = 0; i < 16; i++) {
            if (Math.random() < 0.5) {
                score1 = 6;
                score2 = Math.floor(Math.random() * 6);
            }
            else {
                score1 = Math.floor(Math.random() * 6);
                score2 = 6;
            }
            var team1 = matchups[i].team1;
            var team2 = matchups[i].team2;

            document.getElementById(`m${i + 1}-title`).innerHTML = `${team1} vs ${team2}`;
            document.getElementById(`m${i + 1}-score`).innerHTML = `${score1} - ${score2}`;

            if (j >= 99) {
                document.getElementById("share").innerHTML = "Share your results!";
                if (score1 > score2) result += `**${team1} | ${score1}** - ${score2} | ${team2}<br>`;
                else if (score1 < score2) result += `${team1} | ${score1} - **${score2} | ${team2}**<br>`;
            }
        }
        await new Promise(resolve => setTimeout(resolve, Math.min(5 + Math.pow(j, 1.1)), 200));
        bar.style.width = (j / 100) * 100 + "%";
    }

    document.getElementById("result").innerHTML = result;
    bar.style.width = "100%";
    rolling = false;
}

const matchups = [
    {
        "team1": "SKT T1",
        "team2": "Pocket Gala"
    },
    {
        "team1": "stan kpop uwu",
        "team2": "squirrel pants"
    },
    {
        "team1": "Stoof & Friends",
        "team2": "Cloud OD9"
    },
    {
        "team1": "Milky Warfare",
        "team2": "team"
    },
    {
        "team1": "100 Thieves",
        "team2": "Chaoz Fantasy"
    },
    {
        "team1": "JTBulldozer",
        "team2": "HolySuiJesus"
    },
    {
        "team1": "Bad Omen",
        "team2": "Spork Lover Fanclub"
    },
    {
        "team1": "Australia",
        "team2": "PeepoLeave"
    },
    {
        "team1": "the NATION",
        "team2": "Holy Jesus 2: Amen"
    },
    {
        "team1": "VROUM 365",
        "team2": "The"
    },
    {
        "team1": "99woodcutting",
        "team2": "Titanic of Stygian"
    },
    {
        "team1": "Escargot",
        "team2": "furry zoo"
    },
    {
        "team1": "Winner of E1",
        "team2": "Winner of E2"
    },
    {
        "team1": "Winner of E3",
        "team2": "Winner of E4"
    },
    {
        "team1": "Winner of E5",
        "team2": "Winner of E6"
    },
    {
        "team1": "Winner of E7",
        "team2": "Winner of E8"
    }
]