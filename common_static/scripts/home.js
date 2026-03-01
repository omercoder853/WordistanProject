function getCookie_main(name) {
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

const main_csrftoken = getCookie_main('csrftoken');

function logout_main(){
    fetch('api/logout', {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            'X-CSRFToken': main_csrftoken
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

document.addEventListener('DOMContentLoaded',()=>{
    const logoutButton = document.getElementById("logout-button")
    logoutButton.addEventListener('click',(event)=>{
        event.preventDefault();
        logout_main()
    })
})