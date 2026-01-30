const dictionarySection = document.getElementById("my-dictionaries")
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/dictionaries")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Loaded dictionaries from database:", data);
      if (data.error) {
        console.error("Error:", data.error);
        alert("Error loading dictionaries: " + data.error);
        return;
      }
      if (data.length === 0) {
        console.log("No dictionaries found in database");
      } else {
        console.log(`Rendering ${data.length} dictionary(ies) from database`);
        document.getElementById("numberDict").innerHTML = data.length;
        let counter = 0;
        let newRow = document.createElement('div');
        newRow.classList.add("row","g-3","mb-4")
        data.forEach(dict => {
            counter++;
            const newCard = document.createElement('div')
            newCard.classList.add("card")
            const newCol = document.createElement('div')
            newCol.className = "col-md-3"
            const newImg = document.createElement("img")
            newImg.src = window.imageSrc
            newImg.alt = "Dictionary cover"
            newImg.className = "card-img-top"
            const newCardBody = document.createElement('div')
            newCardBody.className = "card-body"
            const newTitle = document.createElement('h5')
            newTitle.className = "card-title"
            newTitle.innerHTML = dict.name;
            newCardBody.appendChild(newTitle)
            const newText = document.createElement('p');
            newText.className = "card-text";
            newText.innerHTML = dict.description;
            newCardBody.appendChild(newText)
            const newDirection = document.createElement('p');
            newDirection.innerHTML = dict.language
            newDirection.className = "dictDetailInfo"
            newCardBody.appendChild(newDirection)
            const newButton = document.createElement('a')
            newButton.className = "btn btn-primary"
            newButton.innerHTML = "Go Dictionary";
            const base_url_data = document.getElementById("baseurl-data")
            const base_url = JSON.parse(base_url_data.textContent)
            newButton.href = base_url.replace('0',dict.id)
            newCardBody.appendChild(newButton)
            newCard.appendChild(newImg)
            newCard.appendChild(newCardBody)
            newCol.appendChild(newCard)
            newRow.appendChild(newCol)
        });
        dictionarySection.appendChild(newRow)
      }
    })
    .catch((error) => {
      console.error("Error loading dictionaries:", error);
    });
});
