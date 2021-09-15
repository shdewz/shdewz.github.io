let failed = [];
let maps = [];

async function generate() {
    const ids = $('#setids').val().replace(/\s+/g, '').split(',');
    failed, maps = [];
    let index = 0;
    for (const id of ids) {
        index++;
        let map = await download_map(id);
        if (map) maps.push({ id: id, blob: map });
        else failed.push(id);
        $('#progress').css('width', Math.ceil((index / (ids.length + ids.length / 8)) * 100) + '%');
    }
    console.log(`${maps.length} maps successfully downloaded.`);
    $('#progress-label').text(`Preparing zip file...`);
    export_zip(maps);
}

const download_map = async id => {
    console.log(`Downloading ${id}...`);
    $('#progress-label').text(`Downloading ${id}...`);
    const url = `https://api.chimu.moe/v1/download/${id}?n=0`;
    const response = await fetch(url);
    return response.ok ? await response.blob() : false;
}

const export_zip = maps => {
    const zip = new JSZip();
    maps.forEach(map => zip.file(`${map.id}.osz`, map.blob));

    zip.generateAsync({ type: 'blob' }).then(file => {
        const fileName = `mappack-${ new Date().getTime()}.zip`;
        $('#progress').css('width', '100%');
        $('#progress-label').text(`Done`);
        if (failed.length > 0) $('#progress-error').text(`The following maps were not downloaded: ${failed.join(', ')}`);
        failed, maps = [];
        return saveAs(file, fileName);
        
    });
}