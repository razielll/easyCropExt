'use strict';
//=============================================================================
// Easy Crop app  v 0.0.2
//=============================================================================

const EZ_CROP_APP = {
    sx: -1,
    sy: -1,
    ex: -1,
    ey: -1,
    width: 0,
    height: 0,
    isScreenshot: false,
    animationFrameId: NaN,
    modalEl: null,
    modalHeaderEl: null,
    modalDialogEl: null,
    modalCloseBtnEl: null,
    modalLinkEl: null,
    modalImageEl: null,
    selectionBoxEl: null,
    dimensionBoxEl: null,
};

window.onload = init();

// =============================================================================
// Modal
// =============================================================================
function handleModalContent(imageData) {
    EZ_CROP_APP.modalImageEl.src = imageData;
    EZ_CROP_APP.modalLinkEl.href = imageData;
    EZ_CROP_APP.modalLinkEl.download = 'EZcrop.jpeg';
};
function handleModalOpen() {
    EZ_CROP_APP.modalEl.classList.add('is-visible');
    document.body.classList.add('ezcrop-modal-open');
    document.body.addEventListener('keyup', handleEscapeKey, true)
};
function handleModalClose() {
    EZ_CROP_APP.modalEl.classList.remove('is-visible');
    document.body.classList.remove('ezcrop-modal-open');
    document.body.removeEventListener('keyup', handleEscapeKey, true);
};
// =============================================================================
// Mouse & Keys
// =============================================================================
function handleMouseDown(e) {
    if (!e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();
    EZ_CROP_APP.selectionBoxEl.style.visibility = 'visible';

    EZ_CROP_APP.sx = e.pageX;
    EZ_CROP_APP.sy = e.pageY;
    EZ_CROP_APP.ex = 0;
    EZ_CROP_APP.ey = 0;
};
function handleMouseMove(e) {
    if (!e.shiftKey || e.which !== 1) return clearSelectionBox();

    e.stopPropagation();

    EZ_CROP_APP.ex = e.pageX;
    EZ_CROP_APP.ey = e.pageY;

    EZ_CROP_APP.width = Math.abs(EZ_CROP_APP.sx - EZ_CROP_APP.ex);
    EZ_CROP_APP.height = Math.abs(EZ_CROP_APP.sy - EZ_CROP_APP.ey);

    EZ_CROP_APP.animationFrameId = requestAnimationFrame(drawSelectionBox);
};
function handleMouseUp(e) {
    if (!e.shiftKey || e.which !== 1) return clearSelectionBox();

    e.stopPropagation();

    EZ_CROP_APP.ex = e.pageX;
    EZ_CROP_APP.ey = e.pageY;

    EZ_CROP_APP.width = Math.abs(EZ_CROP_APP.sx - EZ_CROP_APP.ex);
    EZ_CROP_APP.height = Math.abs(EZ_CROP_APP.sy - EZ_CROP_APP.ey);

    EZCROP_GET_IMAGE();
};
function handleEscapeKey(e) {
    if ((e.key == "Escape" || e.keyCode === 27) && document.querySelector(".ezcrop-modal.is-visible")) {
        EZ_CROP_APP.modalEl.classList.remove('is-visible');
    };
};
// =============================================================================
// Drawing & DOM
// =============================================================================
function buildAndAppendBoxes() {
    let selectionBoxEl = document.createElement('div');
    let dimensionBoxEl = document.createElement('div');

    selectionBoxEl.setAttribute('class', 'ezcrop-selection-box');
    dimensionBoxEl.setAttribute('class', 'ezcrop-dimension-box');

    EZ_CROP_APP.dimensionBoxEl = dimensionBoxEl;
    EZ_CROP_APP.selectionBoxEl = selectionBoxEl;

    EZ_CROP_APP.selectionBoxEl.appendChild(EZ_CROP_APP.dimensionBoxEl);
    document.body.appendChild(EZ_CROP_APP.selectionBoxEl);
};
function buildAndAppendModal() {

    let modalEl = document.createElement('div');
    modalEl.setAttribute('class', 'ezcrop-modal');
    EZ_CROP_APP.modalEl = modalEl;
    EZ_CROP_APP.modalEl.onclick = handleModalClose;

    let dialogEl = document.createElement('div');
    dialogEl.setAttribute('class', 'ezcrop-modal-dialog');
    EZ_CROP_APP.modalDialogEl = dialogEl;

    let headerEl = document.createElement('div');
    headerEl.setAttribute('class', 'ezcrop-modal-header');
    headerEl.innerHTML = 'Click picture to save';
    EZ_CROP_APP.modalHeaderEl = headerEl;

    let btnEl = document.createElement('button');
    btnEl.setAttribute('class', 'ezcrop-close-modal');
    btnEl.setAttribute('aria-label', 'close');
    btnEl.innerHTML = '&times;';
    EZ_CROP_APP.modalCloseBtnEl = btnEl;

    let linkEl = document.createElement('a');
    linkEl.setAttribute('class', 'ezcrop-image-container');
    EZ_CROP_APP.modalLinkEl = linkEl;

    let imageEl = document.createElement('img');
    imageEl.setAttribute('class', 'ezcrop-modal-image');
    imageEl.onclick = function (e) { e.stopPropagation(); };
    EZ_CROP_APP.modalImageEl = imageEl;

    linkEl.appendChild(imageEl);
    headerEl.appendChild(btnEl);
    dialogEl.appendChild(headerEl);
    dialogEl.appendChild(linkEl);
    modalEl.appendChild(dialogEl);

    document.body.appendChild(modalEl);
};
function drawSelectionBox() {
    let { sx, ex, sy, ey, width, height, selectionBoxEl } = EZ_CROP_APP;

    let startXdraw = sx < ex ? sx : sx - (sx - ex);
    let startYdaw = sy < ey ? sy : sy - (sy - ey);

    selectionBoxEl.style.left = startXdraw + 'px';
    selectionBoxEl.style.top = startYdaw + 'px';
    selectionBoxEl.style.width = width + 'px';
    selectionBoxEl.style.height = height + 'px';

    drawDimensionBox(width > 70 && height > 22);
};
function drawDimensionBox(isSmall) {
    let { width, height, dimensionBoxEl } = EZ_CROP_APP;

    if (isSmall) {
        dimensionBoxEl.style.fontSize = '12px';
    } else {
        dimensionBoxEl.style.fontSize = '9px';
    }

    dimensionBoxEl.innerHTML = `${width} &times; ${height}`;
};
function clearSelectionBox() {
    EZ_CROP_APP.selectionBoxEl.style.visibility = 'hidden';
    cancelAnimationFrame(EZ_CROP_APP.animationFrameId);
};
function addListeners() {
    document.body.addEventListener('mousedown', handleMouseDown, true);
    document.body.addEventListener('mousemove', handleMouseMove, {
        capture: true,
        passive: true
    });
    document.body.addEventListener('mouseup', handleMouseUp, {
        capture: true,
        passive: true
    });
};
// =============================================================================
// App
// =============================================================================
function EZCROP_GET_IMAGE() {
    clearSelectionBox();
    try {
        html2canvas(document.body, {
            letterRendering: 1, allowTaint: false, useCORS: true,
            onrendered: (canvas) => {
                let imageData;
                if (EZ_CROP_APP.isScreenshot) {
                    imageData = canvas.toDataURL('image/png');
                } else {
                    imageData = handleCrop(canvas);
                }
                canvas.remove();
                handleModalContent(imageData);
                handleModalOpen();
            },
        });
    } catch (e) {
        console.error(e)
    };
};
function handleCrop(canvas) {
    let ctx = canvas.getContext('2d');

    let { sx, ex, sy, ey, width, height } = EZ_CROP_APP;

    let sorted = {
        sx: sx < ex ? sx : ex,
        ex: ex > sx ? ex : sx,
        sy: sy < ey ? sy : ey,
        ey: ey > sy ? ey : sy,
    };

    let bodyCrop = ctx.getImageData(sorted.sx, sorted.sy, sorted.ex, sorted.ey);

    canvas.width = width;
    canvas.height = height;

    ctx.putImageData(bodyCrop, 0, 0);

    return canvas.toDataURL('image/png');
};
// =============================================================================
// @&@@&@@&@ Thanks for viewing @&@@&@@&@
// =============================================================================
function init() {
    addListeners();
    buildAndAppendBoxes();
    buildAndAppendModal();
    addScreenShotShortCut();
};

function addScreenShotShortCut() {
    document.body.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.which == 65) {
            EZ_CROP_APP.isScreenshot = true;
            EZCROP_GET_IMAGE();
        }
    }, { capture: true, passive: true })

}
