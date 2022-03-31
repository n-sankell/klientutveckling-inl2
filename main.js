var axios = require("axios");
var $ = require("jquery");

let button = $('#myButton');
let questionContainer = $(".questionContainer");

let getData = async (url) => {
    button.hide();
    let response = await axios.get(url);
    return response.data;
}

button.on("click", async () => {
    let questionsObject = await getData("https://opentdb.com/api.php?amount=10");
    questionsArray = questionsObject.results;
    printQuestions(questionsArray, 0);
});

let printQuestions = async (questionsArray, counter) => {
    if (counter < questionsArray.length) {

        let questionObject = questionsArray[counter];
        let question = `${questionObject.question}`;

        questionContainer.append(`<p>${questionObject.question}</p>`)

        let alternatives = [`correct: ${questionObject.correct_answer}`];

        questionObject.incorrect_answers.forEach(answer => {
            alternatives.push(answer);
        });

        console.log(question);

        alternatives.forEach(answer => {
            console.log(answer);
        });

        printQuestions(questionsArray, counter+1);
    } else {
        console.log("Back to beginning");
        button.show();
    }

}
