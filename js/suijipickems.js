function randomize() {
    for (var i = 0; i < 16; i++) {
        var score1 = Math.floor(Math.random() * 7);
        var score2 = score1 == 6 ? Math.floor(Math.random() * 6) : 6;
        var team1 = matchups[i].team1;
        var team2 = matchups[i].team2;

        document.getElementById(`m${i + 1}-title`).innerHTML = `${team1} vs ${team2}`;
        document.getElementById(`m${i + 1}-score`).innerHTML = `${score1} - ${score2}`;
    }
}

const matchups = [
    {
        "team1": "Escargot",
        "team2": "SKT T1"
    },
    {
        "team1": "99woodcutting",
        "team2": "Pocket Gala"
    },
    {
        "team1": "stan kpop uwu",
        "team2": "VROUM 365"
    },
    {
        "team1": "squirrel pants",
        "team2": "the NATION"
    },
    {
        "team1": "Australia",
        "team2": "Stoof & Friends"
    },
    {
        "team1": "Bad Omen",
        "team2": "Cloud OD9"
    },
    {
        "team1": "JTBulldozer",
        "team2": "Milky Warfare"
    },
    {
        "team1": "100 Thieves",
        "team2": "team"
    },
    {
        "team1": "EU State of Asia",
        "team2": "Chaoz Fantasy"
    },
    {
        "team1": "HolySuiJesus",
        "team2": "Edward Join Now"
    },
    {
        "team1": "Spork Lover Fanclub",
        "team2": "metal frog"
    },
    {
        "team1": "Ketamine Racing",
        "team2": "PeepoLeave"
    },
    {
        "team1": "Marek Marucha",
        "team2": "Holy Jesus 2: Amen"
    },
    {
        "team1": "The",
        "team2": "Manchester United"
    },
    {
        "team1": "Team Solo Mald",
        "team2": "Titanic of Stygian"
    },
    {
        "team1": "suiji winners",
        "team2": "furry zoo"
    }
]