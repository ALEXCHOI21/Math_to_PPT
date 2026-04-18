// KaTeX Settings & Core Logic
const latexInput = document.getElementById('latex-input');
const output = document.getElementById('output');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadSvgBtn = document.getElementById('download-svg-btn');
const presetGrid = document.getElementById('preset-grid');
const searchInput = document.getElementById('preset-search');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModal = document.querySelector('.close-modal');

// Comprehensive Presets Database (50+ Formulas)
// Comprehensive Presets Database (70+ Formulas)
const presets = [
    // --- CSAT Specialized (2026 수능 특화) ---
    { category: "CSAT", name: "[2026 수능] 사인법칙 활용", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = 2R", tags: "수능 필수 사인법칙" },
    { category: "CSAT", name: "[2026 수능] 코사인법칙 변형", latex: "\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}", tags: "수능 필수 코사인법칙" },
    { category: "CSAT", name: "[2026 수능] 등차수열의 합", latex: "S_n = \\frac{n\\{2a + (n-1)d\}}{2}", tags: "수능 필수 수열" },
    { category: "CSAT", name: "[2026 수능] 등비수열의 극한", latex: "\\lim_{n \\to \\infty} r^n = \\begin{cases} 0 & (|r|<1) \\\\ 1 & (r=1) \\end{cases}", tags: "수능 공통 극한" },
    { category: "CSAT", name: "[2026 수능] 삼각함수의 합성", latex: "a\\sin \\theta + b\\cos \\theta = \\sqrt{a^2+b^2}\\sin(\\theta+\\alpha)", tags: "수능 심화 미적분" },
    { category: "CSAT", name: "[2026 수능] 미적분 30번 최종식", latex: "g(a) \\times \\left( \\lim_{m \\to a^+} g(m) \\right) + g(b) \\times \\left( \\frac{\\ln b}{b} \\right)^2", tags: "수능 킬러" },

    // --- Math I/II (공통 과목) ---
    { category: "Math I/II", name: "지수 법칙 (Exponent Laws)", latex: "a^m \\cdot a^n = a^{m+n}, \\quad (a^m)^n = a^{mn}", tags: "수학I" },
    { category: "Math I/II", name: "로그 정의 (Log Definition)", latex: "y = \\log_a x \\iff x = a^y", tags: "수학I" },
    { category: "Math I/II", name: "함수의 극한 (Limit Definition)", latex: "\\lim_{x \\to a} f(x) = L", tags: "수학II" },
    { category: "Math I/II", name: "도함수 (Derivative)", latex: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}", tags: "수학II" },
    { category: "Math I/II", name: "정적분 (Definite Integral)", latex: "\\int_a^b f(x) dx = [F(x)]_a^b = F(b) - F(a)", tags: "수학II" },
    { category: "Math I/II", name: "근의 공식", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", tags: "기초" },

    // --- Calculus (미적분 심화) ---
    { category: "Calculus", name: "몫의 미분법 (Quotient Rule)", latex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}", tags: "미적분" },
    { category: "Calculus", name: "합성함수 미분 (Chain Rule)", latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}", tags: "미적분" },
    { category: "Calculus", name: "부분 적분 (Integration by Parts)", latex: "\\int u dv = uv - \\int v du", tags: "미적분" },
    { category: "Calculus", name: "치환 적분 (Substitution)", latex: "\\int f(g(x))g'(x) dx = \\int f(u) du", tags: "미적분" },
    { category: "Calculus", name: "역함수 미분법", latex: "(f^{-1})'(b) = \\frac{1}{f'(a)} \\quad (f(a)=b)", tags: "미적분" },

    // --- Prob/Geo (확통 & 기하) ---
    { category: "Prob/Geo", name: "중복조합 (H)", latex: "{}_n H_r = {}_{n+r-1} C_r", tags: "확통" },
    { category: "Prob/Geo", name: "조건부 확률", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}", tags: "확통" },
    { category: "Prob/Geo", name: "정규분포 표기", latex: "X \\sim N(\\mu, \\sigma^2)", tags: "확통" },
    { category: "Prob/Geo", name: "벡터 내적 (Dot Product)", latex: "\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}| \\cos \\theta", tags: "기하" },
    { category: "Prob/Geo", name: "타원 방정식 (Ellipse)", latex: "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1", tags: "기하" },

    // --- Basic & Algebra (기존 보존) ---
    { category: "Math I/II", name: "근의 공식", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", tags: "이차방정식" },
    { category: "Math I/II", name: "피타고라스 정리", latex: "a^2 + b^2 = c^2", tags: "trig" },
    { category: "Math I/II", name: "절댓값 표시", latex: "\\left| x \\right|", tags: "basic" }
];

let currentCategory = 'All';

// Initialize Presets with Filtering and Category
function initPresets(searchText = '') {
    presetGrid.innerHTML = '';
    
    const filtered = presets.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || 
                              p.tags.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = currentCategory === 'All' || p.category === currentCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        presetGrid.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem; text-align: center;">검색 결과가 없습니다.</div>';
        return;
    }

    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'preset-item';
        div.innerHTML = `<div>${p.name}</div><code>${p.latex}</code>`;
        div.onclick = () => {
            latexInput.value = p.latex;
            updatePreview();
            window.scrollTo({ top: document.querySelector('.preview-card').offsetTop - 20, behavior: 'smooth' });
        };
        presetGrid.appendChild(div);
    });
}

// Category Tab Logic
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            initPresets(document.getElementById('preset-search').value);
        });
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

// Download High-Res PNG
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
searchInput.addEventListener('input', (e) => initPresets(e.target.value));

clearBtn.addEventListener('click', () => {
    latexInput.value = '';
    updatePreview();
});

copyBtn.addEventListener('click', copyToClipboard);
downloadSvgBtn.addEventListener('click', downloadImage); 

// Modal Control Logic
function toggleModal() {
    const isVisible = helpModal.style.display === 'block';
    helpModal.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        // Render math in modal when opened
        if (window.renderMathInElement) {
            renderMathInElement(helpModal.querySelector('.modal-body'), {
                delimiters: [
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }
    }
}

helpBtn.addEventListener('click', toggleModal);
closeModal.addEventListener('click', toggleModal);
window.addEventListener('click', (e) => {
    if (e.target === helpModal) toggleModal();
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.style.display === 'block') toggleModal();
});

// Init
setupTabs();
initPresets();
window.onload = () => {
    updatePreview();
};
