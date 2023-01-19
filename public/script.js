

var hotell_id = 2

function showModal(asd) {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
    hotell_id = asd
}


function hideModal(dsa) {
    console.log(dsa)
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function senddata() {
    var begindate = document.querySelector("#saabumine")
    var enddate = document.querySelector("#lahkumine")
    fetch('/getAvailableRooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({hotel_id: hotell_id, begindate: begindate.value, enddate: enddate.value })

    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            window.location.href = `/hotel/${hotell_id}?begindate=${begindate.value}&enddate=${enddate.value}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Get the button that opens the modal

// Get the <span> element that closes the modal




//When the user clicks the button, open the modal

// When the user clicks on <span> (x), close the modal


// When the user clicks anywhere outside of the modal, close it
