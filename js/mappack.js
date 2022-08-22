let p = { bar: { index: 0, max: 0 }, finished: 0, total: 0 };

async function generate() {
    const ids = $('#setids').val().replace(/\s+/g, '').split(',').filter(e => e);
    if (ids.length == 0) return;
    p = { bar: { index: 0, max: ids.length + 1 }, finished: 0, total: ids.length };
    $('#progress-base').css('visibility', 'visible');
    $('#progress-label').text(`Downloading maps... (${p.finished}/${p.total})`);
    $('#progress-error').text('');

    let maps = [];
    for (const map_id of ids) {
        const resp = await fetch(`https://api.chimu.moe/v1/map/${map_id}`, { mode: 'cors' });
        const map_data = await resp.json();
        await delay(250);
        if (map_data?.DownloadPath) {
            const url = `https://api.chimu.moe/v1${map_data.DownloadPath}`;
            const map = await download(url);
            maps.push({ id: map_id, title: `${map_data.OsuFile.match(/(.* - .*) \(/)[1]}`, file: map });
            await delay(250);

            p.finished++;
            update_progress(1);
            $('#progress-label').text(`Downloading maps... (${p.finished}/${p.total})`);
        }
    }

    console.log(maps);
    export_zip(maps.filter(map => map.file));
}

const download = async url => {
    const resp = await fetch(url);
    return await resp.blob();
};

const export_zip = async maps => {
    if (maps.length == 0) return $('#progress-label').text(`No maps downloaded`);

    const zip = new JSZip();

    for (const map of maps) {
        let mapzip = new JSZip();
        await mapzip.loadAsync(map.file);
        map.file = await mapzip.generateAsync({ type: 'blob' });

        zip.file(`${map.id} ${map.title}.osz`, map.file);
    }

    let file = await zip.generateAsync({ type: 'blob' });
    const fileName = `mappack-${new Date().getTime()}.zip`;
    $('#progress').css('width', '100%');
    $('#progress-label').text(`Finished, ${maps.length} maps downloaded`);
    return saveAs(file, fileName);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const update_progress = increment => { p.bar.index += increment; $('#progress').css('width', Math.ceil((p.bar.index / p.bar.max) * 100) + '%'); };
