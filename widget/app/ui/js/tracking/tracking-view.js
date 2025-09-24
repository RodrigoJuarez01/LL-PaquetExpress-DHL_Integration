
export function initializeTrackingView(appData) {

    const groupedPackagesByShipment = appData?.data?.groupedPackagesByShipment;

    const trackingCardsContainer = document.getElementById("trackingCards");
    let trackingCardsEl = '';

    console.log("groupedPackagesByShipment", groupedPackagesByShipment);

    Object.keys(groupedPackagesByShipment).forEach((trackingNumber, index) => {
        if (trackingNumber == 'notShipped') {
            return;
        }
        const packages = groupedPackagesByShipment[trackingNumber];
        let packagesEl = '';

        packages.forEach((pck) => {
            const packageEl = `
											<div class="col-6 mb-4">
												<button type="button" class="btn btn-warning disabled">
													${pck.package_number}
													<span class="badge text-bg-secondary">
														${pck.shipment_number}
													</span>
												</button>
											</div>
									`;

            packagesEl += packageEl;

        });

        const cardEl = `
									<div class="col-6 mb-4" id="trackingCard${index}">
										<div class="card">
											<div class="card-body">
		
												<h5 class="card-title">Tracking# - ${trackingNumber}</h5>
												<p class="card-text">
													Paquetes
												</p>
		
												<div class="row" id="packagesRow${index}">
													${packagesEl}
													
												</div>
		
												<div class="d-grid mb-2">
													<button class="btn btn-primary" type="button" data-tracking-number="${trackingNumber}" id="trackingNumberBtn${index}" onclick="handleTrackingButtonClick(this)">
														Rastrear
													</button>
												</div>
													
											</div>
										</div>
									</div>    
								`;

        trackingCardsEl += cardEl;


    });


    trackingCardsContainer.innerHTML = trackingCardsEl;

}

