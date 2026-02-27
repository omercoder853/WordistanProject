const dictionarySection = document.getElementById("my-dictionaries")
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-button")
  logoutButton.addEventListener('click',(event)=>{
    logout();})

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
        let counter = 0;
        let newRow = document.createElement('div');
        newRow.classList.add("row", "g-3", "mb-4")
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
          newButton.href = base_url.replace('0', dict.id)
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
  const achievements = {
    translator_1: { id: "translator_1", title: "Translator I", desc: "This badge shows your progress in translating words. Every word that you translate will make you better." },
    translator_2: { id: "translator_2", title: "Translator II", desc: "This badge shows your progress in translating words. Every word that you translate will make you better." },
    librarian_1: { id: "librarian_1",title: "Librarian I", desc: "The orderly guardian of knowledge. You don't just learn; you organize your mind like a vast library. Every word has its place!" },
    archivist_1:{id:"archivist_1",title:"The Archivist I",desc:"Building your own digital dictionary! Every word you add leaves a lasting mark on Wordistan."},
    archivist_2:{id:"archivist_2",title:"The Archivist II",desc:"Building your own digital dictionary! Every word you add leaves a lasting mark on Wordistan."},
    curious_noive: { id: "curious_novice", title: "Curious Novice", desc: "Every journey begins with a single step. You've just entered the gates of Wordistan!" },
    eager_learner: { id: "eager_learner",title: "Eager Learner", desc: "One week down! Words are starting to feel like old friends." },
    word_hunter: { id: "word_hunter", title: "Word Hunter", desc: "You’ve been on the prowl for 15 days. No word can hide from you now!" },
    lexicon_scholar: { id: "lexicon_scholar", title: "Lexicon Scholar", desc: "A whole month of dedication. You're no longer just reading the dictionary; you're mastering it." },
    word_master: { id: "word_master", title: "Word Master", desc: "60 days of discipline! You don't just learn words; you command them with ease." }
  }
  fetch("/api/earned-achievements")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Loaded achievements from database : ", data)
      if (data.error) {
        console.error("Error: ", data.error)
      }
      else {
        const achivementRow = document.getElementById("achivementRow")
        Object.keys(achievements).forEach(achivement => {
        const last_char = achievements[achivement].id.at(-1)
          const newCol = document.createElement('div');
          newCol.className = "col";
          newCol.style.width = "fit-content";
          const newCard = document.createElement('div')
          newCard.className = "card mb-1 p-3"
          newCard.style.maxWidth = "500px";
          if (!data.earned_achievements.includes(achievements[achivement].id)) {
            const newOverlay = document.createElement('div')
            newOverlay.className = "lock-overlay"
            const newSpan = document.createElement('span')
            newSpan.className = "fs-1"
            newSpan.innerHTML = '🔒';
            newOverlay.appendChild(newSpan)
            newCard.appendChild(newOverlay)
          }
          else if (data.earned_achievements.includes(achievements[achivement].id) && last_char == 1) {
            newCard.classList.add("bronze-theme")
          }
          else if (data.earned_achievements.includes(achievements[achivement].id) && last_char == 2) {
            newCard.classList.remove("bronze-theme")
            newCard.classList.add("silver-theme")
          }
          const new_row = document.createElement('div')
          new_row.className = "row g-0"
          const new_col4 = document.createElement('div')
          new_col4.className = "col-md-4 cardImage"
          const newCardImg = document.createElement('img')
          newCardImg.className = "img-fluid rounded-start"
          newCardImg.src = window.achivementImgSrc + achievements[achivement].id + ".png"
          newCardImg.alt = "Achivement Img"
          new_col4.appendChild(newCardImg)
          const new_col8 = document.createElement('div')
          new_col8.className = "col-md-8"
          const newCardBody = document.createElement('div')
          newCardBody.className = "card-boddy p-4"
          const newCardTitle = document.createElement('h5')
          newCardTitle.className = "card-title";
          newCardTitle.innerHTML = achievements[achivement].title
          const newCardText = document.createElement('p')
          newCardText.className = "card-text"
          newCardText.innerHTML = achievements[achivement].desc
          newCardBody.append(newCardTitle, newCardText)
          new_col8.appendChild(newCardBody)
          new_row.append(new_col4, new_col8)
          newCard.append(new_row)
          newCol.appendChild(newCard)
          achivementRow.appendChild(newCol)})}})});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');
function logout(){
    fetch('/api/logout', {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials:'same-origin'
    }).then((res)=>{
        if (res.status==200) {
            window.location.href = "/logout"
        }
        else{
            alert("Not logged out!!")
        }
    })
}

