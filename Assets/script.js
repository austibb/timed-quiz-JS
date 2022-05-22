$(function() {

    // variables to reference each page (div) element
    var introPage= $('#introPage');
    var quizPage = $('#quizPage');
    var storeScorePage = $('#storeScorePage');
    var highScorePage = $('#highScorePage');
    var header = $('#header');

    // variables to reference interactive/dynamic elements on the page
    var startButton = $('#startButton');    // button to begin quiz
    var clock = $('#clock');                // element that will show the time
    var questionEl = $('#questionEl');      // element where the question will be stored
    var answerEl = $('#options');           // element that will display response choices
    var correctEl = $('#isCorrect');        // element that will show the user whether or not their answer is correct
    var details = $('#details');            // element that will display if the answer to the question is right or wrong
    var highScoreEl = $('#highscore');      // element that will take you to the highscore page when clicked
    var storedHighScores;

    // data variables
    var timeScore = 0;                      // timer int
    var questions = [
        ['Commonly used data types do NOT include:', [['strings', false], ['booleans', false], ['alerts', true], ['numbers', false]]],
        ['The conditionin an if/else statement is enclosed with ______.', [['quotes', false], ['curly brackets', false], ['parentheses', true], ['square brackets', false]]],
        ['Arrays in JavaScript can be used to store _______.', [['numbers and strings', false], ['other arrays', false], ['booleans', false], ['all of the above', true]]],
        ['String values must be enclosed within ____ when being assigned to variables.', [['commas', false], ['curly brackets', false], ['quotes', true], ['parentheses', false]]],
        ['A very useful tool used during development and debugging for printing content to the debugger is:', [['JavaScript', false], ['terminal/bash', false], ['for loops', false], ['console.log', true]]],
    ];                                      // array of questions and their answers
    var questionNumber;                     // question # to be prepended to each question, also track quiz progress
    var startClock;                         // timerID for the setInterval object
    var finalScore;                         // variable to store final time score for the attempt

    // event handler for when the 'start' button is clicked. Changes page display to quiz page, and begins the game
    startButton.on('click', function() {
        startGame();
    });

    // event handler to display leaderboard when the "high scores" tag is clicked
    highScoreEl.on('click', function() {
        showHighScores();
    });

    // event handler for when the user clicks on the "go back" button
    highScorePage.on('click', '.back', function(){
        console.log('clicking');
        init(); //resets variables and webpage
    });

    // event handler for clearing the score leaderboard
    highScorePage.on('click', '.clearHighScore', function(){
        storedHighScores = [];
        localStorage.setItem("scores", JSON.stringify(storedHighScores));
        showHighScores();
    });

    // event handler for when an answer is selected. progresses to the next question
    answerEl.on('click', '.answerChoice', function(){
        answerEl.children().prop("disabled",true);           // disables all buttons after clicking so they cant be reclicked
        let isCorrect = $(this).data('isAnswer') === "true";

        details.show();
        if (isCorrect) {   // records the right/wrong in the footer for the user to see
            $(this).css('background-color', 'green')
            correctEl.text('Correct!');
        } else {
            $(this).css('background-color', 'red')
            correctEl.text('Wrong!');
            timeScore += 10;
            clock.text('Time: ' + timeScore);
        }

        questionNumber++;
        progressQuiz();
    });

    // event handler for the event when the user submits their highscore to the local leaderboard
    $('#formEl').on('submit', function(event) {
        event.preventDefault();
        let submission = {
            name: $('#nameEntry').val(),
            score: finalScore,
        }
        storedHighScores.push(submission);
        localStorage.setItem("scores", JSON.stringify(storedHighScores));
        showHighScores();
    });

    // begins the quiz, initializing the timer and displaying the first question
    function startGame() {
        $('body').children().hide();
        header.show();
        quizPage.show();              // reveals quiz page
        askQuestions();                 // begin the quiz
        details.hide();
        startClock = setInterval(function() {
            timeScore += 1;
            clock.text('Time: ' + timeScore);
        }
        , 1000); // starts timer
    }

    // populates page with next question in the quiz as well as their answer choices
    function askQuestions() {
        answerEl.empty();
        let question = questions[questionNumber];
        questionEl.text(question[0]);
        let ansCount = 1;
        for (let answer of question[1]) {
            answerEl.append(
                $('<p>')
                    .text(ansCount + '. ' + answer[0])
                    .data('isAnswer', answer[1].toString())
                    .addClass('answerChoice')
                    .addClass('btn')
            );
            ansCount++;
        };
    };

    // helper function broken down for visibility. Progresses the quiz to the next page, either the next question or score page
    function progressQuiz() {
        // after a short delay, moves on to the next question. finishes the quiz if that's the last question
        setTimeout(function() {
            if (questionNumber < questions.length) {    // continues to ask questions while there are questions remaining
                askQuestions();
            } else {                                    // hide questions page, give score, show highscore
                $('body').children().hide();
                header.show();
                storeScorePage.show();
                clearInterval(startClock);              // stops timer
                finalScore = timeScore;
                $('#scoreDisplay').text('Your final score is ' + finalScore + '.');
            }
            details.hide();
        }, 800);
    }

    // displays the leaderboard page and the buttons to go back, or clear the leaderboard.
    function showHighScores() {
        $('body').children().hide();
        highScorePage.show();
        $('#scoreList').empty();
        // sorts stored object score submissions based on score value. helper function influenced by StackOverflow
        storedHighScores.sort(function(a, b) {
            return parseFloat(a.score) - parseFloat(b.score);
        });
        // displays leaderboard, at a max of the 8 highest scores
        if (storedHighScores.length > 0) {
            for (let i = 0; i < 8; i++) {
                if (i < storedHighScores.length) {
                    let entry = storedHighScores[i];
                    $('#scoreList')
                        .append($('<li>')
                            .text((i + 1) + '. ' + entry.name + ' - ' + entry.score)
                        )
                }
            }
        }
    }

    // initializes/resets the page and variables
    function init() {
        questionNumber = 0;
        timeScore = 0;

        $('body').children().hide();
        header.show();
        introPage.show();

        correctEl.text('');
        clock.text('Time: 0');

        if (localStorage.getItem('scores') === null) {
            storedHighScores = [];
        } else {
            storedHighScores = JSON.parse(localStorage.getItem("scores"));
        }
    }

    init(); // runs at the beginning to make sure everything is fine. also allows for replay
});