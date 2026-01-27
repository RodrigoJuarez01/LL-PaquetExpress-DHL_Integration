'use strict';

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');
const os = require('os');

let app = express();
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: true }));

const TABLE_NAME = "Webhook_Staging";

async function sendEmailSupport(catalystApp, trackingNumber, errorMessage) {
    try {
        console.log("Enviando correo de notificación a soporte...");
        let email = catalystApp.email();

        const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'javier.marcelo@solvisconsulting.com';
        const toEmail = process.env.SUPPORT_TO_EMAIL || 'support@solvisconsulting.com';

        let config = {
            from_email: fromEmail,
            to_email: [toEmail],
            subject: `ALERTA: Falló en staging webhook Paquetexpress - Guía ${trackingNumber}`,

            html_mode: true,
            content: `
                <p>El sistema no pudo encolar una firma de entrega de Paquetexpress.</p>
                <ul>
                    <li><strong>Guía:</strong> ${trackingNumber}</li>
                    <li><strong>Error:</strong> ${errorMessage.substring(0, 250)}</li>
                </ul>
                <p>Este es un mensaje automático, pertenece a una integración de Rodrigo.</p>
            `,
        };

        await email.sendMail(config);
        console.log("Correo de soporte enviado exitosamente.");

    } catch (emailError) {
        console.error("Error critico - Falló el envío del correo de soporte.");
        console.error(emailError);
    }
}

async function saveImageToFileStore(catalystApp, trackingNumber, firmaBase64) {
    if (!firmaBase64 || firmaBase64.length < 10) return null;

    const fileName = `EVIDENCIA-${trackingNumber}-${Date.now()}.jpeg`;
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
        const folderID = process.env.STAGING_FILES_FOLDER_ID;
        if (!folderID) throw new Error(`No se encontró la variable de entorno para el folder id`);

        const base64Data = firmaBase64.split(',').pop();
        const imageBuffer = Buffer.from(base64Data, 'base64');

        if (imageBuffer.length > 0) {
            const header = imageBuffer.subarray(0, 4).toString('hex').toUpperCase();
            const isJPEG = header.startsWith('FFD8');
            const isPNG = header.startsWith('89504E47');

            if (!isJPEG && !isPNG) {
                console.warn(`[Validación Imagen] La guía ${trackingNumber} envió data que no es imagen válida (Header: ${header}).`);
                return null;
            }
        } else {
            return null;
        }

        fs.writeFileSync(tempFilePath, imageBuffer);

        let filestore = catalystApp.filestore();
        let folder = filestore.folder(folderID);

        const config = {
            code: fs.createReadStream(tempFilePath),
            name: fileName
        };

        const uploadResponse = await folder.uploadFile(config);
        console.log(`Imagen guardada en FileStore: ${uploadResponse.id}`);
        return uploadResponse.id;

    } catch (error) {
        console.error("Error guardando imagen en FileStore:", error);
        return null;
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

app.post('/', async (req, res) => {
    const catalystApp = catalyst.initialize(req);

    const EXPECTED_TOKEN = process.env.EXPECTED_TOKEN;
    const authHeader = req.headers['x-auth-token'];
    let receivedToken = null;

    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            receivedToken = parts[1];
        }
    }

    if (receivedToken !== EXPECTED_TOKEN) {
        console.warn("Intento de acceso no autorizado.");
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const { firmaBase64, trackingNumber, fechaHoraEntrega, nombreReceptor } = req.body;

    if (!trackingNumber) {
        res.status(400).json({ error: "Bad Request: Missing trackingNumber" });
        return;
    }

    console.log("Procesando: ", trackingNumber);

    try {
        const fileId = await saveImageToFileStore(catalystApp, trackingNumber, firmaBase64);

        const payloadInfo = {
            fechaHoraEntrega: fechaHoraEntrega,
            nombreReceptor: nombreReceptor,
        };

        const rowData = {
            trackingNumber: trackingNumber,
            fileId: fileId || "",
            payloadJson: JSON.stringify(payloadInfo).substring(0, 250),
            status: "PENDING",
            retryCount: 0,
            errorMessage: fileId ? "" : "Imagen no se guardó"
        };

        let datastore = catalystApp.datastore();
        let table = datastore.table(TABLE_NAME);
        await table.insertRow(rowData);

        console.log(`Registro guardado exitosamente para Guía: ${trackingNumber} - Status: PENDING`);

        res.status(200).json({ status: "processed" });

    } catch (error) {
        console.error("ERROR CRÍTICO EN WEBHOOK INGESTA:", error);

        const errorMsg = error.message || String(error);

        await sendEmailSupport(catalystApp, trackingNumber, errorMsg);
        res.status(200).json({ status: "processed" });
        // res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = app;