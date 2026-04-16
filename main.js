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
const presets = [
    // --- Algebra & Basic Math ---
    { name: "근의 공식 (Quadratic Formula)", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", tags: "이차방정식 algebra" },
    { name: "이항 정리 (Binomial Theorem)", latex: "(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k", tags: "algebra" },
    { name: "로그 성질 (Logarithm)", latex: "\\log_a (xy) = \\log_a x + \\log_a y", tags: "log algebra" },
    { name: "등비수열의 합 (Geometric Series)", latex: "S_n = \\frac{a(1-r^n)}{1-r}", tags: "series algebra" },
    { name: "복소수 (Complex Number)", latex: "z = a + bi = r(\\cos \\theta + i \\sin \\theta)", tags: "complex algebra" },

    // --- Trigonometry ---
    { name: "피타고라스 정리 (Pythagorean)", latex: "a^2 + b^2 = c^2", tags: "trig triangle" },
    { name: "삼각함수 항등식 (Trig Identity)", latex: "\\sin^2 \\theta + \\cos^2 \\theta = 1", tags: "trig" },
    { name: "사인 법칙 (Law of Sines)", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}", tags: "trig triangle" },
    { name: "코사인 법칙 (Law of Cosines)", latex: "c^2 = a^2 + b^2 - 2ab \\cos C", tags: "trig triangle" },
    { name: "배각 공식 (Double Angle)", latex: "\\sin 2\\theta = 2 \\sin \\theta \\cos \\theta", tags: "trig" },
    { name: "탄젠트 덧셈 (Tan Addition)", latex: "\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A \\tan B}", tags: "trig" },

    // --- Calculus ---
    { name: "미분 정의 (Derivative Definition)", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", tags: "calculus limit" },
    { name: "연쇄 법칙 (Chain Rule)", latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}", tags: "calculus" },
    { name: "미적분학 기본정리 (FTC)", latex: "\\int_a^b f(x) dx = F(b) - F(a)", tags: "calculus integral" },
    { name: "테일러 급수 (Taylor Series)", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n", tags: "calculus series" },
    { name: "부분 적분 (Integration by Parts)", latex: "\\int u dv = uv - \\int v du", tags: "calculus integral" },
    { name: "가우스 적분 (Gaussian Integral)", latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", tags: "calculus integral" },
    { name: "치환 적분 (Substitution)", latex: "\\int f(g(x))g'(x) dx = \\int f(u) du", tags: "calculus integral" },

    // --- Physics ---
    { name: "뉴턴 제2법칙 (Newton's 2nd)", latex: "F = ma", tags: "physics mechanics" },
    { name: "질량-에너지 등가성 (Einstein)", latex: "E = mc^2", tags: "physics relativity" },
    { name: "슈뢰딩거 방정식 (Schrödinger)", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", tags: "physics quantum" },
    { name: "불확정성 원리 (Uncertainty)", latex: "\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}", tags: "physics quantum" },
    { name: "맥스웰 방정식 (Maxwell - Gauss)", latex: "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}", tags: "physics em" },
    { name: "맥스웰 방정식 (Maxwell - Faraday)", latex: "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}", tags: "physics em" },
    { name: "오일러 공식 (Euler's Identity)", latex: "e^{i\\pi} + 1 = 0", tags: "math physics" },
    { name: "로렌츠 인자 (Lorentz Factor)", latex: "\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}", tags: "physics relativity" },
    { name: "푸리에 변환 (Fourier Transform)", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx", tags: "physics calculus" },
    { name: "이상 기체 상태 방정식 (Ideal Gas)", latex: "PV = nRT", tags: "physics thermo" },
    { name: "엔트로피 (Entropy)", latex: "S = k_B \\ln \\Omega", tags: "physics thermo" },
    { name: "만유인력 법칙 (Gravity)", latex: "F = G \\frac{m_1 m_2}{r^2}", tags: "physics mechanics" },

    // --- Statistics & Probability ---
    { name: "베이즈 정리 (Bayes' Theorem)", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}", tags: "stats prob" },
    { name: "정규 분포 (Normal Distribution)", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}", tags: "stats" },
    { name: "표준 편차 (Standard Deviation)", latex: "\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}", tags: "stats" },
    { name: "조합 (Combination)", latex: "C(n, k) = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}", tags: "stats prob" },
    { name: "기댓값 (Expected Value)", latex: "E[X] = \\sum x_i P(x_i)", tags: "stats prob" },

    // --- Geometry ---
    { name: "원의 넓이 (Area of Circle)", latex: "A = \\pi r^2", tags: "geometry" },
    { name: "구의 부피 (Volume of Sphere)", latex: "V = \\frac{4}{3} \\pi r^3", tags: "geometry" },
    { name: "오일러 다면체 정리 (Polyhedron)", latex: "V - E + F = 2", tags: "geometry topo" },
    
    // --- Advanced Math ---
    { name: "리만 제타 함수 (Riemann Zeta)", latex: "\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}", tags: "math" },
    { name: "나비에-스토크스 (Navier-Stokes)", latex: "\\rho(\\frac{\\partial \\vec{v}}{\\partial t} + \\vec{v} \\cdot \\nabla \\vec{v}) = -\\nabla p + \\mu \\nabla^2 \\vec{v} + \\vec{f}", tags: "math physics" },
    { name: "라플라스 변환 (Laplace)", latex: "F(s) = \\int_0^{\\infty} f(t) e^{-st} dt", tags: "math calculus" }
];

// Initialize Presets with Filtering
function initPresets(filterText = '') {
    presetGrid.innerHTML = '';
    const filtered = presets.filter(p => 
        p.name.toLowerCase().includes(filterText.toLowerCase()) || 
        p.tags.toLowerCase().includes(filterText.toLowerCase())
    );

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
            // Scroll to preview for better UX on mobile
            window.scrollTo({ top: document.querySelector('.preview-card').offsetTop - 20, behavior: 'smooth' });
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
initPresets();
window.onload = () => {
    updatePreview();
};
