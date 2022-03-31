var axios = require("axios");
var $ = require("jquery");

let score;

let button = $("#startButton");
let questionContainer = $(".questionContainer");

let getData = async (url) => {
    button.hide();
    score = 0;
    let response = await axios.get(url);
    return response.data;
}

button.on("click", async () => {
    let questionsObject = await getData("https://opentdb.com/api.php?amount=10");
    questionsArray = questionsObject.results;
    printQuestions(questionsArray, 0);
});

let printQuestions = async (questionsArray, questionCounter) => {
    if (questionCounter < questionsArray.length) {
        questionContainer.html("");

        let { question, correct_answer, incorrect_answers } = questionsArray[questionCounter];
        let alternatives = [...incorrect_answers, `correct: ${correct_answer}`];

        questionContainer.append(`<p>Question ${questionCounter+1}<br />${question}</p>`);

        let buttonCounter = 1;
        alternatives.forEach(answer => {
            let button = $('<button/>', {
                text: `${answer}`,
                id: `btn${buttonCounter}`, 
                click: function () {
                
                    if (button.text() === `correct: ${correct_answer}`) {
                        console.log(`${correct_answer} is correct!`);
                        score++;
                    } else {
                        console.log(`${button.text()} is wrong!`);
                    }
                    
                    printQuestions(questionsArray, questionCounter+1);
    
                }
            });

            questionContainer.append(button);
            buttonCounter++;
        });

    } else {
        questionContainer.html(`Your score was ${score}`);

        console.log("Back to beginning");
        button.show();
    }

}
