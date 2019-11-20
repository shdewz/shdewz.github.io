function render()
{
    var canvas = document.querySelector("canvas");
    canvas.width = canvas.scrollWidth;
    canvas.height = canvas.scrollHeight;
    var c = canvas.getContext("2d");

    var apikey = document.getElementById("api").value;
    var uid = document.getElementById("uid").value;

    var mode = document.getElementById("mode").selectedIndex;
    var modetext = ["osu!", "osu!taiko", "osu!catch", "osu!mania"][mode];

    // get stats
    const userStatRequest = async () =>
    {
        try
        {
            const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`);
            const userjson = await response.json();

            for (var u in userjson)
            {
                // put stuff to variables
                var username = userjson[u].username;
                var userid = userjson[u].user_id;
                var joindate = new Date(userjson[u].join_date);
                var playcount = userjson[u].playcount;
                var pp = userjson[u].pp_raw;
                var rank = userjson[u].pp_rank;
                var countryrank = userjson[u].pp_country_rank;
                var country = userjson[u].country.toLowerCase();
                var accuracy = userjson[u].accuracy;
                var score = userjson[u].ranked_score;
                var level = userjson[u].level;
            }

            // draw everything

            canvas.style.width = "600px";
            canvas.style.height = "200px";

            var grd = c.createLinearGradient(0, 0, 600, 0);
            grd.addColorStop(0, "#c31432");
            grd.addColorStop(1, "#240b36");

            c.fillStyle = grd;
            c.fillRect(0, 0, 600, 200);

            c.fillStyle = "#FFFFFF";

            c.shadowColor = "#000000";
            c.shadowBlur = "8";

            var uoffset = 0;
            if (username.length >= 17) { c.font = "25px Rubik"; uoffset = -3; }
            else if (username.length >= 13) { c.font = "30px Rubik"; uoffset = -2; }
            else if (username.lenght >= 11) { c.font = "35px Rubik"; uoffset = -1; }
            else { c.font = "40px Rubik"; }

            c.fillText(username, 140, 45 + uoffset);

            c.font = "14px Rubik";
            c.fillText(`${modetext} stats`, 140, 65);
            c.fillText(`Joined ${formatDate(joindate)} (${ac(timeSince(joindate))})`, 140, 85);

            c.fillText(`Accuracy:  ${Math.round(accuracy * 100) / 100}%`, 15, 150);
            c.fillText(`Playcount:  ${ac(playcount)}`, 15, 170);
            c.fillText(`Ranked score:  ${as(score)}`, 15, 190);

            var roffset = 0;
            if (rank.length >= 6) { c.font = "40px Rubik"; roffset = -2; }
            else if (rank.lenght >= 5) { c.font = "45px Rubik"; }
            else { c.font = "50px Rubik"; }

            c.textAlign = "right";
            c.fillText(`#${ac(rank)}`, 590, 50 + roffset);

            c.font = "30px Rubik";
            c.fillText(`#${ac(countryrank)}`, 530, 86);

            c.font = "20px Rubik";
            c.fillText(`${ac(Math.round(pp))} pp`, 590, 116);

            c.fillRect(140, 95, 200, 30);

            c.fillStyle = "#de354f";
            c.fillRect(145, 100, 190 * (level % Math.floor(level)), 20);

            c.fillStyle = "#FFFFFF";
            c.textAlign = "center";
            c.fillText(`Level ${Math.floor(level)}`, 238, 117);

            c.textAlign = "left";

            var pfp = new Image;
            pfp.src = "https://a.ppy.sh/" + userid;
            pfp.onload = () => { c.drawImage(pfp, 15, 15, 110, 110); };

            var flag = new Image;
            flag.src = `http://www.geonames.org/flags/x/${country}.gif`;
            flag.onload = () => { c.drawImage(flag, 540, 60, 50, 30); };

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();

            c.font = "italic 400 12px Rubik";
            c.textAlign = "right";
            c.fillText(`Generated on ${mm}/${dd}/${yyyy} at shdewz.github.io/tools/statcard`, 590, 190);

            canvas.style.visibility = "visible";
            document.getElementById("errorlabel").innerHTML = "";
        }
        catch (error)
        {
            console.log(error);
            document.getElementById("errorlabel").innerHTML = error;
        }
    }
    userStatRequest();
}

// add comma as thousand separator
function ac(num)
{
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// add large number suffixes
function as(num)
{
    if (num <= 10000) // 1,000
    {
        return ac(num);
    }
    else if (num <= 100000) // 10.0K
    {
        num /= 1000;
        return ac(Math.round(num * 10) / 10) + "K";
    }
    else if (num <= 1000000) // 100K
    {
        num /= 1000;
        return ac(num) + "K";
    }
    else if (num <= 10000000) // 1.00M
    {
        num /= 1000000;
        return ac(Math.round(num * 100) / 100) + "M";
    }
    else if (num <= 100000000) // 10.0M
    {
        num /= 1000000;
        return ac(Math.round(num * 10) / 10) + "M";
    }
    else if (num <= 1000000000) // 100M
    {
        num /= 1000000;
        return ac(Math.round(num)) + "M";
    }
    else if (num <= 10000000000) // 1.00B
    {
        num /= 1000000000;
        return ac(Math.round(num * 100) / 100) + "B";
    }
    else if (num <= 100000000000) // 10.0B
    {
        num /= 1000000000;
        return ac(Math.round(num * 10) / 10) + "B";
    }
    else // 100B
    {
        num /= 1000000000;
        return ac(Math.round(num)) + "B";
    }
}

// new time calc
function timeSince(past)
{
    var suffix;
    var prefix;
    var today = new Date();
    var timeDiff = today - past;
    var dayDiff = timeDiff / (1000 * 3600 * 24);
    var monthDiff = dayDiff / (365.2422 / 12);
    var yearDiff = dayDiff / 365.2422;

    if (dayDiff < 365.2422 / 12)
    {
        if (Math.round(dayDiff) == 1) { suffix = " day ago"; }
        else { suffix = " days ago"; }
        prefix = "";
        return prefix + Math.round(dayDiff) + suffix;
    }
    else if (dayDiff < 365.2422)
    {
        if (Math.round(monthDiff) == 1) { suffix = " month ago"; }
        else { suffix = " months ago"; }
        prefix = "";
        return prefix + Math.round(monthDiff) + suffix;
    }
    else if (dayDiff >= 365.2422)
    {
        if (Math.round(yearDiff * 10) / 10 == 1) { suffix = " year ago"; }
        else { suffix = " years ago"; }
        prefix = "";
        return prefix + Math.round(yearDiff * 10) / 10 + suffix;
    }
    else
    {
        return "<date calc error>";
    }
}

// format the date to mm/dd/yyyy
function formatDate(value)
{
    return value.getMonth() + 1 + "/" + value.getDate() + "/" + value.getFullYear();
}