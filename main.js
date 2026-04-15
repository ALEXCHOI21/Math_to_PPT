// KaTeX Settings & Core Logic
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
    presetGrid.innerHTML = '';
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

// Update Preview using KaTeX
function updatePreview() {
    const val = latexInput.value.trim();
    if (!val) {
        output.innerHTML = '<span style="color: var(--text-secondary)">수식을 입력해 주세요</span>';
        return;
    }

    try {
        katex.render(val, output, {
            throwOnError: false,
            displayMode: true,
            trust: true,
            strict: false
        });
    } catch (err) {
        console.error('KaTeX Error:', err);
        output.innerHTML = `<span style="color: var(--danger-color)">에러: ${err.message}</span>`;
    }
}

// Copy to Clipboard (PNG) using html2canvas
async function copyToClipboard() {
    try {
        const katexElement = output.querySelector('.katex-display');
        if (!katexElement) return;

        // Use html2canvas to capture the rendered math
        const canvas = await html2canvas(katexElement, {
            backgroundColor: null, // Transparent background
            scale: 4, // High Resolution for PPT
            logging: false,
            useCORS: true
        });

        canvas.toBlob(async (blob) => {
            try {
                const data = [new ClipboardItem({ 'image/png': blob })];
                await navigator.clipboard.write(data);
                
                // Success Feedback
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '복사 완료!';
                copyBtn.style.background = 'var(--success-color)';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.background = 'var(--accent-gradient)';
                }, 2000);
            } catch (err) {
                console.error('Clipboard write failed:', err);
                alert('클립보드 복사에 실패했습니다. 브라우저 보안 설정을 확인해주세요.');
            }
        }, 'image/png');

    } catch (err) {
        console.error('Error in copyToClipboard:', err);
    }
}

// Download High-Res PNG (Since KaTeX is HTML-based, PNG is more reliable than SVG here)
function downloadImage() {
    const katexElement = output.querySelector('.katex-display');
    if (!katexElement) return;

    html2canvas(katexElement, {
        backgroundColor: null,
        scale: 5,
        logging: false
    }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `math-eq-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Event Listeners
latexInput.addEventListener('input', updatePreview);
clearBtn.addEventListener('click', () => {
    latexInput.value = '';
    updatePreview();
});
copyBtn.addEventListener('click', copyToClipboard);
downloadSvgBtn.addEventListener('click', downloadImage); 
// Note: Changed button function to Download PNG as it's more reliable with KaTeX HTML output

// Init
initPresets();
// Ensure KaTeX is loaded before first render
window.onload = () => {
    updatePreview();
};
