import { pcsAndNeighborhoods } from "../../../../catalogs/CPs.min.js";
import { pcsAndMunicipalities } from "../../../../catalogs/Municipio.min.js";
import { pcsAndStates } from "../../../../catalogs/Estado.js";

export function handleAutocomplete(targetId, autocompleteContainerId, elementsDOM) {

    const autocompleteResults = document.getElementById(autocompleteContainerId);
    autocompleteResults.style.backgroundColor = '#f9f9f9';
    autocompleteResults.style.borderRadius = '5px';
    //autocompleteResults.style.border = '1px solid lightgray';
    autocompleteResults.style.zIndex = '10';
    autocompleteResults.style.maxHeight = '11rem';
    autocompleteResults.style.overflowY = 'auto';
    document.body.addEventListener('click', function() {
        // Code to execute when the body element is clicked
        console.log('body clicked');
        autocompleteResults.innerHTML = '';
        autocompleteResults.style.border = 'none';
    });
    /*
    document.getElementById('senderCodigoPostal').addEventListener('blur', function() {
        // Code to execute when the input loses focus
        autocompleteResults.innerHTML = '';
        autocompleteResults.style.border = 'none';
    });
    */
    document.getElementById(targetId).addEventListener('keyup', function() {
        const inputText = this.value.toLowerCase();
        
        autocompleteResults.innerHTML = ''; // Limpia resultados anteriores
          console.log('inputText: ', inputText);
        // Filtra y muestra los resultados de autocompletado
        if (inputText.length > 2) {
            const filteredEntries = Object.entries(pcsAndNeighborhoods).filter(([key, value]) => key.startsWith(inputText));
            autocompleteResults.style.border = '1px solid lightgray';

            console.log('filteredEntries: ', filteredEntries);
            Object.entries(filteredEntries).forEach(([key, obj]) => {
                console.log('key: ', key, 'obj: ', obj);

                let mnpltyCode = obj[1].mnpltyCode;
                let municipality = pcsAndMunicipalities.find(m => m.code === mnpltyCode);
                let mnpltyName = municipality ? municipality.mnplty : "No encontrado";
                console.log('mnpltyName: ', mnpltyName);

                let steCode = obj[1].steCode;
                let stateObj = pcsAndStates.find(s => s.code === steCode);
                let stateName = stateObj ? stateObj.state : "No encontrado";
                console.log('stateName: ', stateName);

                obj[1].nhoods.forEach(neighbourhood => {
                    
                    console.log(`${obj[0]}: ${neighbourhood}`);
                    
                    const div = document.createElement('div');
                    div.textContent = `${obj[0]} - ${neighbourhood}`;
                    div.style.cursor = 'pointer';
                    div.style.padding = '0.5rem';
                    
                    div.onclick = function() {
                        document.getElementById(targetId).value = obj[0];
                        console.log('selected key: ', obj[0]);
                        autocompleteResults.innerHTML = ''; // Limpia los resultados después de seleccionar
                        
                        if (targetId.includes("sender")) {
                            const sender = elementsDOM.form.sender;
                            sender.direccion2Input.value = neighbourhood;
                            sender.ciudadInput.value = mnpltyName;
                            sender.estadoInput.value = stateName;
                        } else if (targetId.includes("receiver")) {
                            const receiver = elementsDOM.form.receiver;
                            receiver.direccion2Input.value = neighbourhood;
                            receiver.ciudadInput.value = mnpltyName;
                            receiver.estadoInput.value = stateName;
                        }
                    };
                    autocompleteResults.appendChild(div);
                    
                });
            });

            
        }
      });

}
