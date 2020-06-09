/*
Scott Smalley
UVU B.S. Software Engineering Fall 2020
scottsmalley90@gmail.com 

This page handles the logic for the 
scramble game in addition to the front-end logic
for the TaskIt prototype.
*/

//Global Variables
let $scrambledContent;
let $currScramble;
let $currScore;
let $jwtToken;
let $users;
let $selectedUser;

$(document).ready(function(){

//**************************SETUP**************************    
    //ScrambleScore is the localstorage key for the scramble game score.
    if (localStorage.getItem("ScrambleScore") === null){
        $currScore = 0;
    }
    else{
        $currScore = localStorage.getItem("ScrambleScore")
    }
    //Set up the JWT for TaskIt 
    $jwtToken = null;

    //**************************SCRAMBLE GAME LOGIC**************************
    /*
    Toggles the Play and Delete Game buttons to Close and Hint respectively.
    If Play button text says Play, setup the game content else it closes the game.
    */
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

    /*
    Logic for the Delete/Hint button to do when clicked.
    */
    $(".deleteGameBtn").click(function(event){
        if ($(event.target).text() === "Delete Game"){
            deleteGame();
        }
        else if($(event.target).text() === "Hint"){
            showHint();
        }
    })

//**************************TASKIT LOGIC**************************    
//**************************LOGIN**************************    
    /*
    Login button logic.
    Resets the login/logout message div.
    Toggles the button to say Logout when logged in.
    */
    $(".taskItLoginBtn").click((event) => {
        //Log in
        let $loginBtn = $(event.target);
        $(".loginMessageDiv").empty();
        if($loginBtn.text() === 'Login'){
            $('#loginModal').modal({backdrop: "static", keyboard: false});
            $('#loginModal').modal('show');
            $loginBtn.text('Logout');
            $loginBtn.blur();
        }
        //Log out
        else{
            $loginBtn.text('Login');
            $(".loginMessageDiv").append(
                '<div class="alert alert-success text-center col-sm">' +
                '<strong>Logged Out</strong>' +
                '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                '<span aria-hidden="true">&times;</span>'+
                '</div>' 
                );
                $jwtToken = null;
            }
    });
    
    /*
    TaskIt Login Modal Submit Button
    Gets the values from the modal, and 
    sends AJAX request to backend.
    Stores token response in temporary variable if successful.
    */
    $("#submitLoginBtn").click(() => {
        const $emailInput = $("#loginEmailInput").val();
        const $passwordInput = $("#loginPasswordInput").val();
        
        $.post("https://sheltered-atoll-64832.herokuapp.com/api/auth", 
        JSON.stringify({email: $emailInput, password: $passwordInput}))
        .done(function(data) {
            clearForm();
            $(".loginMessageDiv").append(
                '<div class="alert alert-success text-center col-sm">' +
                '<strong>Login Successful</strong>' +
                '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                '<span aria-hidden="true">&times;</span>'+
                '</div>' 
                );
                $("#loginModal").modal('hide');
                $jwtToken = data;
            })
            .fail(function (data) {
                $(".loginModalMessage").remove();
                $(".loginModalBody").append(
                    '<div class="loginModalMessage alert alert-danger text-center">' +
                    '<strong>Invalid email or password.</strong>' +
                    '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                    '<span aria-hidden="true">&times;</span>'+
                    '</div>'
                    );
        });
    });

    /*
    TaskIt Login Modal Cancel Button.
    Clears the input fields, and toggles the login button from logout to login.
    */
    $("#cancelLoginBtn").click(() => {
        clearForm();
        $(".taskItLoginBtn").text('Login');
    });
    
    /*
    TaskIt Login Modal X Button.
    */
    $(".loginClose").click(() => $(".taskItLoginBtn").text('Login'));
    
//**************************CREATE USER************************** 
    /*
    Create user button logic.
    Shows the Create User Modal.
    */
   $(".createUserBtn").click(() => {
        let $createUserBtn = $(event.target);
        $createUserBtn.blur();
        $('#createUserModal').modal({backdrop: "static", keyboard: false});
        $("#createUserModal").modal("show");
        clearForm();
    });

    /*
    TaskIt Create User Modal Submit Button.
    Does some basic input validation. If it 
    passes, send an AJAX request with the payload
    */
    $("#submitCreateUserBtn").click(() => {
        $(".createUserModalMessage").remove();
        let $name = $("#userNameInput").val();
        let $email = $("#userEmailInput").val();
        let $password = $("#userPasswordInput").val();
        let $isAdmin = $("#userAdminInput").prop("checked");

        if ($name.length < 5 || $name.length > 150){
            alert("Name must be between 5 and 150 characters.")
        }
        else if ($email.length < 5 || $email.length > 150) {
            alert("Email must be between 5 and 150 characters.")
        }
        else if ($password.length < 5 || $password.length > 255){
            alert("Password must be between 5 and 255 characters.")
        }
        else{
            let payload = {
                name: $name,
                email: $email,
                password: $password,
                isAdmin: $isAdmin
            };

            $.post("https://sheltered-atoll-64832.herokuapp.com/api/users", 
                JSON.stringify(payload))
                .done(function(data) {
                    $users.push(data);
                    clearForm();
                    alert("User " + $name + " created successfully.");
                    $("#createUserModal").modal("hide");
                })
                .fail(function (data) {
                    $(".createUserModalMessage").remove();
                    $(".createUserModalBody").append(
                        '<div class="createUserModalMessage alert alert-danger text-center">' +
                        '<strong>ERROR: ' + data.responseText + '.</strong>' +
                        '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                        '<span aria-hidden="true">&times;</span>'+
                        '</div>'
                        );
            });
        }
    });

    /*
    TaskIt Create User Modal Submit Button.
    Does some basic input validation. If it 
    passes, send an AJAX request with the payload
    */
    $("#cancelCreateUserBtn").click(() => clearForm()); 

//**************************CREATE TASK************************** 
    /*
    Create task button logic.
    Shows the Create Task Modal.
    Also sets up the selection list 
    of available users.
    */
    $(".createTaskBtn").click(() => {   
        $('#createTaskModal').modal({backdrop: "static", keyboard: false});
        $("#createTaskModal").modal("show");
        let $createTaskBtn = $(event.target);
        $createTaskBtn.blur();
        let $createTaskList = $("#selectListCreateTask");
        if ($users){
            $createTaskList.empty();
            $createTaskList.append('<option>Select User</option>');
            $users.forEach(u => {$createTaskList.append('<option>' + u.name + '</option>')});
        }
        else{
            alert("Something went wrong populating user list.");
        }
    });
    
    /*
    Create Task Modal user selection list.
    Listens for changes in the selection.
    */
    $("#selectListCreateTask").change(function (event){
        $selectedUser = event.target.value;
    });
    
    /*
    Create Task Modal Submit Button.
    Does some small input validation.
    Sends AJAX request to backend, and
    adds the task to the table.
    */
    $("#submitCreateTaskBtn").click(() => {
        let $desc = $("#taskDescInput").val();
        if($desc.length < 5 || $desc.length > 50){
            alert("Description cannot be less than 5 characters or more than 50 characters.");
        }
        else if($selectedUser === "Select User"){
            alert("Please select a user.");
        }
        else{
            let userId = $users.find(u => u.name === $selectedUser)._id;
            let payload = {
                desc: $("#taskDescInput").val(),
                userId
            };
            $.post("https://sheltered-atoll-64832.herokuapp.com/api/tasks", 
                JSON.stringify(payload))
                .done(function(data) {
                    clearForm();
                    setTaskTableBody();
                    $selectedUser = null;
                    $("#createTaskModal").modal('hide');
                })
                .fail(function (data) {
                    $(".createTaskModalMessage").remove();
                    $(".createTaskModalBody").append(
                        '<div class="createTaskModelMessage alert alert-danger text-center">' +
                        '<strong>Something went wrong.</strong>' +
                        '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                        '<span aria-hidden="true">&times;</span>'+
                        '</div>'
                        );
            });            
        }
    });
    
    /*
    Create Task Modal Cancel Button.
    */
    $("#cancelCreateTaskBtn").click(() => {
        $selectedUser = null;
        clearForm();
    });

//**************************FINAL ON-READY SETUP OPERATIONS**************************  
    /*
    For all the modals to clear their data 
    when the X button is clicked.
    */
    $(".close").click(() => clearForm());

    /*
    Defaults the custom header to not 
    be attached in an AJAX setup call.
    */
    setAjaxToken(null);

    setGameScrambles();
    setTaskTableBody();
    getUserList();
});

/*
Scramble Game
Randomly selects one of the 5 preset scramble texts.
In each scramble text, there's a 'scramble' class 
for each scramble, so we create a click event for 
each one.
*/
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

/*
Scramble Game
Updates the score localStorage.
*/
function incrementScore(){
    $currScore++;
    localStorage.setItem("ScrambleScore", $currScore)
    updateScore();
}

/*
Ensures the localStorage value for ScrambleScore is 0.
*/
function deleteGame(){
    $currScore = 0;
    if (localStorage.getItem("ScrambleScore") !== null){
        localStorage.removeItem("ScrambleScore")
        alert("Score Successfully Deleted.");
    }
}

/*
Updates the score HTML text.
*/
function updateScore(){
    $(".scoreLbl").text("Score: " + $currScore)
}

/*
Since we remove the HTML tags when scrambles 
are found, we check to see how many are left. 
If 0 then we alert the user.
*/
function isGameSolved(){
    if ($(".scramble").length < 1){
        alert("Congratulations!\nThis game is solved!\nClick Close to play again.")
    }
}

/*
Randomly picks one of the 5 scrambles in the text,
changes the background to red, and text color to white
to make it visible to the user.
*/
function showHint(){
    let $availScrambles = $(".scramble")
    $($availScrambles[Math.floor(Math.random() * $availScrambles.length)]).css("backgroundColor", "red").css("color", "white")
}

/*
Uses AJAX to parse the JSON for the scrambled content.
*/
function setGameScrambles(){
    $.getJSON("scrambles.json", function(data){
        $scrambledContent = data;
    });
}

/*
TaskIt Modals
Clears and resets the input fields
for the login, create user, create task,
and edit task modals.
*/
function clearForm(){
    //Login Modal
    $(".loginMessageDiv").empty();
    $(".loginModalMessage").remove();
    $("#loginEmailInput").val("");
    $("#loginPasswordInput").val("");
    
    //Task Modal
    $("#taskDescInput").val("");
    $("#editTaskDescInput").val("");
    $(".editTaskModalMessage").val("");

    //User Modal
    $("#userNameInput").val("");
    $("#userEmailInput").val("");
    $("#userPasswordInput").val("");
    $("#userAdminInput").prop("checked", false);
    $(".createUserModalMessage").remove();
}

/*
TaskIt Table Body
Gets the tasks from the backend. Populates the Table.
Sets up click listeners for the edit and delete 
actions for each task, including modal triggers and
AJAX requests for changes to the tasks.
*/
function setTaskTableBody(){
    $(".taskItTable").empty();
        $.get("https://sheltered-atoll-64832.herokuapp.com/api/tasks", function(data) {
            $('.taskTableBody').empty();
            $.each(data, function(index) {
                let taskData = data[index];
                $(".taskTableBody").append(
                    '<tr class="taskRow">' +
                        '<td hidden class="taskId">' + taskData["_id"] + '</td>' +
                        '<td class="desc">' + taskData["desc"] + '</td>' +
                        '<td class="assignedTo">' + taskData["assignedTo"].name + '</td>' +
                        '<td class="actionBtns">' +
                            '<div class="btn-group btn-group-lg">' +
                                '<button class="editTask btn btn-link text-body p-2"><i class="fas fa-edit"></i></a></button>' +
                                '<button class="deleteTask btn btn-link text-body p-2"><i class="fas fa-trash-alt"></i></a></button>' +
                            '</div>' +
                        '</td>' +
                    '</tr>'
                );
            });
//**************************DELETE TASK**************************            
            $(".deleteTask").click(() => {
                //JWT is required to Edit.
                if ($jwtToken){
                    let $taskRow = $(event.target.closest(".taskRow"));
                    let $taskId = $($taskRow.find(".taskId")).text();
                    $(".deleteModalBody").empty();
                    $(".deleteModalBody").append("<p>Are you sure you want to delete this task?</p>");
                    $('#deleteModal').modal('show');
                    
                    $("#submitDeleteBtn").unbind().click(function () {
                        setAjaxToken($jwtToken);
                        $.ajax({
                            url: "https://sheltered-atoll-64832.herokuapp.com/api/tasks/" + $taskId,
                            type: "DELETE",
                            contentType: "application/json",
                            success: () => {
                                alert("Task deleted successfully.");
                                $taskRow.remove();
                                $("#deleteModal").modal('hide');
                            },
                            error: (data) => {
                                $(".deleteModalMessage").remove();
                                if (data.status === 403){
                                    $(".deleteModalBody").append(
                                        '<div class="deleteModalMessage alert alert-danger text-center">' +
                                            '<strong>ERROR: You do not have permission to delete tasks.</strong>' +
                                            '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                                            '<span aria-hidden="true">&times;</span>'+
                                        '</div>'
                                    );
                                }
                                else{
                                    alert("shrug");
                                }
                            }
                        })
                    });
                }
                else{
                    alert("You must log in to delete a task.");
                }
            });
//**************************EDIT TASK**************************            
            $(".editTask").click((event) => {
                //JWT is required to Edit.
                if ($jwtToken){
                    clearForm();
                    let $taskRow = $(event.target.closest(".taskRow"));
                    let $taskId = $($taskRow.find(".taskId")).text();
                    let $desc = $($taskRow.find(".desc")).text();
                    let $assignedTo = $($taskRow.find(".assignedTo")).text();
                    
                    let $selectListEditTask = $("#selectListEditTask");
                    $selectListEditTask.empty();
                    $users.forEach(u => {
                        if (u.name === $assignedTo){
                            $selectListEditTask.append('<option selected>' + u.name + '</option>');
                            $selectedUser = u.name;
                        }
                        else{
                            $selectListEditTask.append('<option>' + u.name + '</option>');
                        }
                    });
                    
                    $("#editTaskDescInput").val($desc);
                    
                    $('#editTaskModal').modal('show');

                    //Picks up changes in the Edit Task Modal.
                    $("#selectListEditTask").change(function (event){
                        $selectedUser = event.target.value;
                    });

                    $("#submitEditTaskBtn").unbind().click(() => {
                        let $editDesc = $("#editTaskDescInput").val();
                        if ($editDesc.length < 5 || $editDesc.length > 50){
                            alert("Description must be between 5 an 50 characters.");
                        }
                        else{
                            let $userId = $users.find(u => u.name === $selectedUser)._id;
                            let payload = {
                                desc: $editDesc,
                                userId: $userId
                            };
                            setAjaxToken($jwtToken);
                            $.ajax({
                                url: "https://sheltered-atoll-64832.herokuapp.com/api/tasks/" + $taskId,
                                type: "PUT",
                                data: JSON.stringify(payload),
                                contentType: "application/json",
                                success: () => {
                                    clearForm();
                                    setTaskTableBody();
                                    alert("Task edited successfully.");
                                    $("#editTaskModal").modal('hide');
                                },
                                error: (data) => {
                                    $(".editTaskModalMessage").remove();
                                    $(".editTaskModalBody").append(
                                        '<div class="editTaskModalMessage alert alert-danger text-center">' +
                                        '<strong>Something went wrong.</strong>' +
                                        '<button type="button" class="close" data-dismiss="alert" aria-lable="Close">'+
                                        '<span aria-hidden="true">&times;</span>'+
                                        '</div>'
                                        );
                                }
                            })
                        }
                    });

                    $("#cancelEditTaskBtn").click(() => {
                        $selectedUser = null;
                        clearForm();
                    });
                }
                else{
                    alert("You must log in to edit a task.");
                }
            });
    });
}

/*
If using a JWT token, we need to add it
into the header of the AJAX request. Those
are specific for POST/PUT/DELETE requests.
Otherwise, we need to remove the header
because $.ajaxSetup() sets up as the default 
for any new requests.
*/
function setAjaxToken(token){
    if (token){
        $.ajaxSetup({
            contentType: "application/json",
            headers: {
                "taskit-auth-token": token
            }
        });
    }
    else{
        $.ajaxSetup({
            contentType: "application/json",
            headers: {}
        });
    }
}

/*
Gets all the users from the backend.
*/
function getUserList(){
    $.get("https://sheltered-atoll-64832.herokuapp.com/api/users", (data) => {
        $users = data;
    })
}