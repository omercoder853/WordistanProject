document.addEventListener('DOMContentLoaded', function() {
    const coll_name = document.getElementById("coll_name_hold").textContent
    const coll_title = document.getElementById("coll_title")
    const coll_table_body = document.getElementById("coll_table_body")
    const coll_details = document.getElementById("coll_desc")
    const file_path = "/static/translate/json/collections/" + coll_name +".json"
    switch (coll_name) {
        case "fruitsVegetables":
            coll_title.innerHTML = "Fruits and Vegetables"
            coll_details.innerHTML = "This collection includes 30 different words about fruits and vegetables."
            break;
        case "animals":
            coll_title.innerHTML = "Animals"
            coll_details.innerHTML = "This collection includes 20 different words about animals."
            break;
        case "places":
            coll_title.innerHTML = "Places and Environment"
            coll_details.innerHTML = "This collection includes 30 different words about environment and places."
            break;
    
        default:
            break;
    }
    fetch(file_path)
                .then(response => {
                    if(!response.ok)
                        throw new Error(`HTTP hata kodu: ${response.status}`)
                    return response.json()
                })
                .then(words => {
                    for (let i = 0; i < words.length; i++) {
                        const word = words[i];
                        const new_row = document.createElement("tr")
                        const new_id = document.createElement("td")
                        new_id.textContent = i+1
                        new_row.appendChild(new_id)
                        const new_img_data = document.createElement("td")
                        const new_img = document.createElement("img")
                        new_img.src = `/static/translate/images/${coll_name}/${word.tr}.jpg`
                        new_img.alt = word.en
                        new_img.style.width = "50px"
                        new_img_data.appendChild(new_img)
                        new_row.appendChild(new_img_data)
                        const new_word = document.createElement("td")
                        new_word.innerHTML = word.tr
                        new_row.appendChild(new_word) 
                        const new_meaning = document.createElement("td")
                        new_meaning.innerHTML = word.en
                        new_row.appendChild(new_meaning)
                        coll_table_body.appendChild(new_row)
                    }
                })
});