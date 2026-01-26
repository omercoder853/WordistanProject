import { randomIndexCreater,load_data,timer } from "./game_utils.js";

const params = new URLSearchParams(window.location.search);

document.getElementById("dict_name").innerHTML = params.get("dict_name")
const coll_name = params.get("dict_value")
const file_path = "/static/translate/json/collections/" + coll_name + ".json"

function optionCreater(words, answer_index) {
    let options = []
    let used_indexes = new Set()
    let used_option_index = new Set()
    used_indexes.add(answer_index)
    let random_option_index = randomIndexCreater(null, params.get("n_a"))
    options[random_option_index] = words[answer_index]["en"]
    used_option_index.add(random_option_index)
    for (let i = 0; i < params.get("n_a") - 1; i++) {
        let random_index;
        let random_option_index;
        do {
            random_index = randomIndexCreater( words, null)
        } while (used_indexes.has(random_index));

        used_indexes.add(random_index)

        do {
            random_option_index = randomIndexCreater(null, params.get("n_a"))
        } while (used_option_index.has(random_option_index));

        used_option_index.add(random_option_index)

        options[random_option_index] = words[random_index]["en"]
    }
    return options
}
let questions = {};
async function createQuestions() {
    const words = await load_data(file_path)
    let used_indexes = new Set()
    for (let i = 0; i < params.get("n_q"); i++) {
        let random_index;
        const q_key = "q" + (i + 1)
        questions[q_key] = {
            word: "",
            options: [],
            answer: ""
        }
        do {
            random_index = randomIndexCreater(words)
        } while (used_indexes.has(random_index));

        used_indexes.add(random_index)
        const randomWord = words[random_index]
        questions[q_key].word = randomWord["tr"]
        questions[q_key].answer = randomWord["en"]
        questions[q_key].options = optionCreater(words, random_index)
    }
}
function questionPrinter(q_index) {
    document.querySelector(".question").innerHTML = questions[q_index].word
    document.querySelector(".question").id = q_index
    const options = questions[q_index].options
    const option_area = document.getElementById("options")
    option_area.replaceChildren()
    options.forEach(option => {
        const new_option = document.createElement('button')
        new_option.className = "option"
        new_option.innerHTML = option
        if (option == questions[q_index].answer) {
            new_option.value = "true";
        }
        new_option.addEventListener("click" , check_answer)
        option_area.appendChild(new_option)
    });

    Object.keys(user_answers).forEach(key => {
        const options = document.querySelectorAll(".option")
        if (key==q_index) {
            if (user_answers[q_index].is_true) {
                options.forEach(option => {
                    if (option.value == "true") {
                        option.className = "true_answer"
                    }
                    option.disabled = true
                })
            }
            else
            {
                options.forEach(option => {
                    if (option.value == "true") {
                        option.className = "true_answer"
                    }
                    if (option.textContent == user_answers[q_index].user_answer)
                    {
                        option.className = "wrong_answer"
                    }
                    option.disabled = true
                })
            }
        }
    })
}

let user_answers = {};
let current_index = 0;

function next_question() {
    const number_questions = Object.keys(questions).length
    current_index++;
    document.getElementById("counter").innerHTML = current_index + "/" + number_questions
    if (current_index <= number_questions) {
        if (current_index == number_questions) {
            document.getElementById("next_button").innerHTML = "Finish"
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
    const number_questions = Object.keys(questions).length
    current_index--;
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
function check_answer(e) {
    const question_id = document.querySelector(".question").id
    const target_button = e.target
    const value = target_button.value
    const answer = target_button.textContent
    const other_options = document.querySelectorAll(".option")
    if (value == "true") {
        target_button.className = "true_answer"
        other_options.forEach(btn => {
            btn.disabled = true
            user_answers[question_id] = {
                is_true : true,
            }
        });
    }
    else {
        target_button.className = "wrong_answer"
        other_options.forEach(btn => {
            if (btn.value == "true") {
                btn.className = "true_answer"
            }
            btn.disabled = true
            user_answers[question_id] = {
                is_true : false,
                user_answer : answer
            }
        });
    }
}

function finish_game() {
    clearInterval(interval_id)
    document.getElementById("game_area").style.display = "none"
    document.getElementById("game_result").style.display = "flex"
    const number_questions = Object.keys(questions).length
    let true_answers = 0;
    Object.keys(user_answers).forEach(key => {
        if (user_answers[key].is_true) {
            true_answers++;
        }
    });
    const passed = number_questions - Object.keys(user_answers).length
    const wrong = number_questions - true_answers - passed
    document.getElementById("total_question").innerHTML = number_questions
    document.getElementById("true_answers").innerHTML = true_answers
    document.getElementById("wrong_answers").innerHTML = wrong
    document.getElementById("passed_questions").innerHTML = passed
    const remain_min = document.getElementById("minutes").textContent
    const remain_sec = document.getElementById("seconds").textContent
    const time_passed = params.get("time") - remain_min*60 - remain_sec
    document.getElementById("time_passed").innerHTML = time_passed + " sec"
    document.getElementById("success").innerHTML = Math.floor(100*true_answers/number_questions) + "%"

}

async function gameStarter() {
    await createQuestions();
    next_question()
}

/*document.getElementById("true_answers_area").addEventListener('mouseenter', function() {
    document.getElementById("mascot").src = window.staticImages.happy
    setTimeout(()=>{
        document.getElementById("mascot").src = window.staticImages.base
    },2000)
})
document.getElementById("wrong_answers_area").addEventListener('mouseenter', function() {
    document.getElementById("mascot").src = window.staticImages.sad
    setTimeout(()=>{
        document.getElementById("mascot").src = window.staticImages.base
    },2000)
})
document.getElementById("passed_questions_area").addEventListener('mouseenter', function() {
    document.getElementById("mascot").src = window.staticImages.excited
    setTimeout(()=>{
        document.getElementById("mascot").src = window.staticImages.base
    },2000)
})*/


// Timer
let interval_id; 

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("game_result").style.display = "none"
    document.getElementById("next_button").addEventListener("click" , next_question)
    document.getElementById("past_button").addEventListener("click" , past_question)
    gameStarter()   
    interval_id = timer(params.get("time"),finish_game)
})
