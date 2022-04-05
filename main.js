let axios = require("axios");
let $ = require("jquery");

console.log(localStorage);

//Check local storage if there is a colot-theme saved
if(localStorage) {
    if(localStorage.getItem("colorTheme") === "dark") {
        $("body").addClass("dark");
        console.log("test")
        $(".darkButton").hide();
        $(".lightButton").show();
    } else {
        $(".lightButton").hide();
    }
}

$(".darkButton").on("click", ()=> {
    $(".darkButton").hide();
    $(".lightButton").show();
    $("body").addClass("transition");
    $("body").addClass("dark");
    localStorage.setItem("colorTheme", "dark");
});

$(".lightButton").on("click", ()=> {
    $(".lightButton").hide();
    $(".darkButton").show();
    $("body").addClass("transition");
    $("body").removeClass("dark");
    localStorage.setItem("colorTheme", "light");
});

let score;
let answerLog;

let startButton = $("#startButton");
let submitContainer = $(".submitContainer");
let questionContainer = $(".questionContainer");
let answeButtonContainer = $(".answeButtonContainer");
let messageContainer = $(".messageContainer");
let nextButtonContainer = $(".nextButtonContainer");
let nextQuestionButton = $(`<button id="nextQuestionButton">Next</button>`);
let playAgainButton = $(`<button id="playAgain">Play again</button>`);
let slider = document.getElementById("antalSpel");
let output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

let getData = async (url) => {
    let response = await axios.get(url, getQueries());
    return response.data;
}

let getQueries = () => {
    let amount = 10;
    let category = "";
    let difficulty = "easy";
    let type = "boolean";

    let parameters = {
        params: {
            amount: amount,
            category: category,
            difficulty: difficulty,
            type: type
        }
    }
    return parameters;
}

startButton.on("click", async (e) => {
    e.preventDefault();
    submitContainer.hide();
    score = 0;
    answerLog = [];
    let response = await getData("https://opentdb.com/api.php");
    printQuestions(response.results, 0);
});

let printQuestions = (questionsArray, questionCounter) => {
    if (questionCounter < questionsArray.length) {

        resetTexts();
        
        let { question, correct_answer, incorrect_answers } = removeHtmlEnteties(questionsArray[questionCounter]);
        let alternatives = [correct_answer, ...incorrect_answers].shuffle();

        questionContainer.append(`<p>Question ${questionCounter+1}<br />${question}</p>`);

        correctId = `btn${id()}`

        alternatives.forEach(answer => {
            let button = $('<button/>', {
                text: answer,
                id: answer === correct_answer ? correctId : `btn${id()}`,
                class: "answerButton",
                click: function () {
                    
                    $(".answerButton").prop("disabled", true);
                    $(`#${correctId}`).css("background-color", "green");

                    if (button.text() === correct_answer) { 
                        messageContainer.html(`${correct_answer} is correct!`);
                        score++;
                    } else {
                        button.css("background-color", "red");
                        messageContainer.html(`<p>${button.text()} is wrong!<br/>${correct_answer} was the right answer</p>`);
                    }

                    nextButtonContainer.append(nextQuestionButton);
                    logAnswer(question,button.text(), correct_answer);
                    nextQuestionButton.on("click", () => {
                        resetTexts();
                        printQuestions(questionsArray, questionCounter+1);
                    });
                }
            });

            answeButtonContainer.append(button);
            questionContainer.append(answeButtonContainer);
            
        });

    } else {
        resetTexts();
        messageContainer.html(`Your score was ${score}`);
        messageContainer.append(playAgainButton);
        playAgainButton.on("click", () => {
            resetTexts();
            submitContainer.show();
        });
        
    }

}

//This function gets called to shuffle the array of answers
Object.defineProperty(Array.prototype, "shuffle", {
    value: function() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

//Generates a random id
let id = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }

//This function pushes the last answered question to the log array
let logAnswer = (question, answer, correctAnswer) => {
    answerLog.push( {
        logggedQuestion: question,
        loggedAnswer: answer,
        loggedCorrectAnswer: correctAnswer
    });
}

let resetTexts = () => {
    questionContainer.html("");
    answeButtonContainer.html("");
    messageContainer.html("");
    nextButtonContainer.html("");
}

//Last two functions replaces html enteties from the API
let removeHtmlEnteties = (object) => {
    newIncorrectAnswers = object.incorrect_answers.map(answer => decodeHtml(answer));
    newObject = {
        question: decodeHtml(object.question),
        correct_answer: decodeHtml(object.correct_answer), 
        incorrect_answers: newIncorrectAnswers
    };
    return newObject;
}

let decodeHtml = (html) => {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
