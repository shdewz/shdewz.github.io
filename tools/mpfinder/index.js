let IN_PROGRESS = false;

const valid_searches = ['query_lobby_name', 'query_lobby_name_regex', 'query_player', 'query_beatmap'];

const search = () => {
    if (IN_PROGRESS) {
        return set_error('Already in progress.', null);
    }

    const options = {
        SEARCH_TYPE: $('#search_type').val(),
        QUERY: $('#query').val(),
        START_ID: Number($('#start_from').val()),
        RETRY_COUNT: Number($('#max_retries').val()),
        API_KEY: $('#api_key').val()
    }

    if (options.QUERY === '') {
        return set_error('Please set a keyword to search with.', '#query');
    }

    if (options.START_ID === '' || isNaN(options.START_ID) || options.START_ID < 0) {
        return set_error('Please set a correct starting match id.', '#start_from');
    }

    if (options.RETRY_COUNT === '' || options.RETRY_COUNT < 1) {
        return set_error('Please set a correct amount of retries.', '#max_retries');
    }

    if (options.API_KEY === '') {
        return set_error('Please set a valid API key.', '#api_key');
    }

    if (!valid_searches.includes(options.SEARCH_TYPE)) {
        return set_error('Unsupported search type.', null);
    }

    clear_error();
    start_search(options);
}

const start_search = async options => {
    $('#status_text').text('processing...');
    $('#finished_row').html('');
    $('#status_icon, #match_row').css('display', 'block').css('opacity', 1);
    if (options.SEARCH_TYPE === 'query_player' || options.SEARCH_TYPE === 'query_beatmap') $('#score_row').css('display', 'block').css('opacity', 1);
    $('#match_count, #score_count').text('0');
    $('#match_total').text(options.RETRY_COUNT);

    IN_PROGRESS = true;
    let score_count = 0;
    for (let i = 0; i < options.RETRY_COUNT; i++) {
        const current_match = options.START_ID + i;

        try {
            const res = await fetch(`https://osu.ppy.sh/api/get_match?k=${options.API_KEY}&mp=${current_match}`);
            const data = await res.json();

            if (options.SEARCH_TYPE === 'query_lobby_name' && data?.match?.name?.includes(options.QUERY)) return match_found(data, i + 1);
            if (options.SEARCH_TYPE === 'query_lobby_name_regex' && data?.match?.name?.match(new RegExp(options.QUERY))) return match_found(data, i + 1);

            if (options.SEARCH_TYPE === 'query_player') {
                for (let game of data?.games) {
                    for (let score of game?.scores) {
                        if (score.user_id == options.QUERY) return match_found(data, i + 1);
                    }
                    score_count += game?.scores?.length || 0;
                    $('#score_count').text(score_count);
                }
            }
            if (options.SEARCH_TYPE === 'query_beatmap') {
                for (let game of data.games) {
                    if (game.beatmap_id == options.QUERY) return match_found(data, i + 1);
                    score_count += game?.scores?.length || 0;
                    $('#score_count').text(score_count);
                }
            }
        }
        catch (error) {
            await delay(1600);
            set_error('Invalid API key or match ID.', null);
            clear_status();
            break;
        }

        $('#match_count').text(`${i + 1}`);
    }
    $('#status_text').text('no matches.');
    $('#status_icon, #match_row, #score_row').css('display', 'none').css('opacity', 0);
    $('#finished_row').html(`retry count of ${options.RETRY_COUNT} reached with no matching lobbies.`);
    IN_PROGRESS = false;
}

const match_found = (match, tries) => {
    $('#status_text').text('match found!');
    $('#status_icon, #match_row, #score_row').css('display', 'none').css('opacity', 0);
    $('#finished_row').html(`found matching lobby: <a href="https://osu.ppy.sh/community/matches/${match.match.match_id}" class="lobby_link">${match.match.name}</a> (id ${match.match.match_id})`);
    IN_PROGRESS = false;
}

const clear_status = () => {
    $('#status_text').text('waiting...');
    $('#status_icon, #match_row, #score_row').css('display', 'none').css('opacity', 0);
}

const set_error = (error_text, error_field) => {
    $('#search_error').css('opacity', 1).text(error_text);
    if (error_field) {
        $(error_field).css('animation', 'flash_error 600ms ease-out 0s 3');
        setTimeout(() => { $(error_field).css('animation', 'none'); }, 1600);
    }
}

const clear_error = () => {
    $('#search_error').css('opacity', 0);
    setTimeout(() => { $('#search_error').text('/') }, 300);
};

const delay = async time => new Promise(resolve => setTimeout(resolve, time));
