let axios = require("axios");
let $ = require("jquery");

let answerLog;

//Check local storage if there is a colot-theme saved
if (localStorage.getItem("colorTheme") === "dark") {
    $("body").addClass("dark");
    $(".darkButton").hide();
    $(".lightButton").show();
} else {
    $(".lightButton").hide();
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

$("#demo").html($("#antalSpel").val());
$("#antalSpel").on("input", () => {
    $("#demo").html($("#antalSpel").val());
});

let getData = async (url) => {
    let response = await axios.get(url, getQueries());
    return response.data;
}

let getQueries = () => {
    return {
        params: {
            amount: $("#antalSpel").val(),
            category: "",
            difficulty: "",
            type: ""
        }
    };
}

$("#startButton").on("click", async (e) => {
    answerLog = [];
    e.preventDefault();
    $(".submitContainer").hide();
    let response = await getData("https://opentdb.com/api.php");
    printQuestion(response.results, 0, 0);
});

let answerButtonContainer = $(".answerButtonContainer");

let printQuestion = (questionsArray, questionCounter, score) => {
    if (questionCounter < questionsArray.length) {

        resetTexts();
        
        let { question, correct_answer, incorrect_answers } = removeHtmlEnteties(questionsArray[questionCounter]);
        let alternatives = [correct_answer, ...incorrect_answers].shuffle();

        $(".questionContainer").append(`<p>Question ${questionCounter+1} / ${questionsArray.length}<br />${question}</p>`);

        let correctId = `btn${getRandomId()}`;

        alternatives.forEach(answer => {
            let answerButton = $('<button/>', {
                text: answer,
                id: answer === correct_answer ? correctId : `btn${getRandomId()}`,
                class: "answerButton",
                click: () => {
                    
                    $(".answerButton").prop("disabled", true);
                    $(`#${correctId}`).css("background-color", "green");

                    if (answerButton.text() === correct_answer) { 
                        score++;
                        $(".messageContainer").html(`<p>${correct_answer} is correct!<br/>Score: ${score}</p>`);
                        
                    } else {
                        answerButton.css("background-color", "red");
                        $(".messageContainer").html(`<p>${answerButton.text()} is wrong!<br/>${correct_answer} was the right answer<br/>Score: ${score}</p></p>`);
                    }

                    $(".nextButtonContainer").append($(`<button id="nextQuestionButton">Next</button>`));
                    logAnswer(question, answerButton.text(), correct_answer);
                    $("#nextQuestionButton").on("click", () => {
                        resetTexts();
                        printQuestion(questionsArray, questionCounter+1, score);
                    });
                }
            });

            answerButtonContainer.append(answerButton);
            $(".questionContainer").append(answerButtonContainer);
            
        });

    } else {
        resetTexts();

        $(".messageContainer").html(`<p>Your score was ${score} of ${questionsArray.length}</p><br />
        <p>Grade: ${calculateScore(score, questionsArray.length)}</p>`);
        $(".messageContainer").append($(`<button id="playAgain">Play again</button>`));

        $("#playAgain").on("click", () => {
            resetTexts();
            $(".submitContainer").show();
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
let getRandomId = () => {
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

let calculateScore = (score, amountOfQuestions) => {
    if (score / amountOfQuestions == 1) {
        return "Aced it!"
    } else if (score / amountOfQuestions >= 0.75) {
        return "Exeptional!";
    } else if (score / amountOfQuestions >= 0.5) {
        return "Passed";
    } else {
        return "Failed";
    }
}

let resetTexts = () => {
    $(".questionContainer").html("");
    answerButtonContainer.html("");
    $(".messageContainer").html("");
    $(".nextButtonContainer").html("");
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
