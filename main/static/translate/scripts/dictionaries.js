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

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadAndRenderDictionaries();

    // ESC tuşu ile formu kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const addNewDictPage = document.getElementById("add_New_Dict");
            if (addNewDictPage && addNewDictPage.style.display === 'block') {
                closeForm();
            }
        }
    });

    // Form submit olduğunda
    const form = document.querySelector('#add_New_Dict form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveDictionary();
        });
    }
});

// Backend'den sözlükleri fetch edip render et
function loadAndRenderDictionaries() {
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
                showDefaultPage();
                return;
            }
            if (data.length === 0) {
                console.log('No dictionaries found in database');
                showDefaultPage();
            } 
            else {
                console.log(`Rendering ${data.length} dictionary(ies) from database`);
                renderDictionaries(data);
            }
        })
        .catch(error => {
            console.error('Error loading dictionaries:', error);
            showDefaultPage();
        });
}

// Default page göster
function showDefaultPage() {
    const defaultPage = document.querySelector('.default_dict_page');
    const trySection = document.getElementById('try');
    if (defaultPage) defaultPage.classList.remove('hide');
    if (trySection) trySection.classList.remove('show');
}

// Sözlükleri ekrana render et
function renderDictionaries(data) {
    const listContainer = document.getElementById('dictionaries_list');
    const defaultPage = document.querySelector('.default_dict_page');
    const trySection = document.getElementById('try');

    listContainer.innerHTML = '';
    if (defaultPage) defaultPage.classList.add('hide');
    if (trySection) trySection.classList.add('show');

    data.forEach((dict, index) => {
        const listItem = createDictionaryItem(dict, index);
        listContainer.appendChild(listItem);
    });
}

// Tek bir dictionary item oluştur
function createDictionaryItem(dict, index) {
    const item = document.createElement('div');
    item.className = 'list-group-item list-group-item-action';
    item.dataset.dictId = dict.id;
    if (index === 0) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'true');
    }

    // Tarih parse et - Django'dan gelen ISO format string'i
    const date = dict.created_at ? new Date(dict.created_at) : new Date();
    const formattedDate = formatDate(date);

    // Silme butonu
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-dict-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.setAttribute('aria-label', 'Delete dictionary');
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteDictionary(dict.id);
    };

    // Dict details button
    const dict_details_button = document.createElement('a');
    dict_details_button.type = 'button';
    dict_details_button.className = 'dict_details';
    const base_url_data = document.getElementById("baseurl-data")
    const base_url = JSON.parse(base_url_data.textContent)
    dict_details_button.href = base_url.replace('0',dict.id)
    dict_details_button.innerHTML = 'Open the Dict';

    item.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-start">
            <div class="dict-content">
                <h5 class="mb-1 dict-name">${escapeHtml(dict.name)}</h5>
                <p class="mb-1 dict-description">${escapeHtml(dict.description || 'No description provided')}</p>
                <small class="dict-language">Translation Direction: ${escapeHtml(dict.language || 'Not specified')}</small>
                <p class = "dict-id" hidden>${dict.id}</p>
            </div>
            <small class="dict-date">Last Check: ${formattedDate}</small>
        </div>
    `;

    item.appendChild(deleteBtn);
    item.appendChild(dict_details_button)
    return item;
}

// Sözlük silme
function deleteDictionary(dictId) {
    if (!confirm('Are you sure you want to delete this dictionary?')) return;

    fetch(`/api/dictionaries/${dictId}/delete/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                throw new Error(data.error || 'Failed to delete dictionary');
            });
        }
        return res.json();
    })
    .then(() => {
        loadAndRenderDictionaries(); // listeyi yeniden yükle
    })
    .catch(error => {
        console.error('Error deleting dictionary:', error);
        alert('Error deleting dictionary: ' + error.message);
    });
}

// Form açma
function addNewDict() {
    const addNewDictPage = document.getElementById("add_New_Dict");
    const form = document.querySelector('#add_New_Dict form');
    if (form) form.reset();

    let overlay = document.querySelector('.form-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'form-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeForm);
    }

    overlay.style.display = 'block';
    addNewDictPage.style.display = "block";

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
}

// Form kapatma
function closeForm() {
    const addNewDictPage = document.getElementById("add_New_Dict");
    const overlay = document.querySelector('.form-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            addNewDictPage.style.display = 'none';
        }, 300);
    } else {
        addNewDictPage.style.display = 'none';
    }
}

// Sözlük ekleme
function saveDictionary() {
    const nameInput = document.getElementById('dict_name');
    const descInput = document.getElementById('dict_descrpt');
    const langRadio = document.querySelector('input[name="translation_direction"]:checked');

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const language = langRadio ? langRadio.value : 'TR to ENG';

    if (!name || !langRadio) {
        alert('Please fill all required fields');
        return false;
    }

    fetch('/api/dictionaries/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({name, description, language})
    })
    .then(res => {
        console.log('Save response status:', res.status);
        if (!res.ok) {
            return res.json().then(data => {
                console.error('Save error response:', data);
                throw new Error(data.error || 'Failed to create dictionary');
            });
        }
        return res.json();
    })
    .then(data => {
        console.log('Dictionary saved successfully:', data);
        closeForm();
        loadAndRenderDictionaries();
    })
    .catch(error => {
        console.error('Error saving dictionary:', error);
        alert('Error saving dictionary: ' + error.message);
    });

    return true;
}

// Tarih formatlama
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    else if (diffDays === 1) return 'Yesterday';
    else if (diffDays < 7) return `${diffDays} days ago`;
    else if (diffDays < 30) return `${Math.floor(diffDays/7)} week${Math.floor(diffDays/7) > 1 ? 's' : ''} ago`;
    else return date.toLocaleDateString();
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}





