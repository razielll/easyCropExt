'use strict';

let selectionBox;
let dimensionBox;
let sx, sy, ex, ey = -1;
let modal;
let width;
let height;
let lastFocus;
window.onload = init()

function init() {
    if (!document.body) return;
    addListeners();
    addSelectionBoxElement();
    buildAndAppendModal();
    console.log('Screenshot app ready to use!\nShift + select an area with your  mouse');
};


function getCanvasOfBody(w, h) {
    clearSelectionBox();
    try {
        html2canvas(document.body, {
            letterRendering: 1, allowTaint: false, useCORS: true,
            onrendered: (canvas) => {
                const imageData = handleCanvasCrop(canvas, w, h);
                canvas.remove();
                handleModalContent(imageData);
            },
        });
    } catch (e) { console.log('Error getting body canvas *sad*', e) }
};

function handleCanvasCrop(canvas, w, h) {
    let ctx = canvas.getContext('2d');

    let sortedValues = {
        sx: sx < ex ? sx : ex,
        ex: ex > sx ? ex : sx,
        sy: sy < ey ? sy : ey,
        ey: ey > sy ? ey : sy,
    };

    let bodyCrop = ctx.getImageData(sortedValues.sx, sortedValues.sy, sortedValues.ex, sortedValues.ey);

    canvas.width = w;
    canvas.height = h;

    ctx.putImageData(bodyCrop, 0, 0);
    // let imageData = canvas.toDataURL("image/png");
    return canvas.toDataURL("image/png");;
};

function handleModalContent(imageData) {
    let modalImg = document.querySelector('.modal-image');
    modalImg.src = imageData
    let picName = 'snip';

    let linkEl = document.querySelector('.image-container');
    linkEl.href = imageData;
    linkEl.download = picName + '.jpeg';
    handleModalOpen()
    modalImg.onclick = function (e) {
        e.stopPropagation();
    };
};

function addListeners() {
    let listenerOptions = {
        capture: true,
        passive: true
    };
    document.body.addEventListener('mousedown', handleMouseDown, true);
    document.body.addEventListener('mousemove', handleMouseMove, listenerOptions);
    document.body.addEventListener('mouseup', handleMouseUp, listenerOptions);
};

function drawBox(w, h) {
    let startXdraw = sx < ex ? sx : sx - (sx - ex);
    let startYdaw = sy < ey ? sy : sy - (sy - ey);
    selectionBox.style.left = startXdraw + 'px';
    selectionBox.style.top = startYdaw + 'px';
    selectionBox.style.width = w + 'px';
    selectionBox.style.height = h + 'px';
    if (w > 70 && h > 22) {
        dimensionBox.style.fontSize = '12px';
    } else {
        dimensionBox.style.fontSize = '9px';
    }
    dimensionBox.innerHTML = `${w} &times; ${h}`;
};

function clearSelectionBox() {
    selectionBox.style.width = 0;
    selectionBox.style.height = 0;
    selectionBox.style.top = 0;
    selectionBox.style.left = 0;
};

function handleModalOpen() {
    modal = document.querySelector('#ssmodal');
    modal.classList.add('is-visible');
    document.body.classList.add('modal-open');

    document.body.addEventListener('keyup', handleEscKeyListener, true)
    lastFocus = document.activeElement;

    modal.onclick = modalClose;
};

function modalClose() {
    modal.classList.remove('is-visible');
    document.body.classList.remove('modal-open');
    document.body.removeEventListener('keyup', handleEscKeyListener, true);
    lastFocus && lastFocus.focus();
};




function handleMouseDown(e) {
    if (!e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();

    sx = e.pageX;
    sy = e.pageY;
    ex = 0;
    ey = 0;
};

function handleMouseMove(e) {
    if (!e.shiftKey || e.which !== 1) return clearSelectionBox();

    e.stopPropagation();

    ex = e.pageX;
    ey = e.pageY;
    width = Math.abs(sx - ex);
    height = Math.abs(sy - ey);

    drawBox(width, height);
};

function handleMouseUp(e) {
    if (!e.shiftKey || e.which !== 1) return clearSelectionBox();

    e.stopPropagation();

    ex = e.pageX;
    ey = e.pageY;
    width = Math.abs(sx - ex);
    height = Math.abs(sy - ey);
    // console.log(`SX: ${sx} SY: ${sy}\nEX: ${ex} EY: ${ey}`);
    getCanvasOfBody(width, height);
};

function handleEscKeyListener(e) {
    if ((e.key == "Escape" || e.keyCode === 27) && document.querySelector(".modal.is-visible")) {
        document.querySelector(".modal.is-visible").classList.remove('is-visible');
    };
};



function buildAndAppendModal() {

    let modalEl = document.createElement('div');
    modalEl.setAttribute('class', 'modal');
    modalEl.setAttribute('id', 'ssmodal');

    let modalDialogEl = document.createElement('div');
    modalDialogEl.setAttribute('class', 'modal-dialog');

    let modalHeaderEl = document.createElement('div');
    modalHeaderEl.setAttribute('class', 'modal-header title');
    modalHeaderEl.innerHTML = 'Click picture to save';

    let closeBtn = document.createElement('button');
    closeBtn.setAttribute('class', 'close-modal');
    closeBtn.setAttribute('aria-label', 'close');

    // let saveBtnEl = document.createElement('button')
    // saveBtnEl.setAttribute('class', 'screenshot-save-btn')
    // saveBtnEl.innerHTML = 'Save'
    // let cancelBtnEL = document.createElement('button')
    // cancelBtnEL.setAttribute('class', 'screenshot-cancel-btn')
    // cancelBtnEL.innerHTML = 'Close'

    // let btnsRowEl = document.createElement('div');
    // btnsRowEl.classList.add('modal-option-row')
    // btnsRowEl.appendChild(cancelBtnEL)
    // btnsRowEl.appendChild(saveBtnEl)
    // modalDialogEl.appendChild(btnsRowEl);
    closeBtn.innerHTML = '&times;';

    let linkEl = document.createElement('a');
    linkEl.setAttribute('class', 'image-container');
    let modalPictureEl = document.createElement('img');
    modalPictureEl.setAttribute('class', 'modal-image');

    linkEl.appendChild(modalPictureEl);
    modalHeaderEl.appendChild(closeBtn);
    modalDialogEl.appendChild(modalHeaderEl);
    modalDialogEl.appendChild(linkEl);
    modalEl.appendChild(modalDialogEl);
    document.body.appendChild(modalEl);
};

function addSelectionBoxElement() {
    let selectionBoxEl = document.createElement('div');
    let dimensionBoxEl = document.createElement('div');

    selectionBoxEl.setAttribute('class', 'screenshot-selection-box');
    dimensionBoxEl.setAttribute('class', 'screenshot-dimension-box');

    dimensionBox = dimensionBoxEl
    selectionBox = selectionBoxEl;

    selectionBox.appendChild(dimensionBox)
    document.body.appendChild(selectionBox);
};
