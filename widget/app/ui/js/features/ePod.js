
// function handlePODButtonClick(thisButton) {
// 	spinnerWrapper.style.display = 'flex';
// 	const trackingNumber = thisButton.dataset.trackingNumber;
// 	console.log('Tracking Number:', trackingNumber);
// 	//0-5
// 	const tNumbersForTesting = ['2775523063', '3660208860', '7661769404', '7349581960', '4540441264', '9356579890'];
// 	const auxTrackingNumber = orgId == '808492068' ? tNumbersForTesting[0] : trackingNumber;
// 	console.log('auxTrackingNumber:', auxTrackingNumber);
// 	//
// 	const podOptions = {
// 		url: dhlBaseUrl + '/shipments/' + auxTrackingNumber + '/proof-of-delivery',
// 		method: "GET",
// 		connection_link_name: dhlConnectionLinkName,
// 		header: [{
// 			key: 'Accept',
// 			value: '*/*'
// 		},
// 		{
// 			key: 'Accept-Encoding',
// 			value: 'gzip, deflate, br'
// 		},
// 		{
// 			key: 'Connection',
// 			value: 'keep-alive'
// 		}]
// 	};

// 	console.log('POD Options:', podOptions);
// 	ZFAPPS.request(podOptions).then(function (podAPIResponse) {
// 		spinnerWrapper.style.display = 'none';
// 		checkDHLResponse(podAPIResponse);
// 		console.log('POD API Response:', podAPIResponse);
// 		let shipmentsBody = JSON.parse(podAPIResponse.data.body);
// 		console.log('shipmentsBody: ');
// 		console.log(shipmentsBody);
// 		checkDHLResponseBody(shipmentsBody);
// 		checkDHLePODResponseBody(shipmentsBody);

// 		displayPODPDF(shipmentsBody, auxTrackingNumber);
// 		// Handle the response as needed
// 		//const podBodyArray = JSON.parse(podAPIResponse.data.body);
// 		const podBodyArray = {
// 		};
// 		//
// 	}).catch(error => {
// 		showRequestErrorToast(error.message, 7000);
// 	});
// }

// function displayPODPDF(shipmentsBody, trackingNumber) {
// 	const podPDFContainer = document.getElementById('podPDFContainer');
// 	podPDFContainer.innerHTML = '';
// 	const successMessage = `
// 					<div class="alert alert-secondary d-flex align-items-center mb-4" role="alert">
// 						<div>
// 							<i class="bi-file-earmark-pdf-fill" style="font-size: 1.1rem; color: rgb(10, 10, 10);"></i>
// 							&nbsp; <strong>La prueba digital de entrega fue recuperada correctamente para ${trackingNumber}.</strong>
// 						</div>
// 					</div>
// 			`;

// 	podPDFContainer.innerHTML = successMessage;
// 	console.log("shipmentsBody.documents.size(): ", shipmentsBody.documents.length);
// 	console.log("shipmentsBody.documents: ", shipmentsBody.documents);
// 	shipmentsBody.documents.forEach((doc, index) => {
// 		console.log("index: ", index);
// 		console.log("Document content length: ", doc.content.length);
// 		console.log("Document content: ", doc.content);
// 		const pdfContent = `data:application/pdf;base64,${doc.content}`;
// 		const iframe = document.createElement('iframe');
// 		iframe.style.width = '100%';
// 		iframe.style.height = '700px';
// 		iframe.src = pdfContent;
// 		podPDFContainer.appendChild(iframe);

// 	});

// }

