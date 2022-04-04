let axios = require("axios");
let $ = require("jquery");

if(localStorage) {
    if(localStorage.getItem("colorTheme") === "dark") {
        $("body").addClass("dark");
        $(".darkButton").hide();
        $(".lightButton").show();
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

let startButton = $("#startButton");
let submitContainer = $(".submitContainer");
let questionContainer = $(".questionContainer");
let messageContainer = $(".messageContainer");
let nextButtonContainer = $(".nextButtonContainer");
let nextQuestionButton = $(`<button id="nextQuestionButton">Next</button>`);
let slider = document.getElementById("antalSpel");
let output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}

let getData = async (url) => {
    submitContainer.hide();
    score = 0;
    let response = await axios.get(url);
    return response.data;
}

startButton.on("click", async (e) => {
    e.preventDefault();
    let response = await getData("https://opentdb.com/api.php?amount=10");
    printQuestions(response.results, 0);
});

let printQuestions = (questionsArray, questionCounter) => {
    if (questionCounter < questionsArray.length) {

        resetTexts();
        
        let { question, correct_answer, incorrect_answers } = removeHtmlEnteties(questionsArray[questionCounter]);
        let alternatives = [correct_answer, ...incorrect_answers];

        questionContainer.append(`<p>Question ${questionCounter+1}<br />${question}</p>`);

        alternatives.forEach(answer => {
            let button = $('<button/>', {
                text: answer,
                id: answer === correct_answer ? `btnCorrect` : `btnWrong`,
                class: "answerButton",
                click: function () {
                    
                    $(".answerButton").prop("disabled", true);
                    $("#btnCorrect").css("background-color", "green");

                    if (button.text() ===correct_answer) { 
                        messageContainer.html(`${correct_answer} is correct!`);
                        score++;
                    } else {
                        button.css("background-color", "red");
                        messageContainer.html(`<p>${button.text()} is wrong!<br/>${correct_answer} was the right answer</p>`);
                    }

                    nextButtonContainer.append(nextQuestionButton);
                    nextQuestionButton.on("click", () => {
                        printQuestions(questionsArray, questionCounter+1);
                    });
                }
            });

            questionContainer.append(button);
        });

    } else {
        resetTexts();
        messageContainer.html(`Your score was ${score}`);
        submitContainer.show();
    }

}

let resetTexts = () => {
    questionContainer.html("");
    messageContainer.html("");
    nextButtonContainer.html("");
}

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