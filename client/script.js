import bot from './assets/bot.svg'
import user from './assets/user.svg'

// const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const form = document.querySelector('#chat_form');
const welcomeSection = document.querySelector('#welcome');


let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // Hide welcome section
    welcomeSection.style.display = 'none';

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://surya-codesense.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    // if (response.ok) {
    //     const data = await response.json();
    //     const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

    //     typeText(messageDiv, parsedData)
    // } else {
    //     const err = await response.text()

    //     messageDiv.innerHTML = "Something wrong"
    //     alert(err)
    // }
    if (response.ok) {
        try {
            const data = await response.json();
            const parsedData = data.bot; // No need to trim here
    
            if (parsedData) {
                typeText(messageDiv, parsedData);
            } else {
                messageDiv.innerHTML = "No response from the server";
            }
        } catch (error) {
            console.error("Error parsing JSON response:", error);
            messageDiv.innerHTML = "Error parsing server response";
        }
    } else {
        const errorMessage = await response.text();
        console.error("Server error:", errorMessage);
        messageDiv.innerHTML = "Server error: " + errorMessage;
    }
    
}

form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
})