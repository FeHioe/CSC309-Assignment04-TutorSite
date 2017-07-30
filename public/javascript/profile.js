var uname = decodeURIComponent(window.location.pathname.substring(18));

function seeSched() {
    if(uname != "") {
        window.location.href = '/weekView&username=' + uname;
    }
}

function sendMsg() {
    if(uname != "") {
        window.location.href = '/message&username=' + uname;
    }
}

function likeReview(id) {
    var reviewer = id.substring(4);
    var request = $.ajax({
        method: "POST",
        url: "/likeReview=" + reviewer
    });

    request.done(function(msg) {
        document.getElementById(reviewer+"likes").innerHTML = "Likes: " + msg;
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

function dislikeReview(id) {
    var reviewer = id.substring(7);
    var request = $.ajax({
        method: "POST",
        url: "/dislikeReview=" + reviewer
    });

    request.done(function(msg) {
        document.getElementById(reviewer+"likes").innerHTML = "Likes: " + msg;
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
}

function loadUser(username) {
    var request = $.ajax({
        method: "GET",
        url: "/username=" + username
    });

    request.done(function(msg) {
        var json = JSON.parse(msg);
        document.getElementById("profilepic").src = json["picture"];
        document.getElementById("pp").innerHTML = json["username"]+"'s PROFILE";
        document.getElementById("name").innerHTML = "Name: " + json["name"];
        document.getElementById("occupation").innerHTML = "Occupation: " + json["occupation"];
        document.getElementById("education").innerHTML = "Education: " + json["education"];
        document.getElementById("experience").innerHTML = "Experience: " + json["experience"];
        document.getElementById("about").innerHTML = "About Me: " + json["about"];
        document.getElementById("rating").innerHTML = "Overall Rating: " + Number(json["sum_rating"]/json["rating_count"]).toFixed(2);
        document.getElementById("phone").innerHTML = "Phone Number: " + json["phone"];
        document.getElementById("email").innerHTML = "Email: " + json["email"];

        if(json["city"]) {
            document.getElementById("location").innerHTML = "Location: " + json["city"];
            if (json["country"]) {
                document.getElementById("location").innerHTML += ", " + json["country"];
            }
        }else if (json["country"]) {
            document.getElementById("location").innerHTML = "Location: " + json["country"];
        }else {
            document.getElementById("location").innerHTML = "Location: Unknown";
        }

        document.getElementById("tutoring").innerHTML = "Tutoring: " + json["subjects"];
        document.getElementById("rate").innerHTML = "Base Rate Per Hour: $" + json["rate"];
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        uname = "";
    });
};

function loadReviews(username) {
    var request = $.ajax({
        method: "GET",
        url: "/reviewuser=" + username
    });

    request.done(function(msg) {
        var json = JSON.parse(msg);
        document.getElementById("reviews").innerHTML += `<p class="re">REVIEWS</p>`
        for (var index = 0; index< json.length; index++){
            var pic = json[index]["picture"];
            var string = `<div class="review">
                    <div class="inline review-content">
                        <div class="leftreview">
                            <img id="reviewpic" src="` + pic + `" alt="Profile Picture">
                        </div>
                        <div class="rightreview">
                            <p class="righttop" id="` + json[index]["reviewer"] + `likes">Likes: ` + json[index]["likes"] + `</p>
                            <p>Rating: ` + json[index]["rating"] + `/5</p>
                            <p> ` + json[index]["commented"] + `</p>
                        </div>
                    </div>
                    <div>
                        <p>User: ` + json[index]["reviewer"] + `</p>
                    </div>
                    <div class="right">
                        <button class="ratereview" id="like` + json[index]["reviewer"] + `" onclick="likeReview(this.id)">Like</button>
                        <button class="ratereview" id="dislike` + json[index]["reviewer"] + `" onclick="dislikeReview(this.id)">Dislike</button>
                    </div>
                </div>`;
            document.getElementById("reviews").innerHTML += string;
        }
    });

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
};

loadUser(uname);
loadReviews(uname);