let index = 0;
let max = 1;

async function generate() {
    const ids = $('#setids').val().replace(/\s+/g, '').split(',').filter(e => e);
    if (ids.length == 0) return;
    $('#progress-base').css('visibility', 'visible');
    $('#progress-label').text('');
    $('#progress-error').text('');
    index = 0;
    max = ids.length + ids.length / 8;

    let maps = await Promise.all(ids.map(async id => ({ id: id, blob: await download_map(id) })));
    console.log(`${maps.filter(map => map.blob).length} map(s) successfully downloaded.`);

    let failed = maps.filter(map => !map.blob);
    if (failed.length > 0) $('#progress-error').wrapInner(`<i class="fas fa-exclamation-triangle"></i> The following maps were not downloaded:<br>${failed.map(e => `<a href="https://osu.ppy.sh/s/${e.id}">${e.id}</a>`).join(', ')}`);

    $('#progress-label').text(`Preparing zip file...`);
    export_zip(maps.filter(map => map.blob));
}

const download_map = async id => {
    const map = await get_map(id);
    if (map.length == 0) return false;
    console.log(`Downloading ${map.Artist} - ${map.Title} (${id})...`);
    const url = `https://api.chimu.moe/v1/download/${id}?n=0`;
    const response = await fetch(url);

    index++;
    $('#progress-label').text(`Downloading ${map.Artist} - ${map.Title}...`);
    $('#progress').css('width', Math.ceil((index / max) * 100) + '%');

    return response.ok ? await response.blob() : false;
}

const get_map = async id => {
    const url = `https://api.chimu.moe/v1/set/${id}`;
    const response = await fetch(url);
    return (await response.json()).data;
}

const export_zip = maps => {
    if (maps.length == 0) {
        $('#progress-label').text(`Finished, ${maps.length} maps downloaded`);
        return;
    }
    const zip = new JSZip();
    for (const map of maps) { zip.file(`${map.id}.osz`, map.blob) }

    zip.generateAsync({ type: 'blob' }).then(file => {
        const fileName = `mappack-${new Date().getTime()}.zip`;
        $('#progress').css('width', '100%');
        $('#progress-label').text(`Finished, ${maps.length} maps downloaded`);
        return saveAs(file, fileName);
    });
}