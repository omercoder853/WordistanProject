const dict_id = document.getElementById("dict_id_hold").textContent
document.addEventListener('DOMContentLoaded',(event)=>{
    fetch(`/api/words/dict_id-${dict_id}`)
        .then(res=>{
            if(!res.ok)
            {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Loaded words from database: ",data);
            if(data.error){
                console.error("Error: ",data.error)
                alert("Error loading words: " + data.error)
                showDefaultPage();
                return;
            }
            if (data.length === 0)
            {
                console.log("No word!!");
                showDefaultPage();
            }
            else
            {
                const title_area = document.getElementById("dict_title");
                const desc_area = document.getElementById("dict_desc");
                const lang_area = document.getElementById("dict_direction");
                title_area.textContent = data.name;
                desc_area.textContent = data.description; 
                lang_area.textContent = data.language;
                const table_body = document.getElementById("dict_table_body")
                const words = data.words;
                for (let index = 0; index < words.length; index++) {
                    const new_row = document.createElement('tr');
                    const new_data_id = document.createElement('td');
                    new_data_id.textContent = index+1;
                    new_row.appendChild(new_data_id);
                    const new_data_word = document.createElement('td');
                    new_data_word.textContent = words[index]['word'];
                    new_row.appendChild(new_data_word);
                    const new_data_meaning = document.createElement('td');
                    new_data_meaning.textContent = words[index]['meaning'];
                    new_row.appendChild(new_data_meaning);
                    const new_data_date = document.createElement('td');
                    new_data_date.textContent = relativeTime(words[index]['added_at']);
                    new_row.appendChild(new_data_date);
                    table_body.appendChild(new_row) 
                }
            }
        })
})

function showDefaultPage()
{
    console.log("No words in dictionary!!")
}


function relativeTime(isoDateString) {
    const timeMS = Date.parse(isoDateString);
    const now = Date.now();
    
    if (isNaN(timeMS)) {
        return "Geçersiz Tarih";
    }
    const dif_seconds = Math.floor((now - timeMS) / 1000);

    if (dif_seconds < 0) {
        return "Yakında";
    }

    const second = 1;
    const minute = second*60;
    const hour = minute*60;
    const day = 24*hour;
    const week = 7*day;
    const month = week*4;

    if (dif_seconds <= 10) {
        return "Now";
    } else if (dif_seconds < 60 && dif_seconds>10) {
        return `${dif_seconds} seconds ago`;
    } else if (dif_seconds < hour && dif_seconds>=minute) {
        const dif_min = Math.floor(dif_seconds / minute);
        return `${dif_min} minutes ago`;
    } else if (dif_seconds>=hour && dif_seconds<day) {
        const dif_hour = Math.floor(dif_seconds / hour);
        return `${dif_hour} hours ago`;
    } else if (dif_seconds>=day && dif_seconds<2*day) {
        return "Yesterday";
    } else if (dif_seconds >=2*day && dif_seconds<week) {
        const dif_day = Math.floor(dif_seconds / day);
        return `${dif_day} days ago`;
    } else if (dif_seconds >= week && dif_seconds<month) {
        const dif_week = Math.floor(dif_seconds / week);
        return `${dif_week} weeks ago`;
    } else {
        const dif_month = Math.floor(dif_seconds / month);
        return `${dif_month} months ago`;
    }
}
