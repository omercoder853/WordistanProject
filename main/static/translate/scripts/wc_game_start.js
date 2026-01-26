import { load_data,randomIndexCreater,timer } from "./game_utils.js";

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

function questionPrinter(q_index) {
    const word = questions[q_index].word
    const answer = questions[q_index].answer
    const letters_area = document.getElementById("letters_area")
    letters_area.replaceChildren()
    document.getElementById("question").innerHTML = word
    let i = 0;
    let is_answered;
    let is_true;
    Object.keys(user_answers).forEach(key => {
        if (key == q_index) {
            is_answered = true
            if (user_answers[key].is_true) {
                is_true = true;
            }
        }
    })
    for (const char of answer) {
        let input_id = "l" + i;
        const new_div = document.createElement('div')
        const new_input = document.createElement('input')
        new_input.maxLength = "1"
        new_input.className = "letter_input"
        new_input.id = input_id
        if (is_answered) {
            new_input.disabled = true
            if (is_true) {
                new_input.style.backgroundColor = "green"
                new_input.style.color = "white"
                new_input.value = user_answers[q_index].user_ans[i]
            }
            else {
                if (user_answers[q_index].user_ans[i]!="0") {
                    if (user_answers[q_index].user_ans[i].toLowerCase() == char.toLowerCase()) {
                        new_input.style.backgroundColor = "green"
                        new_input.style.color = "white"
                        new_input.value = user_answers[q_index].user_ans[i]
                    }
                    else {
                        new_input.style.backgroundColor = "red"
                        new_input.style.color = "white"
                        new_input.value = user_answers[q_index].user_ans[i]
                    }
                }
                else {
                    new_input.style.backgroundColor = "red"
                    new_input.style.color = "white"
                    new_input.value = "-"
                }   
            }
        }
        new_div.appendChild(new_input)
        new_div.className = "letter_div"
        letters_area.appendChild(new_div)
        i++;
    }
    document.querySelector(".letter_input").focus()
    const letter_inputs = document.querySelectorAll(".letter_input")
    letter_inputs.forEach(element => {
    element.addEventListener("input" , (e) => {
        if (e.target.value) {
            const current_id = parseInt(e.target.id.replace("l",""));
            const next_id = "l" + (current_id + 1)
            const next_input = document.getElementById(next_id)
            if (next_input) {
            next_input.focus()}
        }
    })
    element.addEventListener("keydown",(e)=>{
        if (e.key == "Backspace") {
            if (e.target.value === "") {
                const current_id = parseInt(e.target.id.replace("l",""));
                const back_id = "l" + (current_id - 1)
                const back_input = document.getElementById(back_id)
                if (back_input) {
                back_input.focus()}
            }
        }
    })
    
});
}

let current_index = 0;
function next_question() {
    current_index++;
    console.log("Next current index "+current_index)
    const number_questions = Object.keys(questions).length
    document.getElementById("counter").innerHTML = current_index + "/" + number_questions
    if (current_index <= number_questions) {
        if (current_index == number_questions) {
            document.getElementById("next_button").innerHTML = "Finish"
            document.getElementById("next_button").removeEventListener('click',next_question)
            document.getElementById("next_button").addEventListener('click',finish_game)
        }
        else {
            document.getElementById("next_button").style.visibility = "visible"
        }

        if (current_index == 1) {
            document.getElementById("past_button").style.visibility = "hidden"
        }
        else {
            document.getElementById("past_button").style.visibility = "visible"
        }

        const q_index = "q" + current_index
        questionPrinter(q_index)
        
    }
}

function past_question() {
    current_index--;
    console.log("Past current index "+current_index)
    const number_questions = Object.keys(questions).length
    document.getElementById("counter").innerHTML = current_index + "/" + number_questions
    if (current_index > 0) {
        if (current_index == 1) {
            document.getElementById("past_button").style.visibility = "hidden"
        }
        document.getElementById("next_button").style.visibility = "visible";
        document.getElementById("next_button").innerHTML = "Next";
        document.getElementById("next_button").addEventListener('click',next_question)
        const q_index = "q" + current_index
        questionPrinter(q_index)
    }
}

let user_answers = {};
function check_answer() {
    const letters = document.querySelectorAll(".letter_input")
    let user_answer = "";
    letters.forEach(letter => {
        if (letter.value!="") {
            user_answer += letter.value.toLowerCase()
        }
        else{user_answer += "0"}
    }); 
    const q_key = "q" + current_index
    const true_answer = questions[q_key].answer.toLowerCase()
    console.log("'" + user_answer.toLowerCase() + "'")
    console.log(q_key)
    console.log(true_answer)
    if (true_answer == user_answer) {
        letters.forEach(letter => {
            letter.style.backgroundColor = "green"
        });
        user_answers[q_key] = {
            is_true: true,
            user_ans: user_answer
        }
    }
    else {
        let i = 0;
        letters.forEach(letter => {
            if (letter.value.toLowerCase() == true_answer[i]) {
                letter.style.backgroundColor = "green"
                letter.style.color = "white"
            }
            else {
                letter.style.backgroundColor = "red"
                letter.style.color = "white"
            }
            i++;
        });
        user_answers[q_key] = { is_true: false, user_ans: user_answer }
    }
    console.log("user answer: " + user_answers[q_key].user_ans)
}

let true_answers = 0
let wrong_answers = 0
function finish_game() {
    clearInterval(interval_id)
    document.getElementById("game_area").style.display = "none"
    document.getElementById("game_result").style.display = "flex"
    document.getElementById("total_question").innerHTML = params.get('n_q');
    Object.keys(user_answers).forEach(key => {
        if (user_answers[key].is_true) {
            true_answers++;
        }
        else {wrong_answers++;}
    });
    document.getElementById("true_answers").innerHTML = true_answers
    document.getElementById("wrong_answers").innerHTML = wrong_answers
    document.getElementById("passed_questions").innerHTML = params.get('n_q') - true_answers - wrong_answers
    const remain_minutes = document.getElementById("minutes").textContent
    const remin_seconds = document.getElementById("seconds").textContent
    const remain_time = params.get("time") - parseInt(remain_minutes*60) - parseInt(remin_seconds)
    document.getElementById("time_passed").innerHTML = remain_time + " secs"
    document.getElementById("success").innerHTML = "% " + Math.floor(true_answers * 100  / params.get('n_q')) 
}

async function gameStarter() {
    await createQuestions();
    next_question()
}

// Timer
let interval_id;

// Burada js dosyasını 'module' olarak eklediğimiz için onclick fonksiyoları çalışmıyor. Bu nedenle eventListener ile ekliyoruz.
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("next_button").addEventListener("click" , next_question)
    document.getElementById("past_button").addEventListener("click" , past_question)
    document.getElementById("check_button").addEventListener("click",check_answer)
    document.getElementById("game_result").style.display = "none"
    gameStarter()
    interval_id = timer(params.get("time"),finish_game)
})

