/*
Scott Smalley
UVU B.S. Software Engineering Fall 2020
801-651-9808
scottsmalley90@gmail.com 
*/

var $scrambledContent;
var $currScramble;
var $currScore;

$(document).ready(function(){
    if (localStorage.getItem("ScrambleScore") === null){
        $currScore = 0;
    }
    else{
        $currScore = localStorage.getItem("ScrambleScore")
    }
    //Game Play Button Listener
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

    //Game Delete Button Listener
    $(".deleteGameBtn").click(function(event){
        if ($(event.target).text() === "Delete Game"){
            deleteGame();
        }
        else if($(event.target).text() === "Hint"){
            showHint();
        }
    })
    
    //Get the scrambled versions for the game
    $.getJSON("scrambles.json", function(data){
        $scrambledContent = data;
    })
});

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

function incrementScore(){
    $currScore++;
    localStorage.setItem("ScrambleScore", $currScore)
    updateScore();
}

function deleteGame(){
    $currScore = 0;
    if (localStorage.getItem("ScrambleScore") !== null){
        localStorage.removeItem("ScrambleScore")
        alert("Score Successfully Deleted.");
    }
}

function updateScore(){
    $(".scoreLbl").text("Score: " + $currScore)
}

function isGameSolved(){
    if ($(".scramble").length < 1){
        alert("Congratulations!\nThis game is solved!\nClick Close to play again.")
    }
}

function showHint(){
    let $availScrambles = $(".scramble")
    $($availScrambles[Math.floor(Math.random() * $availScrambles.length)]).css("backgroundColor", "red").css("color", "white")
}