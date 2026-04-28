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

// Comprehensive Presets Database (80+ Formulas) - v1.5.4 Final Clean
const presets = [
    // --- CSAT Specialized (2026 수능 대비 전문) ---
    { category: "CSAT", name: "[수능] 사인법칙 활용", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = 2R", tags: "수능 필수 사인법칙" },
    { category: "CSAT", name: "[수능] 코사인법칙 변형", latex: "\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}", tags: "수능 필수 코사인법칙" },
    { category: "CSAT", name: "[수능] 등차수열의 합 (General)", latex: "S_n = \\frac{n\\{2a + (n-1)d\\}}{2}", tags: "수능 필수 수열" },
    { category: "CSAT", name: "[수능] 등비수열의 합", latex: "S_n = \\frac{a(1-r^n)}{1-r} \\quad (r \\neq 1)", tags: "수능 필수 수열" },
    { category: "CSAT", name: "[수능] 등비수열의 극한", latex: "\\lim_{n \\to \\infty} r^n = \\begin{cases} 0 & (|r|<1) \\\\ 1 & (r=1) \\end{cases}", tags: "수능 공통 극한" },
    { category: "CSAT", name: "[수능] 삼각함수의 합성", latex: "a\\sin \\theta + b\\cos \\theta = \\sqrt{a^2+b^2}\\sin(\\theta+\\alpha)", tags: "수능 심화 미적분" },
    { category: "CSAT", name: "[수능] 2026 미적분 30번 킬러", latex: "g(a) \\cdot \\left( \\lim_{m \\to a^+} g(m) \\right) + g(b) \\cdot \\left( \\frac{\\ln b}{b} \\right)^2", tags: "수능 킬러" },
    { category: "CSAT", name: "[수능] 합성함수의 미분", latex: "(f \\circ g)'(x) = f'(g(x))g'(x)", tags: "수능 미적분" },
    { category: "CSAT", name: "[260428] g(x) 정의", latex: "g(x) = \\begin{cases} -f(x) & (x < t) \\\\ f(x) & (x \\ge t) \\end{cases}", tags: "킬러" },
    { category: "CSAT", name: "[260428] 조건 (가) 수식", latex: "\\lim_{x \\to a^+} \\frac{g(x)}{x(x-2)}", tags: "킬러" },
    { category: "CSAT", name: "[260428] 조건 (나) 수식 1", latex: "\\lim_{x \\to m^+} \\frac{g(x)}{x(x-2)} < 0", tags: "킬러" },
    { category: "CSAT", name: "[260428] 조건 (나) 수식 2", latex: "m \\in \\{g(-1), -\\frac{7}{2}g(1)\\}", tags: "킬러" },
    { category: "CSAT", name: "[260428] 구하는 값", latex: "g(-5)", tags: "킬러" },
    { category: "CSAT", name: "[260428] 단서 조건", latex: "g(-1) \\neq -\\frac{7}{2}g(1)", tags: "킬러" },

    // --- Math I/II (공통 과목 핵심) ---
    { category: "Math I/II", name: "지수 법칙", latex: "a^m \\cdot a^n = a^{m+n}, \\quad (a^m)^n = a^{mn}", tags: "수학I algebra" },
    { category: "Math I/II", name: "로그 정의", latex: "y = \\log_a x \\iff x = a^y", tags: "수학I log" },
    { category: "Math I/II", name: "로그 합병/분리", latex: "\\log_a (xy) = \\log_a x + \\log_a y", tags: "수학I log" },
    { category: "Math I/II", name: "함수의 극한", latex: "\\lim_{x \\to a} f(x) = L", tags: "수학II limit" },
    { category: "Math I/II", name: "미분계수의 정의", latex: "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}", tags: "수학II calculus" },
    { category: "Math I/II", name: "정적분의 기본 정리", latex: "\\int_a^b f(x) dx = F(b) - F(a)", tags: "수학II integral" },
    { category: "Math I/II", name: "근의 공식", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", tags: "algebra 기초" },
    { category: "Math I/II", name: "피타고라스 정리", latex: "a^2 + b^2 = c^2", tags: "geometry" },
    { category: "Math I/II", name: "이항 정리", latex: "(a+b)^n = \\sum_{k=0}^n \\binom{n}{k} a^{n-k} b^k", tags: "algebra" },

    // --- Calculus (미적분 심화) ---
    { category: "Calculus", name: "몫의 미분법", latex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}", tags: "calculus" },
    { category: "Calculus", name: "부분 적분 (IBP)", latex: "\\int u dv = uv - \\int v du", tags: "calculus integral" },
    { category: "Calculus", name: "치환 적분 (Substitution)", latex: "\\int f(g(x))g'(x) dx = \\int f(u) du", tags: "calculus integral" },
    { category: "Calculus", name: "역함수 미분법", latex: "(f^{-1})'(b) = \\frac{1}{f'(a)}", tags: "calculus" },
    { category: "Calculus", name: "테일러 급수", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n", tags: "calculus series" },
    { category: "Calculus", name: "가우스 적분", latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", tags: "calculus integral" },
    { category: "Calculus", name: "푸리에 변환", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx", tags: "math physics" },
    { category: "Calculus", name: "라플라스 변환", latex: "F(s) = \\int_0^{\\infty} f(t) e^{-st} dt", tags: "math" },

    // --- Prob/Geo (확통 & 기하 전문) ---
    { category: "Prob/Geo", name: "중복조합 (H)", latex: "{}_n H_r = {}_{n+r-1} C_r", tags: "확통" },
    { category: "Prob/Geo", name: "조건부 확률 (Bayes)", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}", tags: "확통" },
    { category: "Prob/Geo", name: "이항 분포", latex: "X \\sim B(n, p) \\implies P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}", tags: "확통" },
    { category: "Prob/Geo", name: "정규분포 확률밀도", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}", tags: "확통" },
    { category: "Prob/Geo", name: "벡터 내적", latex: "\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}| \\cos \\theta", tags: "기하 vector" },
    { category: "Prob/Geo", name: "타원의 방정식", latex: "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1", tags: "기하 conic" },
    { category: "Prob/Geo", name: "쌍곡선 방정식", latex: "\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1", tags: "기하 conic" },

    // --- Science (전문 과학/공학) ---
    { category: "Science", name: "슈뢰딩거 방정식", latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", tags: "physics quantum" },
    { category: "Science", name: "맥스웰 - 가우스", latex: "\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}", tags: "physics em" },
    { category: "Science", name: "맥스웰 - 패러데이", latex: "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}", tags: "physics em" },
    { category: "Science", name: "질량-에너지 등가", latex: "E = mc^2", tags: "physics relativity" },
    { category: "Science", name: "뉴턴 제2법칙", latex: "F = m \\frac{d^2 x}{dt^2}", tags: "physics mechanics" },
    { category: "Science", name: "나비에-스토크스", latex: "\\rho(\\frac{\\partial \\vec{v}}{\\partial t} + \\vec{v} \\cdot \\nabla \\vec{v}) = -\\nabla p + \\mu \\nabla^2 \\vec{v} + \\vec{f}", tags: "engineering math" },
    { category: "Science", name: "리만 제타 함수", latex: "\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}", tags: "math" },
    { category: "Science", name: "오일러 항등식", latex: "e^{i\\pi} + 1 = 0", tags: "math physics" },

    // --- Basic & Others ---
    { category: "Math I/II", name: "절댓값 표시", latex: "\\left| x \\right|", tags: "basic" },
    { category: "Math I/II", name: "부등호 (이상/이하)", latex: "\\ge, \\le", tags: "basic" }
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

        const canvas = await html2canvas(katexElement, {
            backgroundColor: null,
            scale: 4,
            logging: false,
            useCORS: true
        });

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
            }
        }, 'image/png');

    } catch (err) {
        console.error('Error in copyToClipboard:', err);
    }
}

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

function toggleModal() {
    const isVisible = helpModal.style.display === 'block';
    helpModal.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
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
window.onload = updatePreview;
