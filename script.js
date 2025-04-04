document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const imageContainer = document.getElementById('image-container');
    const uploadImageBtn = document.getElementById('upload-image');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const posXInput = document.getElementById('pos-x');
    const posYInput = document.getElementById('pos-y');
    const applyChangesBtn = document.getElementById('apply-changes');
    const cancelChangesBtn = document.getElementById('cancel-changes');
    
    let selectedImage = null;
    let isDragging = false;
    let isResizing = false;
    let currentResizeHandle = null;
    let startX, startY, initialLeft, initialTop, initialWidth, initialHeight;

    // Função para adicionar uma nova imagem
    uploadImageBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    addImageToCanvas(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    });

    // Função que adiciona a imagem ao canvas
    function addImageToCanvas(src) {
        // Criar elemento de imagem
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'uploaded-image';
        
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Posição e tamanho inicial
        imgWrapper.style.width = '300px';
        imgWrapper.style.height = 'auto';
        imgWrapper.style.left = '250px';
        imgWrapper.style.top = '150px';
        
        // Adicionar a imagem ao wrapper
        imgWrapper.appendChild(img);
        
        // Adicionar alças de redimensionamento
        const resizeHandles = ['tl', 'tr', 'bl', 'br'];
        resizeHandles.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            handle.dataset.position = pos;
            imgWrapper.appendChild(handle);
        });
        
        // Adicionar ao contêiner
        imageContainer.appendChild(imgWrapper);
        
        // Selecionar a nova imagem
        selectImage(imgWrapper);
        
        // Adicionar listeners de evento para a imagem
        setupImageEvents(imgWrapper);
    }

    // Função para configurar eventos de movimentação e redimensionamento
    function setupImageEvents(imgElement) {
        // Evento de clique para selecionar
        imgElement.addEventListener('mousedown', function(e) {
            if (!e.target.classList.contains('resize-handle')) {
                selectImage(imgElement);
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = parseInt(imgElement.style.left) || 0;
                initialTop = parseInt(imgElement.style.top) || 0;
                e.preventDefault();
            }
        });

        // Eventos para as alças de redimensionamento
        const resizeHandles = imgElement.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', function(e) {
                selectImage(imgElement);
                isResizing = true;
                currentResizeHandle = e.target.dataset.position;
                startX = e.clientX;
                startY = e.clientY;
                initialWidth = parseInt(imgElement.style.width) || imgElement.offsetWidth;
                initialHeight = parseInt(imgElement.style.height) || imgElement.offsetHeight;
                initialLeft = parseInt(imgElement.style.left) || 0;
                initialTop = parseInt(imgElement.style.top) || 0;
                e.stopPropagation();
            });
        });
    }

    // Evento de movimento do mouse (para arrastar e redimensionar)
    document.addEventListener('mousemove', function(e) {
        if (isDragging && selectedImage) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            selectedImage.style.left = (initialLeft + deltaX) + 'px';
            selectedImage.style.top = (initialTop + deltaY) + 'px';
            
            // Atualizar campos de entrada
            updateInputFields();
        } else if (isResizing && selectedImage && currentResizeHandle) {
            e.preventDefault();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;
            
            // Lógica de redimensionamento baseada no handle
            switch(currentResizeHandle) {
                case 'br':
                    newWidth = initialWidth + deltaX;
                    newHeight = initialHeight + deltaY;
                    break;
                case 'bl':
                    newWidth = initialWidth - deltaX;
                    newHeight = initialHeight + deltaY;
                    newLeft = initialLeft + deltaX;
                    break;
                case 'tr':
                    newWidth = initialWidth + deltaX;
                    newHeight = initialHeight - deltaY;
                    newTop = initialTop + deltaY;
                    break;
                case 'tl':
                    newWidth = initialWidth - deltaX;
                    newHeight = initialHeight - deltaY;
                    newLeft = initialLeft + deltaX;
                    newTop = initialTop + deltaY;
                    break;
            }
            
            // Aplicar novos valores
            if (newWidth > 50) {
                selectedImage.style.width = newWidth + 'px';
                selectedImage.style.left = newLeft + 'px';
            }
            if (newHeight > 50) {
                selectedImage.style.height = newHeight + 'px';
                selectedImage.style.top = newTop + 'px';
            }
            
            // Atualizar campos de entrada
            updateInputFields();
        }
    });

    // Evento de soltar o mouse
    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
        currentResizeHandle = null;
    });

    // Função para selecionar uma imagem
    function selectImage(imgElement) {
        // Remover seleção anterior
        if (selectedImage) {
            selectedImage.classList.remove('selected');
        }
        
        // Definir nova seleção
        selectedImage = imgElement;
        selectedImage.classList.add('selected');
        
        // Atualizar campos de entrada com os valores atuais
        updateInputFields();
    }

    // Função para atualizar campos de entrada
    function updateInputFields() {
        if (selectedImage) {
            widthInput.value = parseInt(selectedImage.style.width) || selectedImage.offsetWidth;
            heightInput.value = parseInt(selectedImage.style.height) || selectedImage.offsetHeight;
            posXInput.value = parseInt(selectedImage.style.left) || 0;
            posYInput.value = parseInt(selectedImage.style.top) || 0;
        }
    }

    // Aplicar alterações dos campos de entrada
    applyChangesBtn.addEventListener('click', function() {
        if (selectedImage) {
            selectedImage.style.width = widthInput.value + 'px';
            selectedImage.style.height = heightInput.value + 'px';
            selectedImage.style.left = posXInput.value + 'px';
            selectedImage.style.top = posYInput.value + 'px';
        }
    });

    // Cancelar alterações
    cancelChangesBtn.addEventListener('click', function() {
        updateInputFields(); // Revertendo os campos para os valores atuais
    });
}); 