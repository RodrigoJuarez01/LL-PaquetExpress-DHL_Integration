podTab.style.display = 'block';
trackingTab.style.display = 'none';
shipmentTab.style.display = 'none';

const podCardsContainer = document.getElementById("podCards");
let podCardsEl = '';
Object.keys(groupedPackagesByShipment).forEach((trackingNumber, index) => {
    if (trackingNumber == 'notShipped') {
        return;
    }
    const cardEl = `
									<div class="col-6 mb-4" id="podCard${index}">
										<div class="card">
											<div class="card-body">
		
												<h5 class="card-title">Tracking# - ${trackingNumber}</h5>
												
												<div class="d-grid mb-2">
													<button class="btn btn-primary" type="button" data-tracking-number="${trackingNumber}" id="podBtn${index}" onclick="handlePODButtonClick(this)">
														Obtener prueba de entrega
													</button>
												</div>
													
											</div>
										</div>
									</div>    
								`;

    podCardsEl += cardEl;

});

podCardsContainer.innerHTML = podCardsEl;