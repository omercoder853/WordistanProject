// CSRF token alma (Django)
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
// Sözlük verisini tutacak dizi
let source_dictionary = [];

// Sayfa yüklendiğinde otomatik çalışır
window.addEventListener("DOMContentLoaded", () => {
  // JSON dosyasını yükle 
  fetch(json_url)
    .then(response => {
      if (!response.ok) throw new Error("Dosya yüklenemedi!");
      return response.json();
    })
    .then(data => {
      source_dictionary = data;
      console.log("Sözlük yüklendi:", source_dictionary.length, "kelime");
    })
    .catch(error => {
      console.error("Bir hata oluştu:", error);
    });
});

// Butona ilk tıklandığında dil seçimi
function ConvertButton() {
  const result_area = document.querySelector(".result_area");
  const sign = document.getElementById("lang").value;
  if (sign) {
    result_area.style.display = "flex";
    find_the_word(sign);
  }
  else {
    const select_box = document.getElementById("lang");
    select_box.classList.add("error")
  }
}

const select_box = document.getElementById("lang");
const input_word = document.getElementById("word_input");
const data_list_matchwords = document.getElementById("match_words");

select_box.addEventListener('change', (event) => {
  select_box.style.color = "black"
  select_box.classList.remove("error")
})

input_word.addEventListener("input", () => {
  data_list_matchwords.innerHTML = "";
  const last_input = input_word.value.trim();

  if (select_box.value === "") return; // hiç dil seçilmemişse çık
  if (last_input === "") return; // input boşsa çık

  let matched_words = [];
  if (select_box.value === "trToen") {
    matched_words = source_dictionary.filter(item =>
      item.tr.startsWith(last_input)
    );
  } else if (select_box.value === "enTotr") {
    matched_words = source_dictionary.filter(item =>
      item.en.startsWith(last_input)
    );
  }

  const list_items = matched_words.slice(0, 4);
  for (let i = 0; i < list_items.length; i++) {
    const option = document.createElement("option");
    option.value = select_box.value === "trToen" ? list_items[i].tr : list_items[i].en;
    data_list_matchwords.appendChild(option);
  }
});

// Kelimeyi sözlükte aratma ve bulunursa değerini ekranda gösterme
function find_the_word(lang) {
  let word = document.getElementById("word_input").value.trim();
  if (lang == "trToen") {
    let result = source_dictionary.find(item => item.tr === word);
    if (result) {
      document.getElementById("result").innerHTML = result.en;
      document.getElementById("addMyDict").style.display = "flex";

    }
    else {
      document.getElementById("result").innerHTML = "Result not found!";
    }
  }
  else if (lang == "enTotr") {
    let result = source_dictionary.find(item => item.en === word);
    if (result) {
      document.getElementById("result").innerHTML = result.tr;
      document.getElementById("addMyDict").style.display = "flex";
    }
    else {
      document.getElementById("result").innerHTML = "Result not found!";
    }
  }
  else {
    document.getElementById("result").innerHTML = "Result not found!";
  }
}

function addDictClose() {
  const addingPage = document.getElementById("addDict");
  const main_page = document.getElementById("main_page");
  const result_area = document.querySelector(".result_area");
  result_area.style.display = "none"

  main_page.style.gridTemplateColumns = "1fr"
  addingPage.style.display = "none";
}

function addMyDict() {
  const main_page = document.getElementById("main_page");
  main_page.style.gridTemplateColumns = "1fr 1fr";

  const childrens_main = main_page.children;
  for (let i = 0; i < childrens_main.length; i++) {
    childrens_main[i].style.gridColumn = "1";
  }
  const addingPage = document.getElementById("addDict")
  addingPage.style.gridColumn = "2"
  addingPage.style.display = "block"

  document.getElementById("word").value = document.getElementById("word_input").value
  document.getElementById("translation").value = document.getElementById("result").textContent
  const translation_direction = document.getElementById("lang").value
  fetch('/api/dictionaries/')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Loaded dictionaries from database:', data);
      if (data.error) {
        console.error('Error:', data.error);
        alert('Error loading dictionaries: ' + data.error);
        return;
      }
      if (data.length === 0) {
        console.log('No dictionaries found in database');
      } else {
        console.log(`Rendering ${data.length} dictionary(ies) from database`);
        if (translation_direction == "trToen") {
          data.forEach(dict => {
            if (dict.language == 'TR to ENG') {
              const dict_option = document.createElement('option');
              dict_option.value = dict.id;
              dict_option.text = dict.name;
              const dicts = document.getElementById('dicts');
              dicts.appendChild(dict_option);
            }
          });
        }
        if (translation_direction == "enTotr") {
          data.forEach(dict => {
            if (dict.language == 'ENG to TR') {
              const dict_option = document.createElement('option');
              dict_option.value = dict.id;
              dict_option.text = dict.name;
              const dicts = document.getElementById('dicts');
              dicts.appendChild(dict_option);
            }
          });
        }
      }
    })
    .catch(error => {
      console.error('Error loading dictionaries:', error);
    });
}

function saveButton() {
  const dicts = document.getElementById("dicts");
  const seleceted_index = dicts.selectedIndex;
  const word = document.getElementById("word").value;
  const meaning = document.getElementById("translation").value;
  const dict_id = document.getElementById("dicts").value;
  const dict_name = document.getElementById("dict_name");
  dict_name.innerHTML = dicts.options[seleceted_index].textContent;
  const base_url_data = document.getElementById("baseurl-data")
  const base_url = JSON.parse(base_url_data.textContent)
  const seeDictButton = document.getElementById("seeDict");
  seeDictButton.href = base_url.replace('0', dict_id)
  console.log("The word: " + word);
  console.log("The meaning: " + meaning);
  console.log("The dict id: " + dict_id);
  addWord(word, meaning, dict_id)
}

function addWord(word, meaning, dict_id) {
  if (!word || !meaning || !dict_id) {
    alert('Please fill all required fields');
    return false;
  }

  fetch('/api/words/add/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({ dict_id, word, meaning })
  })
    .then(res => {
      console.log('Save response status:', res.status);
      if (!res.ok) {
        return res.json().then(data => {
          console.error('Save error response:', data);
          throw new Error(data.error || 'Failed to adding word');
        });
      }
      return res.json();
    })
    .then(data => {
      console.log('Word added succesfully:', data);

    })
    .catch(error => {
      console.error('Error adding word:', error);
      alert('Error adding word: ' + error.message);
    });

  return true;
}







