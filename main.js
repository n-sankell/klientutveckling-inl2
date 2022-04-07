let axios = require("axios");
let $ = require("jquery");

let answerLog;

//Check local storage if there is a colot-theme saved
$(".lightButton").hide();
if (localStorage.getItem("colorTheme") === "dark") {
    $("body").addClass("dark");
    $(".darkButton").hide();
    $(".lightButton").show();
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

$("#numberDisplay").html($("#numberOfQuestions").val());
$("#numberOfQuestions").on("input", () => {
    $("#numberDisplay").html($("#numberOfQuestions").val());
});

let getData = async (url) => {
    let response = await axios.get(url, getQueries());
    return response.data;
}

let getQueries = () => {
    return {
        params: {
            amount: $("#numberOfQuestions").val(),
            category: $("#categorySelect").val(),
            difficulty: $("#difficultySelect").val(),
            type: $("#typeSelect").val()
        }
    };
}

$("#startButton").on("click", async (e) => {
    answerLog = [];
    e.preventDefault();
    
    let response = await getData("https://opentdb.com/api.php");
    if (response.results.length === 0) {
        alert("No game available.");
    } else { 
        $(".submitContainer").hide();
        printQuestion(response.results, 0, 0);
    }
    
});

let answerButtonContainer = $(".answerButtonContainer");
let statsContainer = $(`<div class="statsContainer"></div>`);

//This method adds buttons and event listeners for each question recursively
let printQuestion = (questionsArray, questionCounter, score) => {
    if (questionCounter < questionsArray.length) {
        resetTexts();
        
        let { question, category, difficulty, correct_answer, incorrect_answers } = removeHtmlEnteties(questionsArray[questionCounter]);
        let alternatives = [correct_answer, ...incorrect_answers].shuffle();

        $(".questionContainer").append(`<p>Question ${questionCounter+1} / ${questionsArray.length}<br />${category}, ${difficulty}<br/><br/>${question}</p>`);

        let correctId = `btn${getRandomId()}`;
        let buttonCounter = 1;

        alternatives.forEach(answer => {
            let answerButton = $("<button/>", {
                text: answer,
                id: answer === correct_answer ? correctId : `btn${getRandomId()}`,
                class: "answerButton",
                click: () => {
                    
                    $(".answerButton").prop("disabled", true);
                    $(`#${correctId}`).css("background-color", "green");

                    if (answerButton.text() === correct_answer) { 
                        score++;
                        $(".messageContainer").html(`<p>"${correct_answer}" is correct!<br/>Score: ${score}</p>`);
                        
                    } else {
                        answerButton.css("background-color", "red");
                        $(".messageContainer").html(`<p>"${answerButton.text()}" is wrong!<br/>"${correct_answer}" was the right answer.<br/>Score: ${score}</p>`);
                    }

                    logAnswer(question, answerButton.text(), correct_answer);
                    $(".nextButtonContainer").append($(`<button id="giveUp">Give up</button>`));
                    $("#giveUp").on("click", () => {
                        if (confirm("Would you like to go back?")) {
                            resetTexts();
                            $(".submitContainer").show();
                        }
                    });
                    $(".nextButtonContainer").append($(`<button id="nextQuestionButton">Next</button>`));
                    $("#nextQuestionButton").on("click", () => {
                        resetTexts();
                        //Recursive call to get the next question
                        printQuestion(questionsArray, questionCounter+1, score);
                    });
                }
            });

            answerButtonContainer.append(answerButton);
            if (buttonCounter === 2) {
                console.log("hej");
             answerButtonContainer.append($("<br/>"));
            }
            buttonCounter++;

        });

        $(".questionContainer").append(answerButtonContainer);

    } else {
        //We reach this point when all questions have been answered
        $(".messageContainer").html(`<p>Your score was ${score} of ${questionsArray.length}<br />
        Grade: ${getGrade(score/questionsArray.length)}</p>`);

        $(".messageContainer").append($(`<button id="playAgain">Play again</button>`));
        $("#playAgain").on("click", () => {
            resetTexts();
            $(".submitContainer").show();
        });

        $(".messageContainer").append($(`<button id="showStats">Show stats</button>`));
        $("#showStats").on("click", () => {
            $("#showStats").hide();
            let counter = 1;
            answerLog.forEach(log => {
                statsContainer.append(`<p>${counter}: ${log.logggedQuestion}</p>`);
                if (log.loggedAnswer === log.loggedCorrectAnswer) {
                    statsContainer.append(`<div class ="loggedQuestion"><p>"${log.loggedAnswer}" was correct!</p></div>`);
                } else {
                    statsContainer.append(`<div class ="loggedQuestion"><p>"${log.loggedAnswer}" was wrong!<br/>"${log.loggedCorrectAnswer}" was the right answer.</p></div>`);
                }
                counter++;
            });

            statsContainer.append($(`<button id="hideStats">Hide stats</button>`));
            $("#hideStats").on("click", () => {
                statsContainer.html("");
                $("#showStats").show();
            });

        });
        $(".messageContainer").append(statsContainer);
    }
}

//This adds a shuffle function to arrays
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

//This function logs the last answered question
let logAnswer = (question, answer, correctAnswer) => {
    answerLog.push( {
        logggedQuestion: question,
        loggedAnswer: answer,
        loggedCorrectAnswer: correctAnswer
    });
}

let getGrade = (result) => {
    if (result == 1) {
        return `<span class="aced">Aced it!</span>`;
    } else if (result >= 0.75) {
        return `<span class="exeptional!">Exeptional!</span>`;
    } else if (result >= 0.5) {
        return `<span class="passed">Passed!</span>`;
    } else {
        return `<span class="failed">Failed!</span>`;
    }
}

let resetTexts = () => {
    answerButtonContainer.html("");
    statsContainer.html("");
    $(".questionContainer").html("");
    $(".messageContainer").html("");
    $(".nextButtonContainer").html("");
}

//Last two functions replaces html enteties from the API
let removeHtmlEnteties = (object) => {
    newIncorrectAnswers = object.incorrect_answers.map(answer => decodeHtml(answer));
    newObject = {
        question: decodeHtml(object.question),
        category: decodeHtml(object.category),
        difficulty: decodeHtml(object.difficulty),
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
