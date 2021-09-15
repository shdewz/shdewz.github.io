let index = 0;
let max = 1;

async function generate() {
    const ids = $('#setids').val().replace(/\s+/g, '').split(',').filter(e => e);
    if (ids.length == 0) return;
    index = 0;
    max = ids.length + ids.length / 8;
    let maps = await Promise.all(ids.map(async id => ({ id: id, blob: await download_map(id) })));
    console.log(`${maps.filter(map => map.blob).length} map(s) successfully downloaded.`);
    $('#progress-label').text(`Preparing zip file...`);
    let failed = maps.filter(map => !map.blob);
    if (failed.length > 0) $('#progress-error').wrapInner(`<i class="fas fa-exclamation-triangle"></i> The following maps were not downloaded:<br>${failed.map(e => `<a href="https://osu.ppy.sh/s/${e.id}">${e.id}</a>`).join('<br>')}`);
    export_zip(maps.filter(map => map.blob));
}

const download_map = async id => {
    console.log(`Downloading ${id}...`);
    $('#progress-label').text(`Downloading ${id}...`);
    const url = `https://api.chimu.moe/v1/download/${id}?n=0`;
    const response = await fetch(url);
    index++;
    $('#progress').css('width', Math.ceil((index / max) * 100) + '%');
    return response.ok ? await response.blob() : false;
}

const get_map = async id => {
    console.log(`Searching for ${id}...`);
    const url = `https://api.chimu.moe/v1/download/${id}?n=0`;
    const response = await fetch(url);
}

const export_zip = maps => {
    if (maps.length == 0) return;
    const zip = new JSZip();
    maps.forEach(map => zip.file(`${map.id}.osz`, map.blob));

    zip.generateAsync({ type: 'blob' }).then(file => {
        const fileName = `mappack-${new Date().getTime()}.zip`;
        $('#progress').css('width', '100%');
        $('#progress-label').text(`Done`);
        return saveAs(file, fileName);
    });
}