/* =========================================================
   LegalEase — Premium Frontend Controller
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const BACKEND_URL = "http://127.0.0.1:8000";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const documentType = document.getElementById("documentType");
const customTypeGroup = document.getElementById("customTypeGroup");
const customType = document.getElementById("customType");

const parties = document.getElementById("parties");
const terms = document.getElementById("terms");
const effectiveDate = document.getElementById("effectiveDate");

const generateBtn = document.getElementById("generateBtn");
const generateText = document.getElementById("generateText");
const loader = document.getElementById("loader");

const errorMessage = document.getElementById("errorMessage");

const emptyState = document.getElementById("emptyState");
const editorContainer = document.getElementById("editorContainer");
const documentEditor = document.getElementById("documentEditor");

const exportSection = document.getElementById("exportSection");
const documentStatus = document.getElementById("documentStatus");
const wordCount = document.getElementById("wordCount");

const downloadTxt = document.getElementById("downloadTxt");
const downloadDocx = document.getElementById("downloadDocx");
const downloadPdf = document.getElementById("downloadPdf");

const navStatus = document.querySelector(".nav-status");
const navStatusText = document.querySelector(".status-text");
const statusDot = document.querySelector(".status-dot");


/* =========================================================
   UTILITY
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}


function safeText(value) {
    return String(value ?? "").trim();
}


/* =========================================================
   ELEMENT CHECK
   ========================================================= */

function checkElements() {

    const requiredElements = {
        documentType,
        customTypeGroup,
        customType,
        parties,
        terms,
        effectiveDate,
        generateBtn,
        generateText,
        loader,
        errorMessage,
        emptyState,
        editorContainer,
        documentEditor,
        exportSection,
        documentStatus,
        wordCount,
        downloadTxt,
        downloadDocx,
        downloadPdf
    };

    const missing = [];

    Object.entries(requiredElements).forEach(
        ([name, element]) => {

            if (!element) {
                missing.push(name);
            }

        }
    );


    if (missing.length > 0) {

        console.warn(
            "LegalEase: Missing elements:",
            missing
        );

        return false;
    }


    console.log(
        "LegalEase frontend elements loaded successfully."
    );

    return true;
}


/* =========================================================
   CUSTOM DOCUMENT TYPE
   ========================================================= */

function handleDocumentTypeChange() {

    if (!documentType) {
        return;
    }


    const isCustom =
        documentType.value === "Other";


    if (isCustom) {

        customTypeGroup.classList.remove("hidden");

        setTimeout(() => {

            if (customType) {
                customType.focus();
            }

        }, 100);

    } else {

        customTypeGroup.classList.add("hidden");

        if (customType) {
            customType.value = "";
        }
    }
}


if (documentType) {

    documentType.addEventListener(
        "change",
        handleDocumentTypeChange
    );

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function showError(message) {

    if (!errorMessage) {
        return;
    }


    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");


    // Small visual attention effect
    errorMessage.animate(
        [
            {
                opacity: 0,
                transform: "translateY(-5px)"
            },
            {
                opacity: 1,
                transform: "translateY(0)"
            }
        ],
        {
            duration: 220,
            easing: "ease-out"
        }
    );
}


function hideError() {

    if (!errorMessage) {
        return;
    }


    errorMessage.textContent = "";

    errorMessage.classList.add("hidden");
}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoading(isLoading) {

    if (!generateBtn) {
        return;
    }


    generateBtn.disabled = isLoading;


    if (isLoading) {

        generateBtn.classList.add("loading");


        if (generateText) {
            generateText.textContent = "Generating Document...";
        }


        if (loader) {
            loader.classList.remove("hidden");
        }

    } else {

        generateBtn.classList.remove("loading");


        if (generateText) {
            generateText.textContent =
                "Generate Legal Document";
        }


        if (loader) {
            loader.classList.add("hidden");
        }
    }
}


/* =========================================================
   DOCUMENT TYPE
   ========================================================= */

function getDocumentType() {

    if (!documentType) {
        return "";
    }


    if (documentType.value === "Other") {

        return customType
            ? safeText(customType.value)
            : "";

    }


    return safeText(documentType.value);
}


/* =========================================================
   FORM VALIDATION
   ========================================================= */

function validateForm() {

    const type = getDocumentType();


    if (!type) {

        showError(
            "Please select a document type."
        );

        documentType?.focus();

        return false;
    }


    if (!parties || !safeText(parties.value)) {

        showError(
            "Please enter the parties involved."
        );

        parties?.focus();

        return false;
    }


    if (!terms || !safeText(terms.value)) {

        showError(
            "Please enter the terms and conditions."
        );

        terms?.focus();

        return false;
    }


    if (
        !effectiveDate ||
        !safeText(effectiveDate.value)
    ) {

        showError(
            "Please select an effective date."
        );

        effectiveDate?.focus();

        return false;
    }


    hideError();

    return true;
}


/* =========================================================
   REQUEST BUILDER
   ========================================================= */

function buildRequest() {

    return {

        document_type: getDocumentType(),

        parties:
            safeText(parties?.value),

        terms:
            safeText(terms?.value),

        dates:
            safeText(effectiveDate?.value)

    };
}


/* =========================================================
   GENERATE DOCUMENT
   ========================================================= */

async function generateDocument() {

    if (!validateForm()) {
        return;
    }


    hideError();

    setLoading(true);


    if (documentStatus) {
        documentStatus.textContent =
            "Generating";
    }


    try {

        console.log(
            "Sending document generation request..."
        );


        const requestData =
            buildRequest();


        const response =
            await fetch(
                `${BACKEND_URL}/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestData
                        )
                }
            );


        let data = {};


        try {

            data = await response.json();

        } catch (jsonError) {

            console.warn(
                "Backend returned invalid JSON."
            );

        }


        if (!response.ok) {

            const serverMessage =
                data.detail ||
                data.message ||
                `Server error: ${response.status}`;

            throw new Error(
                serverMessage
            );
        }


        if (
            !data ||
            !data.document ||
            !safeText(data.document)
        ) {

            throw new Error(
                "The AI returned an empty document."
            );
        }


        // =========================================
        // PUT DOCUMENT INTO EDITOR
        // =========================================

        documentEditor.value =
            data.document.trim();


        // =========================================
        // SHOW EDITOR
        // =========================================

        emptyState.classList.add(
            "hidden"
        );


        editorContainer.classList.remove(
            "hidden"
        );


        exportSection.classList.remove(
            "hidden"
        );


        // =========================================
        // UPDATE STATUS
        // =========================================

        documentStatus.textContent =
            "Generated";


        // =========================================
        // UPDATE WORD COUNT
        // =========================================

        updateWordCount();


        console.log(
            "Document generated successfully."
        );


        // =========================================
        // SCROLL TO DOCUMENT
        // =========================================

        setTimeout(() => {

            editorContainer.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

        }, 180);


    } catch (error) {

        console.error(
            "Document generation failed:",
            error
        );


        let message =
            "Unable to generate the document.";


        if (
            error instanceof TypeError ||
            error.message?.includes(
                "Failed to fetch"
            )
        ) {

            message =
                "Backend is offline. Start the FastAPI server and try again.";

        } else if (error.message) {

            message =
                error.message;
        }


        showError(message);


        if (documentStatus) {

            documentStatus.textContent =
                "Error";
        }


    } finally {

        setLoading(false);
    }
}


/* =========================================================
   WORD COUNT
   ========================================================= */

function updateWordCount() {

    if (!documentEditor || !wordCount) {
        return;
    }


    const content =
        safeText(documentEditor.value);


    if (!content) {

        wordCount.textContent =
            "0 words";

        return;
    }


    const words =
        content
            .split(/\s+/)
            .filter(Boolean);


    const count =
        words.length;


    wordCount.textContent =
        `${count} ${count === 1 ? "word" : "words"}`;
}


/* =========================================================
   EDITOR CHANGES
   ========================================================= */

if (documentEditor) {

    documentEditor.addEventListener(
        "input",
        () => {

            updateWordCount();


            if (
                documentStatus &&
                safeText(documentEditor.value)
            ) {

                documentStatus.textContent =
                    "Editing";
            }

        }
    );

}


/* =========================================================
   GENERATE BUTTON
   ========================================================= */

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateDocument
    );

}


/* =========================================================
   TXT DOWNLOAD
   ========================================================= */

function downloadTextFile() {

    if (!documentEditor) {
        return;
    }


    const content =
        safeText(documentEditor.value);


    if (!content) {

        showError(
            "There is no document to download."
        );

        return;
    }


    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    downloadBlob(
        blob,
        "LegalEase_Document.txt"
    );
}


/* =========================================================
   DOCX / PDF DOWNLOAD
   ========================================================= */

async function downloadDocument(format) {

    if (!documentEditor) {
        return;
    }


    const content =
        safeText(documentEditor.value);


    if (!content) {

        showError(
            "There is no document to download."
        );

        return;
    }


    hideError();


    let endpoint = "";


    if (format === "docx") {

        endpoint =
            `${BACKEND_URL}/export/docx`;

    } else if (format === "pdf") {

        endpoint =
            `${BACKEND_URL}/export/pdf`;

    } else {

        console.error(
            "Unsupported export format:",
            format
        );

        return;
    }


    setExportButtonsDisabled(true);


    try {

        console.log(
            `Preparing ${format.toUpperCase()}...`
        );


        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            content: content
                        })
                }
            );


        if (!response.ok) {

            let errorMessageText =
                `Export failed: ${response.status}`;


            try {

                const errorData =
                    await response.json();


                if (errorData.detail) {

                    errorMessageText =
                        errorData.detail;
                }

            } catch (error) {

                console.warn(
                    "Could not read export error."
                );
            }


            throw new Error(
                errorMessageText
            );
        }


        const blob =
            await response.blob();


        if (
            !blob ||
            blob.size === 0
        ) {

            throw new Error(
                "The server returned an empty file."
            );
        }


        const extension =
            format.toLowerCase();


        downloadBlob(
            blob,
            `LegalEase_Document.${extension}`
        );


        console.log(
            `${format.toUpperCase()} downloaded successfully.`
        );


    } catch (error) {

        console.error(
            `${format.toUpperCase()} export failed:`,
            error
        );


        if (
            error instanceof TypeError ||
            error.message?.includes(
                "Failed to fetch"
            )
        ) {

            showError(
                "Backend is offline. Please start FastAPI and try again."
            );

        } else {

            showError(
                error.message ||
                `Unable to export ${format.toUpperCase()}.`
            );
        }


    } finally {

        setExportButtonsDisabled(false);
    }
}


/* =========================================================
   EXPORT BUTTON STATE
   ========================================================= */

function setExportButtonsDisabled(disabled) {

    if (downloadTxt) {
        downloadTxt.disabled = disabled;
    }


    if (downloadDocx) {
        downloadDocx.disabled = disabled;
    }


    if (downloadPdf) {
        downloadPdf.disabled = disabled;
    }
}


/* =========================================================
   BLOB DOWNLOAD
   ========================================================= */

function downloadBlob(blob, filename) {

    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    link.style.display = "none";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);
}


/* =========================================================
   DOWNLOAD BUTTON EVENTS
   ========================================================= */

if (downloadTxt) {

    downloadTxt.addEventListener(
        "click",
        downloadTextFile
    );

}


if (downloadDocx) {

    downloadDocx.addEventListener(
        "click",
        () => {
            downloadDocument("docx");
        }
    );

}


if (downloadPdf) {

    downloadPdf.addEventListener(
        "click",
        () => {
            downloadDocument("pdf");
        }
    );

}


/* =========================================================
   KEYBOARD SHORTCUT
   CTRL + ENTER
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();


            if (
                generateBtn &&
                !generateBtn.disabled
            ) {

                generateDocument();
            }
        }

    }
);


/* =========================================================
   BACKEND STATUS
   ========================================================= */

async function checkBackend() {

    console.log(
        "Checking FastAPI backend..."
    );


    try {

        const response =
            await fetch(
                `${BACKEND_URL}/health`,
                {
                    method: "GET",

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Health check returned ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Backend connected:",
            data
        );


        setBackendStatus(true);


    } catch (error) {

        console.error(
            "Backend health check failed:",
            error
        );


        setBackendStatus(false);
    }
}


/* =========================================================
   UPDATE BACKEND STATUS UI
   ========================================================= */

function setBackendStatus(isOnline) {

    if (navStatusText) {

        navStatusText.textContent =
            isOnline
                ? "Backend Online"
                : "Backend Offline";
    }


    if (statusDot) {

        if (isOnline) {

            statusDot.classList.add(
                "online"
            );

        } else {

            statusDot.classList.remove(
                "online"
            );
        }
    }


    if (navStatus) {

        navStatus.setAttribute(
            "aria-label",
            isOnline
                ? "Backend is online"
                : "Backend is offline"
        );
    }
}


/* =========================================================
   DATE DEFAULT
   ========================================================= */

function setDefaultDate() {

    if (
        !effectiveDate ||
        effectiveDate.value
    ) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    effectiveDate.value =
        `${year}-${month}-${day}`;
}


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "LegalEase JavaScript loaded successfully."
        );


        console.log(
            "Backend URL:",
            BACKEND_URL
        );


        checkElements();


        setDefaultDate();


        updateWordCount();


        checkBackend();

    }
);