function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes) {
        return '0 Byte';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

const element = (tag, classes = [], content) => {
    const $node = document.createElement(tag);

    if (classes.length) {
        $node.classList.add(...classes)
    }

    if (content) {
        $node.textContent = content;
    }

    return $node;
}

function noop() {}

export function upload(selector, options = {}) {
    let files = [];
    const onUpload = options.onUpload ?? noop;
    const $input = document.querySelector(selector);
    const $open = element('button', ['btn'], 'Открыть');
    const $upload = element('button', ['btn', 'primary'], 'Загрузить');
    const $preview = element('div', ['preview']);

    $upload.style.display = 'none';

    $input.insertAdjacentElement('afterend', $preview);
    $input.insertAdjacentElement('afterend', $upload);
    $input.insertAdjacentElement('afterend', $open);

    if (options.multi) {
        $input.setAttribute('multiple', true);
    }

    if (options.accept && Array.isArray(options.accept)) {
        $input.setAttribute('accept', options.accept.join(','));
    }

    const trigger$input = () => $input.click();

    const changeHandler = event => {
        if (!event.target.files) {
            return;
        }

        files = Array.from(event.target.files);
        $preview.innerHTML = '';
        $upload.style.display = 'inline';

        files.forEach(file => {
            if (!file.type.match('image')) {
                return;
            }

            const reader = new FileReader();

            reader.onload = ev => {
                const src = ev.target.result;
                $preview.insertAdjacentHTML('beforeend', `<div class="preview-image">
                        <div class="preview-remove" data-name=${file.name}>&times;</div>
                        <img src="${src}" alt="${file.name}" />
                        <div class="preview-info">
                            <span>${file.name}</span>
                            Size ${bytesToSize(file.size)}
                        </div>
                    </div>`);
            }

            reader.readAsDataURL(file);
        });
    }

    const removeHandler = event => {
        if (!event.target.dataset.name) {
            return;
        }

        const {
            name
        } = event.target.dataset;

        files = files.filter(file => file.name !== name);

        if (!files.length) {
            $upload.style.display = 'none';
        }

        const $block = $preview.querySelector(`[data-name="${name}"]`).closest('.preview-image');
        $block.classList.add('removing');
        $block.addEventListener('transitionend', () => {
            $block.remove();
        });
    }

    const clearaPreview = el => {
        el.style.bottom = '0px';
        el.innerHTML = '<div class="preview-info-progress"></div>';
    }

    const uploadHandler = () => {
        $preview.querySelectorAll('.preview-remove').forEach(e => e.remove());
        const previewInfo = $preview.querySelectorAll('.preview-info');
        previewInfo.forEach(clearaPreview);
        onUpload(files, previewInfo);
    }

    $open.addEventListener('click', trigger$input);
    $input.addEventListener('change', changeHandler);
    $preview.addEventListener('click', removeHandler);
    $upload.addEventListener('click', uploadHandler)
}