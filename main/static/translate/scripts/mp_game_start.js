import { load_data, randomIndexCreater, timer } from "./game_utils.js";

const params = new URLSearchParams(window.location.search);

document.getElementById("dict_name").innerHTML = params.get("dict_name")
const coll_name = params.get("dict_value")
const file_path = "/static/translate/json/collections/" + coll_name + ".json"

let questions = {};
async function createQuestions() {
    const words = await load_data(file_path)
    let used_indexes = new Set()
    for (let i = 0; i < params.get("n_q"); i++) {
        let random_index;
        const q_key = "q" + (i + 1)
        questions[q_key] = {
            word: "",
            answer: ""
        }
        do {
            random_index = randomIndexCreater(words)
        } while (used_indexes.has(random_index));

        used_indexes.add(random_index)
        const randomWord = words[random_index]
        questions[q_key].word = randomWord["tr"]
        questions[q_key].answer = randomWord["en"]
    }
}
const total_parts = Math.ceil(parseInt(params.get("n_q")) / parseInt(params.get("n_a")))
let part_counter = 0;
const remainder = parseInt(params.get("n_q")) % parseInt(params.get("n_a"))
const questions_per_page = params.get("n_a")
console.log("questions per page : " + questions_per_page + " total parts: " + total_parts + " remainder: " + remainder)

let part_answers = {}
for (let i = 1; i <= total_parts; i++) {
    part_answers[i] = [];
    
}

function questionPrinter(with_remainder=null) {
    console.log(part_answers)
    const words_column = document.getElementById("words_column")
    const answers_column = document.getElementById("answers_column")
    words_column.replaceChildren();
    answers_column.replaceChildren();
    let loop_counter;
    if (with_remainder) {
        loop_counter = remainder
    }
    else {
        loop_counter = questions_per_page
    }
    // her grubun ilk elemanı hangi indeksle başlıyor ? 
    let start_q_index = ((part_counter - 1) * questions_per_page) + 1;
    let part_questions = []
    let random_index;
    let used_indexes = new Set();
    for (let i = 0; i < loop_counter; i++) {
        const q_key = "q" + start_q_index
        part_questions.push(questions[q_key].word)
        do {
            random_index = randomIndexCreater(null, loop_counter)
        } while (used_indexes.has(random_index));
        if (!part_answers[part_counter][random_index]) {
            used_indexes.add(random_index)
            part_answers[part_counter][random_index] = questions[q_key].answer
        }
        start_q_index++;
    }
    let start_q_index1 = ((part_counter - 1) * questions_per_page) + 1;
    for (let i = 0; i < loop_counter; i++) {
        const new_word = document.createElement('button')
        const new_answer = document.createElement('button')
        new_word.classList.add("word_option")
        new_answer.classList.add("answer_option")
        new_word.id = "q" + start_q_index1
        new_word.addEventListener('click',option_chosen)
        new_answer.addEventListener('click',answer_chosen)
        new_answer.id = "a" + start_q_index1
        new_answer.disabled = true
        new_word.innerHTML = part_questions[i];
        new_answer.innerHTML = part_answers[part_counter][i];
        words_column.appendChild(new_word)
        answers_column.appendChild(new_answer)
        start_q_index1++;
    }
    if (part_counter==1) {
        document.getElementById("past_button").style.visibility = "hidden"
    }
    else if (part_counter==total_parts) {
        const next_button= document.getElementById("next_button")
        next_button.innerHTML = "Finish";
        next_button.removeEventListener('click',next_question);
        next_button.addEventListener('click',finish_game)
    }
    else{
        document.getElementById("past_button").style.visibility = "visible"
    }
    const words = document.querySelectorAll(".word_option")
    const answers = document.querySelectorAll(".answer_option")
    words.forEach(word => {
        chosen_options[part_counter].forEach(chosen_word => {
            if (word.id == chosen_word) {
                word.classList.add("clicked")
                word.disabled = true
            }
        })
    });
    answers.forEach(answer => {
        chosen_answers[part_counter].forEach(chosen_answer => {
            if (answer.id ==chosen_answer) {
                answer.classList.add("success")
                answer.disabled = true
            }
        });
    })
}

function next_question()
{
    part_counter++;
    document.getElementById("counter").innerHTML = part_counter + "/" + total_parts
    if (part_counter<total_parts) {
        questionPrinter()
    }
    // if it is the last part
    else if (part_counter==total_parts) {
        // if we have no remainder , work normally
        if (remainder==0) {
            questionPrinter()
        }
        //if we have remainder , then use remainder bcz this is the last part
        else
        {
            questionPrinter(true)
        }
    }
    else{
        console.log("part is finished")
    }
    
}
function past_question()
{
    part_counter = part_counter - 1
    document.getElementById("counter").innerHTML = part_counter + "/" + total_parts
    const next_button= document.getElementById("next_button")
    next_button.innerHTML = "Next";
    next_button.removeEventListener('click',finish_game);
    next_button.addEventListener('click',next_question)
    questionPrinter()
}
let chosen_id;
function option_chosen(e) {
    chosen_id = "";
    const clicked_button = e.target;
    chosen_id = clicked_button.id;
    console.log(chosen_id);
    const word_options = document.querySelectorAll(".word_option")
    const answer_options = document.querySelectorAll(".answer_option")
    if (clicked_button.classList.contains("clicked")) {
        clicked_button.classList.remove("clicked")
        undisabled_maker(word_options)
        disabled_maker(answer_options)
        disabled_maker(chosen_options[part_counter],null,true)
    }
    else{
        clicked_button.classList.add("clicked")
        disabled_maker(word_options,clicked_button)
        undisabled_maker(answer_options)
        disabled_maker(chosen_answers[part_counter],null,true)
    }
}
let chosen_options = {};
let chosen_answers = {};
for (let i = 1; i <= total_parts; i++) {
    chosen_options[i] = []
    chosen_answers[i] = []
}
let total_try = 0;
function answer_chosen(e) {
    total_try++;
    const word_option_clicked = document.getElementById(chosen_id)
    const clicked_answer = e.target
    const answer_value = clicked_answer.textContent
    const word_options = document.querySelectorAll(".word_option")
    const answer_options = document.querySelectorAll(".answer_option")
    disabled_maker(answer_options,clicked_answer)
    if (questions[chosen_id].answer==answer_value) {
        chosen_options[part_counter].push(word_option_clicked.id)
        chosen_answers[part_counter].push(clicked_answer.id)
        clicked_answer.classList.add("success")
        setTimeout(() => {
            disabled_maker(answer_options)
            undisabled_maker(word_options)
            disabled_maker(chosen_options[part_counter],null,true)
        }, 500);
    }
    else{
        clicked_answer.classList.add("wrong")
        setTimeout(() => {
            clicked_answer.classList.remove("wrong")
            undisabled_maker(answer_options)
        }, 500);
    }
}
function disabled_maker(elements,target_element=null,is_id=false)
{
    if (is_id) {
        elements.forEach(element => {
            const elmnt = document.getElementById(element)
            elmnt.disabled = true
        });
        
    }
    else{
        elements.forEach(element => {
    if (target_element) {
        if (element!=target_element) {
            element.disabled = true
        }
        else{
            element.disabled = false
        }
    }
    else{
        element.disabled = true
    }});
    }
    
}
function undisabled_maker(elements,target_element=null)
{
    elements.forEach(element => {
    if (target_element) {
        if (element!=target_element) {
            element.disabled = false
        }
        else{
            target_element.disabled = true
        }}

    else{
        element.disabled = false
    }});
}

function finish_game() {
    clearInterval(interval_id)
    document.getElementById("game_area").style.display = "none"
    document.getElementById("game_result").style.display = "flex"
    document.getElementById("total_question").innerHTML = params.get("n_q")
    document.getElementById("total_try").innerHTML = total_try;
    const remain_min = document.getElementById("minutes").textContent
    const remain_sec = document.getElementById("seconds").textContent
    const time_passed = params.get("time") - remain_min*60 - remain_sec
    document.getElementById("time_passed").innerHTML = time_passed + " sec"
    document.getElementById("success").innerHTML = "%" + Math.floor( params.get('n_q') / total_try  * 100)
}

async function gameStarter() {
    await createQuestions();
    next_question()
}

//Timer
let interval_id;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("game_result").style.display = "none"
    document.getElementById("game_area").style.display = "flex"
    document.getElementById("next_button").addEventListener("click", next_question)
    document.getElementById("past_button").addEventListener("click", past_question)
    gameStarter()
    console.log(questions)
    interval_id = timer(params.get("time"), finish_game)
})