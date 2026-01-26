const preview_data = {
    "game_type": null,
    "dict_type": null,
    "dict_value": null,
    "dict_name": null,
    "number_attach": null,
    "number_questions": null,
    "time": null
}

const game_types = document.querySelectorAll(".game_type")
game_types.forEach(game_type => {
    game_type.addEventListener('click', (e) => {
        preview_data.game_type = game_type.id
        console.log(preview_data.game_type)
        progress_bar_increaser(341)
        const game_kind = document.getElementById("game_kind")
        game_kind.style.display = "none"
        document.getElementById("game-words").style.display = "block"
        document.getElementById("next1").onclick = next_fn1
    })
})

function progress_bar_increaser(current_width) {
    const progress_bar = document.getElementById("progress")
    if (current_width == 341) {
        progress_bar.style.backgroundColor = "red"
    }
    else if (current_width == 682) {
        progress_bar.style.backgroundColor = "#EDB445"
    }
    else if (current_width == 1023) {
        progress_bar.style.backgroundColor = "green"
    }
    progress_bar.style.width = `${current_width}px`
    progress_bar.innerHTML = `${current_width / 341} / 3`
}

function progress_bar_decreaser(current_width) {
    const progress_bar = document.getElementById("progress")
    if (current_width - 341 == 0) {
        progress_bar.style.backgroundColor = "red"
    }
    else if (current_width - 341 == 341) {
        progress_bar.style.backgroundColor = "#EDB445"
    }
    progress_bar.style.width = `${current_width}px`
    progress_bar.innerHTML = `${current_width / 341} / 3`
}

// Preview table datas
const game_kind = document.getElementById("game_kind_table")
const dict_type = document.getElementById("dict_type")
const dict_name = document.getElementById("dict_name")
const num_questions_table = document.getElementById("num_questions_table")
const num_attach_table = document.getElementById("num_attach_table")
const time_table = document.getElementById("time_table")
const attach = document.getElementById("attach")

function next_fn1() {
    const first_check = document.querySelector('input[name="dict_type_choice"]:checked')
    const second_check = document.querySelector('input[name="dict_choices"]:checked')
    if (first_check && second_check) {
        preview_data.dict_type = first_check.value
        preview_data.dict_value = second_check.value
        preview_data.dict_name = document.querySelector(`label[for="${second_check.id}"]`).textContent
        progress_bar_increaser(682)
        document.getElementById(`game-words`).style.display = "none"
        document.getElementById("game-settings").style.display = "block"
        const game_name = document.getElementById("game_name")
        const attach_name = document.getElementById("attach_name")
        switch (preview_data.game_type) {
            case "mcq":
                game_name.innerHTML = "MCQ"
                attach_name.innerHTML = "Options"
                break;
            case "wc":
                game_name.innerHTML = "WC"
                attach_name.innerHTML = "Tips"
                break;
            case "mp":
                game_name.innerHTML = "MP"
                attach_name.innerHTML = "Questions per Page"
            default:
                break;
        }
        document.getElementById("num_questions").value = ""
        document.getElementById("num_attach").value = ""
        document.getElementById("num_second").value = ""
    }
    else{
        const labels = document.querySelectorAll('#radio_buttons label, #choices label');
        labels.forEach(label => label.classList.add('error-shake'));
        setTimeout(() => {
            labels.forEach(label => label.classList.remove('error-shake'));
        }, 600);
    }
}

function back_fn1() {
    progress_bar_decreaser(0)
    const radio_buttons = document.querySelectorAll(".dict_type_radio")
    radio_buttons.forEach(radio => {
        radio.checked = false
    });
    choices.replaceChildren();
    document.getElementById("game-words").style.display = "none"
    document.getElementById("game_kind").style.display = "block"
}

function next_fn2() {
    const num_attach = document.getElementById("num_attach").value
    const num_question = document.getElementById("num_questions").value
    const second = document.getElementById("second").value
    if (!isNaN(num_attach) && !isNaN(num_question) && !isNaN(second)) {
        preview_data.number_attach = num_attach
        preview_data.number_questions = num_question
        preview_data.time = second
        progress_bar_increaser(1023)
        document.getElementById("game-settings").style.display = "none"
        document.getElementById("game-prev").style.display = "block"
        switch (preview_data.game_type) {
            case "mcq":
                game_kind.textContent = "Multiple Choice Quiz"
                attach.innerHTML = "Options"
                break;
            case "wc":
                game_kind.textContent = "Word Completion"
                attach.innerHTML = "Tips"
            case "mp":
                game_kind.textContent = "Matching Pairs"
                attach.innerHTML = "Questions per Page"
            default:
                break;
        }
        switch (preview_data.dict_type) {
            case "cl":
                dict_type.textContent = "Collection Dictionary"
                break;

            default:
                break;
        }
        dict_name.textContent = preview_data.dict_name
        num_questions_table.textContent = preview_data.number_questions
        num_attach_table.textContent = preview_data.number_attach
        time_table.textContent = preview_data.time + " seconds per question | Total time: " + preview_data.time * preview_data.number_questions + " seconds"
    }

}

function back_fn2() {
    progress_bar_decreaser(341)
    document.getElementById("game-settings").style.display = "none"
    document.getElementById("game-words").style.display = "block"
}

function back_fn3() {
    progress_bar_decreaser(682)
    document.getElementById("game-settings").style.display = "block"
    document.getElementById("game-prev").style.display = "none"
}

function start_game() {
    console.log(preview_data)
    const url = `/game_start/game_type=${preview_data.game_type}/?dict_name=${encodeURIComponent(preview_data.dict_name)}&dict_value=${preview_data.dict_value}&time=${preview_data.number_questions * preview_data.time}&n_q=${preview_data.number_questions}&n_a=${preview_data.number_attach}`;
    console.log(url)
    window.location.href = url;
}

const radio_buttons = document.getElementById("radio_buttons");
const choices = document.getElementById("choices");

radio_buttons.addEventListener('change', function (event) {
    choices.innerHTML = '';

    if (event.target.value === "pr") {
        console.log("pr clicked");

    }
    else if (event.target.value === "cl") {
        const dicts = ["fruitsVegetables", "animals", "places"];
        const names = ["Fruits and Vegetables", "Animals", "Environment and Places"];

        for (let i = 0; i < dicts.length; i++) {
            const new_p = document.createElement('p')
            new_p.classList.add('p_radio')
            const new_rb = document.createElement("input");
            new_rb.type = "radio";
            new_rb.name = "dict_choices";
            new_rb.value = dicts[i];
            new_rb.id = `dict_choice_${i}`;

            const new_label = document.createElement("label");
            new_label.htmlFor = `dict_choice_${i}`;
            new_label.textContent = names[i];
            new_p.appendChild(new_rb)
            new_p.appendChild(new_label)
            choices.appendChild(new_p);
        }
    }
});
