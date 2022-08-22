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
        try {
            let map = await get_map(map_id);
            if (map) maps.push(map);
        }
        catch (error) {
            // retry because this apis error handling is dogshit
            await delay(1500);
            try {
                let map = await get_map(map_id);
                if (map) maps.push(map);
            }
            catch (error) {
                maps.push({ id: map_id, status: 'failed' });
                let failed = maps.filter(map => map.status == 'failed');
                $('#progress-error').html(`Missing: ${failed.map(f => `<a href="https://osu.ppy.sh/b/${f.id}">${f.id}</a>`).join(', ')}`);
                continue;
            }
        }
    }

    console.log(maps);
    export_zip(maps);
}

const get_map = async map_id => {
    const resp = await fetch(`https://api.chimu.moe/v1/map/${map_id}`);
    const map_data = await resp.json();
    console.log('Downloading ' + map_id);
    await delay(500);
    if (map_data?.DownloadPath) {
        const url = `https://api.chimu.moe/v1${map_data.DownloadPath}`;
        const map = await download(url);
        await delay(500);

        p.finished++;
        update_progress(1);
        $('#progress-label').text(`Downloading maps... (${p.finished}/${p.total})`);
        return { id: map_id, title: `${map_data.OsuFile.match(/(.* - .*) \(/)[1]}`, file: map, status: 'ok' };
    }
    else return false;
}

const download = async url => {
    const resp = await fetch(url);
    return await resp.blob();
};

const export_zip = async maps => {
    let dl_list = maps.filter(map => map.status == 'ok');
    if (dl_list.length == 0) return $('#progress-label').text(`No maps downloaded`);

    const zip = new JSZip();

    for (const map of dl_list) {
        let mapzip = new JSZip();
        await mapzip.loadAsync(map.file);
        map.file = await mapzip.generateAsync({ type: 'blob' });

        zip.file(`${map.id} ${map.title}.osz`, map.file);
    }

    let file = await zip.generateAsync({ type: 'blob' });
    const fileName = `mappack-${new Date().getTime()}.zip`;
    $('#progress').css('width', '100%');
    $('#progress-label').text(`Finished, ${dl_list.length} maps downloaded`);
    let failed = maps.filter(map => map.status == 'failed');
    if (failed.length > 0) {
        $('#progress-error').html(`Missing: ${failed.map(f => `<a href="https://osu.ppy.sh/b/${f.id}">${f.id}</a>`).join(', ')}`);
    }
    return saveAs(file, fileName);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const update_progress = increment => { p.bar.index += increment; $('#progress').css('width', Math.ceil((p.bar.index / p.bar.max) * 100) + '%'); };
