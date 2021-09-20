let p = { bar: { index: 0, max: 0 }, finished: 0, total: 0 };

async function generate(novid) {
    const ids = $('#setids').val().replace(/\s+/g, '').split(',').filter(e => e);
    if (ids.length == 0) return;
    p = { bar: { index: 0, max: ids.length * 4 + ids.length / 4 }, finished: 0, total: ids.length };
    $('#progress-base').css('visibility', 'visible');
    $('#progress-label').text(`Downloading maps... (${p.finished}/${p.total})`);
    $('#progress-error').text('');

    let maps = await Promise.all(ids.map(async id => ({ id: id, file: await download_map(id) })));
    console.log(`${maps.filter(map => map.file).length} map(s) successfully downloaded.`);

    let failed = maps.filter(map => !map.file);
    if (failed.length > 0) $('#progress-error').wrapInner(`<i class="fas fa-exclamation-triangle"></i> The following maps were not downloaded:<br>${failed.map(e => `<a href="https://osu.ppy.sh/s/${e.id}">${e.id}</a>`).join(', ')}`);

    $('#progress-label').text(`Preparing zip file...`);
    export_zip(maps.filter(map => map.file), novid);
}

const download_map = async id => {
    const map = await get_map(id);
    if (map.length == 0) return false;
    update_progress(1);
    console.log(`Downloading ${map.Artist} - ${map.Title} (${id})...`);

    const url = `https://api.chimu.moe/v1/download/${id}?n=1`;
    let response = await fetch(url, { method: 'GET', headers: { 'Origin': 'https://chimu.moe' } });

    if (!response.ok) return false;
    const blob = await response.blob();
    update_progress(3);
    p.finished++;
    $('#progress-label').text(`Downloading maps... (${p.finished}/${p.total})`);

    return { title: `${map.Artist} - ${map.Title}`, blob: blob };
}

const export_zip = async (maps, novid) => {
    if (maps.length == 0) return $('#progress-label').text(`Finished, ${maps.length} maps downloaded`);

    const zip = new JSZip();

    for (const map of maps) {
        if (novid) {
            let mapzip = new JSZip();
            await mapzip.loadAsync(map.file.blob);
            for (const file of Object.keys(mapzip.files)) { if (file.endsWith('.mp4')) mapzip.remove(file); };
            map.file.blob = await mapzip.generateAsync({ type: 'blob' });
        }

        zip.file(`${map.id} ${map.file.title}.osz`, map.file.blob);
    }

    let file = await zip.generateAsync({ type: 'blob' });
    const fileName = `mappack-${new Date().getTime()}.zip`;
    $('#progress').css('width', '100%');
    $('#progress-label').text(`Finished, ${maps.length} maps downloaded`);
    return saveAs(file, fileName);
}

const get_map = async id => (await (await fetch(`https://api.chimu.moe/v1/set/${id}`)).json()).data;
const update_progress = increment => { p.bar.index += increment; $('#progress').css('width', Math.ceil((p.bar.index / p.bar.max) * 100) + '%'); };
