var axios = require("axios");
var $ = require("jquery");
var _ = require("underscore");

let score;

let startButton = $("#startButton");
let questionContainer = $(".questionContainer");
let messageContainer = $(".messageContainer");
let nextButtonContainer = $(".nextButtonContainer");
let nextQuestionButton = $(`<button id="nextQuestionButton">Next</button>`);

let getData = async (url) => {
    startButton.hide();
    score = 0;
    let response = await axios.get(url);
    return response.data;
}

startButton.on("click", async () => {
    let response = await getData("https://opentdb.com/api.php?amount=10");
    printQuestions(response.results, 0);
});

let printQuestions = (questionsArray, questionCounter) => {
    if (questionCounter < questionsArray.length) {

        resetTexts();

        let { question, correct_answer, incorrect_answers } = questionsArray[questionCounter];
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
        startButton.show();
    }

}

let resetTexts = () => {
    questionContainer.html("");
    messageContainer.html("");
    nextButtonContainer.html("");
}
