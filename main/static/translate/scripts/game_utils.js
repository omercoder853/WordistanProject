export async function load_data(file_path) {
    try {
        const response = await fetch(file_path)
        if (!response.ok) throw new Error(`Hata: ${response.status}`)
        const words = await response.json()
        return words
    } catch (error) {
        console.error("Yükleme sırasında hata oluştu:", error)
        return null
    }
}

export function randomIndexCreater(target_words = null, length = null) {
    if (length != null) {
        const random_index = Math.floor(Math.random() * length)
        return random_index
    }
    if (target_words != null) {
        const random_index = Math.floor(Math.random() * target_words.length)
        return random_index
    }
}

export function timer(total_time,finish_game) {
    const time_counter = setInterval(() => {
        const minutes = Math.floor(total_time / 60)
        const seconds = total_time - minutes * 60
        if (seconds < 10) {
            document.getElementById("seconds").innerHTML = "0" + seconds;
        }
        else {
            document.getElementById("seconds").innerHTML = seconds;
        }
        if (minutes < 10) {
            document.getElementById("minutes").innerHTML = "0" + minutes;
        }
        else {
            document.getElementById("minutes").innerHTML = minutes;
        }
        total_time--;
        if (total_time < 0) {
            finish_game();
        }

    }, 1000);
    return time_counter
}