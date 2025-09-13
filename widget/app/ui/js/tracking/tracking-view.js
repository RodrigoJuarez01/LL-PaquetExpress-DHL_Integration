trackingTab.style.display = 'block';
shipmentTab.style.display = 'none';
podTab.style.display = 'none';

/*
const groupedPackagesByShipment = {
    "2478264272": [
        {
            "warehouse_name": "DCA CEDIS CDMX",
            "zip": "06700",
            "address": "Querétaro no.229",
            "address2": "Col. Roma Norte",
            "address1": "Querétaro no.229",
            "phone": "5555744254",
            "attention": "JC 4",
            "state": "Ciudad de México",
            "city": "Cuauhtémoc",
            "branch_name": "Dermi Co",
            "email": "no_existe@solvisconsulting.com",
            "warehouse_id": "4031306000000092026",
            "pte_almacen": "DCA CEDIS CDMX",
            "package_id": "4031306000011839393",
            "package_number": "PKG-02263",
            "customer_id": "4031306000000341137",
            "shipment_id": "4031306000012413003",
            "shipment_number": "SHP-01490",
            "shipment_status": "shipped",
            "shipment_tracking_number": "2478264272"
        },
        {
            "warehouse_name": "DCA CEDIS CDMX",
            "zip": "06700",
            "address": "Querétaro no.229",
            "address2": "Col. Roma Norte",
            "address1": "Querétaro no.229",
            "phone": "5555744254",
            "attention": "JC 4",
            "state": "Ciudad de México",
            "city": "Cuauhtémoc",
            "branch_name": "Dermi Co",
            "email": "no_existe@solvisconsulting.com",
            "warehouse_id": "4031306000000092026",
            "pte_almacen": "DCA CEDIS CDMX",
            "package_id": "4031306000011839495",
            "package_number": "PKG-02264",
            "customer_id": "4031306000000341137",
            "shipment_id": "4031306000012410069",
            "shipment_number": "SHP-01491",
            "shipment_status": "shipped",
            "shipment_tracking_number": "2478264272"
        }
    ],
    "2478275026": [
        {
            "warehouse_name": "DCA CEDIS CDMX",
            "zip": "06700",
            "address": "Querétaro no.229",
            "address2": "Col. Roma Norte",
            "address1": "Querétaro no.229",
            "phone": "5555744254",
            "attention": "JC 4",
            "state": "Ciudad de México",
            "city": "Cuauhtémoc",
            "branch_name": "Dermi Co",
            "email": "no_existe@solvisconsulting.com",
            "warehouse_id": "4031306000000092026",
            "pte_almacen": "DCA CEDIS CDMX",
            "package_id": "4031306000011826074",
            "package_number": "PKG-02265",
            "customer_id": "4031306000000341137",
            "shipment_id": "4031306000012478002",
            "shipment_number": "SHP-01493",
            "shipment_status": "shipped",
            "shipment_tracking_number": "2478275026"
        }
    ]
};
*/

const trackingCardsContainer = document.getElementById("trackingCards");
let trackingCardsEl = '';


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