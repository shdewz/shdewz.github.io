const url = 'https://raw.githubusercontent.com/shdewz/shdewz.github.io/master/tools/suiji-players.json';

let team_count = 32;
let players_per_seed = 2;

const load = async () => {
    return new Promise(async resolve => {
        fetch(url).then(async response => {
            let data = await response.json();
            resolve(data);
        });
    });
}

async function generate() {
    seeds = await load();
    let teams = [];
    let table = $('table');

    while (table[0].rows.length > 1) { table[0].deleteRow(1); }

    for (let i = 0; i < team_count; i++) {
        let team = [];
        for (let j = 0; j < seeds.length; j++) {
            for (let k = 0; k < players_per_seed; k++) {
                let player = seeds[j].players.splice(Math.floor(Math.random() * seeds[0].players.length), 1)[0];
                team.push(player);
            }
        }
        teams.push(team);
        let row = `<tr><td><b>Team ${i + 1}</b></td>${team.map(e => `<td>${e}</td>`).join('')}</tr>`;
        table.append(row);
    }

    table.css('visibility', 'visible');

    console.log(teams);
}

