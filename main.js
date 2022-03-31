var axios = require("axios");
var $ = require("jquery");

let button = $('#myButton');
let div = $(".swap");


button.on("click", async () => {
    div.toggle();
    let questionsObject = await getData("https://opentdb.com/api.php?amount=10");
    questionsArray = questionsObject.results;
    printQuestions(questionsArray, 0);
});

let getData = async (url) => {
    let response = await axios.get(url);
    return response.data;
}

let printQuestions = async (questionsArray, counter) => {
    if (counter < questionsArray.length) {

        let questionObject = questionsArray[counter];
        let question = `${questionObject.question}`;

        let alternatives = [`correct: ${questionObject.correct_answer}`];

        questionObject.incorrect_answers.forEach(answer => {
            alternatives.push(answer);
        });

        console.log(question);
        console.log("hej")

        alternatives.forEach(answer => {
            console.log(answer);
        });
    }

    console.log("array: "+questionsArray.length);
}
