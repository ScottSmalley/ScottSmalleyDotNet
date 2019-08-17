/*
Scott Smalley
UVU B.S. Software Engineering Fall 2020
801-651-9808
scottsmalley90@gmail.com 
*/

//Global Variables
var $scrambledContent;
var $currScramble;
var $currScore;

$(document).ready(function(){
    //Set up the score for the Website Game, if no 
    //stored value in the Local Storage is found, then
    //set up an internal variable to use if the user
    //uses the game.
    if (localStorage.getItem("ScrambleScore") === null){
        $currScore = 0;
    }
    else{
        $currScore = localStorage.getItem("ScrambleScore")
    }

    //Website Game Play button listener.
    //Changes the text on the play button to "close," 
    //and changes the text on the delete button to
    //"hint." Triggers the scrambled text game content.
    //Sets up listeners for each button 
    //depending on the text of the button.
    //Lastly, it adds a label the shows the score.
    $(".playGameBtn").click(function(event){
        let $playBtn = $(event.target);
        let $deleteBtn = $(".deleteGameBtn");
        if ($playBtn.text() === "Play"){
            setGameContent()
            $playBtn.text("Close");
            $deleteBtn.text("Hint");
            $(".btn-group").append('<label class="btn scoreLbl m-0">Score: </label>')
            updateScore();
        }
        else{
            $playBtn.text("Play");
            $deleteBtn.text("Delete Game");
            $(".scoreLbl").remove();
        }    
    })

    //Website Game Delete button listener.
    //Depending on the text on the button, 
    //it calls the appropriate function.
    $(".deleteGameBtn").click(function(event){
        if ($(event.target).text() === "Delete Game"){
            deleteGame();
        }
        else if($(event.target).text() === "Hint"){
            showHint();
        }
    })
    
    //Local JSON file on server, grabs the
    //JSON to be used for hints and the game content.
    $.getJSON("scrambles.json", function(data){
        $scrambledContent = data;
    })
});

//Randomly selects one of the five scrambles from the JSON file.
//Each scramble is titled "scramble 0,1,2,3,4."
//Inserts it into the appropriate div with id "scrambledText."
//In the JSON file, the text contains HTML tags for each scrambled word.
//These tags have "scramble" as a class to be identified.
//The code creates a click listener to verify it's a scrambled word,
//replaces it with the unscrambled word, and alerts the user. Also
//calls functions to increment the score and check to see if all words 
//are found.
function setGameContent(){
    $currScramble = "scramble" + (Math.floor(Math.random() * 5) + 1);
    $("#scrambledText").html($scrambledContent[$currScramble]["text"])
    $(".scramble").click(function(event){
        let $scrambledItem = $(event.target);
        let $unscrambledWord = $scrambledContent[$currScramble]["hint"][$scrambledItem.text()];
        $scrambledItem.replaceWith($unscrambledWord);
        alert("You found \"" + $unscrambledWord + "!\"");
        incrementScore();
        isGameSolved();
    })
} 

//Increments the local variable, whether it be valued by
//the local storage or set to 0. Create/update the 
//local storage with the new score. Then updates the
//label in the html the new score.
function incrementScore(){
    $currScore++;
    localStorage.setItem("ScrambleScore", $currScore)
    updateScore();
}

//Resets current score variable to 0,
//and delete the local storage variable
//if it exists.
function deleteGame(){
    $currScore = 0;
    if (localStorage.getItem("ScrambleScore") !== null){
        localStorage.removeItem("ScrambleScore")
        alert("Score Successfully Deleted.");
    }
}

//Updates the score label in the html with 
//the current score.
function updateScore(){
    $(".scoreLbl").text("Score: " + $currScore)
}

//If selecting a scrambled word gives
//no results, then the current game is solved.
//Alerts user that the game is solved.
function isGameSolved(){
    if ($(".scramble").length < 1){
        alert("Congratulations!\nThis game is solved!\nClick Close to play again.")
    }
}

//Grabs all the current scrambles left 
//in the game. Randomly selects one of
//the remaining scrambles and highlights 
//it for the user to see.
function showHint(){
    let $availScrambles = $(".scramble")
    $($availScrambles[Math.floor(Math.random() * $availScrambles.length)]).css("backgroundColor", "red").css("color", "white")
}