// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
    },
    svg: {
        fontCache: 'global'
    },
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
            window.mathjaxReady = true;
            if (typeof updatePreview === 'function') updatePreview();
        }
    }
};

const latexInput = document.getElementById('latex-input');
const output = document.getElementById('output');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadSvgBtn = document.getElementById('download-svg-btn');
const presetGrid = document.getElementById('preset-grid');

// Presets Data
const presets = [
    { name: "근의 공식", latex: "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { name: "피타고라스 정리", latex: "a^2 + b^2 = c^2" },
    { name: "오일러 공식", latex: "e^{i\\pi} + 1 = 0" },
    { name: "가우스 적분", latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" },
    { name: "슈뢰딩거 방정식", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi" },
    { name: "푸리에 변환", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx" }
];

// Initialize Presets
function initPresets() {
    presets.forEach(p => {
        const div = document.createElement('div');
        div.className = 'preset-item';
        div.innerHTML = `<div>${p.name}</div><code>${p.latex}</code>`;
        div.onclick = () => {
            latexInput.value = p.latex;
            updatePreview();
        };
        presetGrid.appendChild(div);
    });
}

// Update Preview
function updatePreview() {
    const val = latexInput.value.trim();
    if (!val) {
        output.innerHTML = '$$ \\text{수식을 입력해 주세요} $$';
    } else {
        output.innerHTML = '$$ ' + val + ' $$';
    }
    
    // Trigger MathJax re-render
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([output]).catch((err) => console.log(err.message));
    }
}

// Copy to Clipboard (PNG)
async function copyToClipboard() {
    try {
        const container = output.querySelector('mjx-container');
        if (!container) return;

        const svg = container.querySelector('svg');
        if (!svg) return;

        // Clone SVG to modify it for canvas
        const clonedSvg = svg.cloneNode(true);
        const width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
        const height = svg.viewBox.baseVal.height || svg.height.baseVal.value;
        
        // Scale factor for high-DPI
        const scale = 4; 
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = async () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            
            canvas.toBlob(async (blob) => {
                try {
                    const data = [new ClipboardItem({ 'image/png': blob })];
                    await navigator.clipboard.write(data);
                    
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '복사 완료!';
                    copyBtn.style.background = 'var(--success-color)';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.background = 'var(--accent-gradient)';
                    }, 2000);
                } catch (err) {
                    console.error('Clipboard write failed:', err);
                    alert('클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
                }
            }, 'image/png');
        };
        img.src = url;

    } catch (err) {
        console.error('Error in copyToClipboard:', err);
    }
}

// Download SVG
function downloadSVG() {
    const container = output.querySelector('mjx-container');
    if (!container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `eq-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Event Listeners
latexInput.addEventListener('input', updatePreview);
clearBtn.addEventListener('click', () => {
    latexInput.value = '';
    updatePreview();
});
copyBtn.addEventListener('click', copyToClipboard);
downloadSvgBtn.addEventListener('click', downloadSVG);

// Init
initPresets();
updatePreview();
