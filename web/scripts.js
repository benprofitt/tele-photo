// scripts.js
$(document).ready(function () {
    const uploadForm = $("#upload-form");
    const countdownTimer = $("#countdown-timer");
    
    const imageInput = $("#image-input");
    const versionCheckbox = document.getElementById('version');

    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('image-input');

    const dropdownContainer = document.getElementById('dropdown-container');
    const subjectContainer = document.getElementById('subject-container');

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
  
        // limit the number of files selected to 5
        if (files.length > 5) {
          alert("Please select no more than 5 files.");
          return;
        }
      
        // loop through the selected files and create a FileReader for each
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
      
          // set up the FileReader to display the image on load
          reader.onload = (event) => {
            const imageElement = document.createElement("img");
            imageElement.src = event.target.result;
            fileList.appendChild(imageElement);
          };
      
          // read the file as a data URL
          reader.readAsDataURL(file);
        }
    });

    versionCheckbox.addEventListener("change", (event) => {
        if (event.target.checked) {
            fileInput.removeAttribute("multiple");
            dropdownContainer.style.display = '';
            subjectContainer.style.display = 'none';
        } else {
            fileInput.setAttribute("multiple", "");
            dropdownContainer.style.display = 'none';
            subjectContainer.style.display = '';
        }
      });

    // Find the loading-icon element
    const loadingIcon = document.getElementById("loading-icon");

    // Function to show the loading icon
    function showLoadingIcon() {
    loadingIcon.style.display = "block";
    }

    // Function to hide the loading icon
    function hideLoadingIcon() {
    loadingIcon.style.display = "none";
    }

    function updateCountdown(secondsLeft) {
        countdownTimer.text(`${secondsLeft} sec`);
      }

    function startTimer(secondsLeft) {
        
        let intervalId = setInterval(function () {
    
            secondsLeft -= 1;

            if (secondsLeft <= 0) {
                secondsLeft = 0;
            }
            
            updateCountdown(secondsLeft);
        }, 1000);
        return intervalId;
    }
      
    function stopTimer(timerInterval) {
    clearInterval(timerInterval);
    }
    

    uploadForm.on("submit", function (event) {
        showLoadingIcon();
        const numberDropdown = document.getElementById("number-dropdown");
        let numberValue = parseInt(numberDropdown.value);
        const formData = new FormData();
        console.log(versionCheckbox.value)
        if (!versionCheckbox.value) {
            console.log("Multi")
            numberValue = 1;
            updateCountdown(30);
            timer = startTimer(30);
            const labelField = document.getElementById("class-keyword");
            for (let i = 0; i < imageInput.length; i++) {
                formData.append('images', imageInput[i].files[0]);
            }
            formData.append("description", labelField.value);
        } else {
            updateCountdown(12*numberValue);
            timer = startTimer(12 * numberValue);
            formData.append("image", imageInput[0].files);
        }

        event.preventDefault();

        axios.post("https://telephoto.reiform.com/api/upload_and_process", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(async response => {
            const imagePair = response.data;
            
            // Clear the div
            $('#image-pairs').empty();

            const row = $('<div class="image-row"></div>');
            const caption = $('<div class="caption"></div>').text(`=> ${imagePair.caption} =>`);
            const imagePairDiv = $('<div class="image-pair"></div>');
            const processedImage = $('<img class="processed-image">').attr('src', imagePair.processed_url);
            imagePairDiv.append(processedImage);
            row.append(caption).append(imagePairDiv);
            $('#image-pairs').append(row);

            let processed_url = imagePair.processed_url;
            for (let i = 1; i < numberValue; i++) {
                let data = {
                    "url" : processed_url
                }
                try {
                let response = await axios.post("https://telephoto.reiform.com/api/url_and_process", data, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                
                const imagePair = response.data;
                
                // Clear the div
                const row = $('<div class="image-row"></div>');
                const caption = $('<div class="caption"></div>').text(`=> ${imagePair.caption} =>`);
                const imagePairDiv = $('<div class="image-pair"></div>');
                const processedImage = $('<img class="processed-image">').attr('src', imagePair.processed_url);
                imagePairDiv.append(processedImage);
                row.append(caption).append(imagePairDiv);
                $('#image-pairs').append(row);
                
                processed_url = imagePair.processed_url;
                } catch(error) {
                    console.error(error);
                    hideLoadingIcon();
                    stopTimer(timer);
                }
            }
    
            hideLoadingIcon();
            stopTimer(timer);
        })
        .catch(error => {
            console.error(error);
            hideLoadingIcon();
            stopTimer(timer);
        });

        
    });
});
