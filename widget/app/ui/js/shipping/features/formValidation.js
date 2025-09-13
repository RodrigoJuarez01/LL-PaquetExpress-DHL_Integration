export function setupFormValidation() {
    

    document.getElementById('nextStepShipmentBtn').addEventListener('click', function(event) {
        // Prevent form submission if validation fails
        let isValid = true;
        // Get all the package checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="packageCheckbox"]');

        let firstInvalidInput;
        let firstInvalidErrorMessage;
    
        // Helper function to validate email format
        function validateEmailFormat(input, message) {
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email format
            const value = input.value.trim(); // Apply trim to the input value
            input.value = value; // Update the input with the trimmed value
            const errorMessage = input.nextElementSibling; // Assuming the error message div is the next sibling

            if (!emailRegex.test(value)) {
                isValid = false;
                input.classList.remove('is-invalid');
                input.classList.add('is-invalid');
                errorMessage.style.display = 'block'; // Show error message
                errorMessage.innerText = message; // Set the error message text
                
                // Store the first invalid input and its error message
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                    firstInvalidErrorMessage = message;
                }
            } else {
                input.classList.remove('is-invalid');
                errorMessage.style.display = 'none'; // Hide error message
            }
        }


        function validateSenderFechaInput(input) {
            const errorMessage = input.nextElementSibling; // Assuming the error message div is the next sibling

            if (!input.value) {
                isValid = false;
                input.classList.add('is-invalid');
                errorMessage.style.display = 'block'; // Show error message
                errorMessage.innerText = "El campo es obligatorio."; // Set the error message text
                
                // Store the first invalid input and its error message
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                    firstInvalidErrorMessage = errorMessage.innerText;
                }
                return; // Exit the function if input is empty
            }
            console.log('validateSenderFechaInput: ', input.value);

            const inputDate = new Date(input.value);
            const now = new Date();
            const fiveMinutesLater = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
            const nineDaysLater = new Date(now.getTime() + 8 * 24 * 60 * 60000); // 8 days from now
            /*
            console.log('inputDate: ', inputDate);
            console.log('fiveMinutesLater: ', fiveMinutesLater);
            console.log('nineDaysLater: ', nineDaysLater);
            console.log('inputDate < fiveMinutesLater: ', inputDate < fiveMinutesLater);
            console.log('inputDate > nineDaysLater', inputDate > nineDaysLater);
            */
            if (inputDate < fiveMinutesLater || inputDate > nineDaysLater) {
                input.classList.add('is-invalid');
                errorMessage.style.display = 'block'; // Show error message
                errorMessage.innerText = "La fecha debe estar entre 5 minutos a partir de ahora y 8 días a partir de ahora.";
                // Assuming you have a mechanism to track the validity of the form
                isValid = false;
                // Store the first invalid input and its error message if not already set
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                    firstInvalidErrorMessage = errorMessage.innerText;
                }
            } else {
                input.classList.remove('is-invalid');
                errorMessage.style.display = 'none'; // Hide error message
            }
        }

        // Helper function to validate input length and show/hide error message
        function validateInputLength(input, min, max, isOptional = false, message) {
            const value = input.value.trim(); // Apply trim to the input value
            input.value = value; // Update the input with the trimmed value
            const errorMessage = input.nextElementSibling; // Assuming the error message div is the next sibling
    
            if (!isOptional && (value.length < min || value.length > max)) {
                input.classList.add('is-invalid');
                errorMessage.style.display = 'block'; // Show error message
                errorMessage.innerText = message; // Set the error message text
                isValid = false;
                // Store the first invalid input and its error message
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                    firstInvalidErrorMessage = message;
                }
            } else {
                input.classList.remove('is-invalid');
                errorMessage.style.display = 'none'; // Hide error message
            }
        }

        // Helper function to show validation toast
        function showValidationErrorToast(message, delay, inputElement) {
            console.log('input element: ', inputElement);
            console.log('message: ', message);
            // Get the toast container
            const toastContainer = document.getElementById('toastContainer');
            // Focus on the first invalid input or scroll to the top of the page
            if(inputElement) {
                inputElement.focus();
                // Set vertical position of the toastContainer close to the inputElement
                console.log('input element: ', inputElement.offsetTop);
                console.log('input element parent: ', inputElement.offsetParent.offsetTop);
                if (inputElement.offsetTop > 0) {
                    toastContainer.style.top = (inputElement.offsetTop + (inputElement.offsetTop * 0.20)) + 'px';
                } else if( inputElement.offsetParent.offsetTop > 0) {
                    toastContainer.style.top = (inputElement.offsetParent.offsetTop + 80) + 'px';
                }
                
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                toastContainer.style.top = '75%';
            }
            
            toastContainer.classList.remove('top-50', 'translate-middle');
            toastContainer.classList.add('bottom-0', 'translate-middle-x');
            const errorToast = document.getElementById('toast');
            errorToast.setAttribute('data-bs-delay', delay);
            const toastBody = errorToast.querySelector('.toast-body');
            toastBody.innerHTML = '<p><strong>'+message+'</strong></p>';
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(errorToast);
            toastBootstrap.show();
        }
        
        // Validate sender email input
        validateEmailFormat(senderEmailInput, "El correo electrónico no es válido.");

        // Validate receiver email input
        validateEmailFormat(receiverEmailInput, "El correo electrónico no es válido.");

        // Validate sender fecha input
        validateSenderFechaInput(senderFechaInput);

        // Validate sender inputs
        validateInputLength(senderNombreInput, 4, 255, false, "El nombre debe tener entre 4 y 255 caracteres.");
        validateInputLength(senderEmpresaInput, 4, 100, false, "El nombre de la empresa debe tener entre 4 y 100 caracteres.");
        validateInputLength(senderPaisInput, 3, 35, false, "El país debe tener entre 3 y 35 caracteres.");
        validateInputLength(senderDireccionInput, 1, 45, false, "La dirección debe tener entre 1 y 45 caracteres.");
        validateInputLength(senderDireccion2Input, 1, 45, false, "La línea de dirección 2 debe tener entre 1 y 45 caracteres.");
        validateInputLength(senderDireccion3Input, 1, 45, true, "La línea de dirección 3 debe tener entre 1 y 45 caracteres.");
        validateInputLength(senderCodigoPostalInput, 4, 5, false, "El código postal debe tener entre 4 y 5 caracteres.");
        validateInputLength(senderCiudadInput, 1, 45, false, "La ciudad debe tener entre 1 y 45 caracteres.");
        validateInputLength(senderEstadoInput, 1, 35, false, "El estado debe tener entre 1 y 35 caracteres.");
        //validateInputLength(senderEmailInput, 4, 70, false, "El correo electrónico debe tener entre 4 y 70 caracteres.");
        validateInputLength(senderTelefonoInput, 10, 30, false, "El número de teléfono debe tener entre 10 y 30 caracteres.");
    
        // Validate receiver inputs
        validateInputLength(receiverNombreInput, 4, 255, false, "El nombre debe tener entre 4 y 255 caracteres.");
        validateInputLength(receiverEmpresaInput, 4, 100, false, "El nombre de la empresa debe tener entre 4 y 100 caracteres.");
        validateInputLength(receiverPaisInput, 3, 35, false, "El país debe tener entre 3 y 35 caracteres.");
        validateInputLength(receiverDireccionInput, 1, 45, false, "La dirección debe tener entre 1 y 45 caracteres.");
        validateInputLength(receiverDireccion2Input, 1, 45, false, "La línea de dirección 2 debe tener entre 1 y 45 caracteres.");
        validateInputLength(receiverDireccion3Input, 1, 45, true, "La línea de dirección 3 debe tener entre 1 y 45 caracteres.");
        validateInputLength(receiverCodigoPostalInput, 4, 5, false, "El código postal debe tener entre 4 y 5 caracteres.");
        validateInputLength(receiverCiudadInput, 1, 45, false, "La ciudad debe tener entre 1 y 45 caracteres.");
        validateInputLength(receiverEstadoInput, 1, 35, false, "El estado debe tener entre 1 y 35 caracteres.");
        //validateInputLength(receiverEmailInput, 4, 70, false, "El correo electrónico debe tener entre 4 y 70 caracteres.");
        validateInputLength(receiverTelefonoInput, 10, 30, false, "El número de teléfono debe tener entre 10 y 30 caracteres.");
    
        // Validate package inputs
        validateInputLength(cantidadInput, 1, 99, false, "La cantidad debe estar entre 1 y 99.");
        validateInputLength(pesoInput, 0.001, 999, false, "El peso debe estar entre 0.001 y 999.");
        validateInputLength(longitudInput, 1, 9999, false, "La longitud debe estar entre 1 y 9999.");
        validateInputLength(anchoInput, 1, 9999, false, "El ancho debe estar entre 1 y 9999.");
        validateInputLength(alturaInput, 1, 9999, false, "La altura debe estar entre 1 y 9999.");
    
        // Validate description input
        validateInputLength(descripcionInput, 1, 70, false, "La descripción debe tener entre 1 y 70 caracteres.");
    
        // Validate selectedPackageIds
        if (!selectedPackageIds || selectedPackageIds.length === 0) {
            isValid = false;
            
            console.log('***Validation failed: No package selected');
            const message = 'Por favor, seleccione por lo menos un paquete.';
            showValidationErrorToast(message, 3700, null);
            console.log('message: ', message);

            checkboxes.forEach(function(checkbox) {
                checkbox.classList.add('is-invalid');
            });
        } else {
            
            checkboxes.forEach(function(checkbox) {
                checkbox.classList.remove('is-invalid');
            });
        }
    
        // If validation fails, prevent moving to the next step
        if (!isValid) {
            event.preventDefault();
            console.log('***Validation failed.');
            // Show the first invalid input and its error message. There must be selected at least one package.
            if (selectedPackageIds && selectedPackageIds.length > 0){
                console.log('we are in the first invalid input and its error message.')
                showValidationErrorToast(firstInvalidErrorMessage, 3700, firstInvalidInput);
            }
            
        } else {
            // Continue to the next step
            console.log('***Validation passed');
            onSubmitAddresses();
        }
    });


}