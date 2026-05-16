// ============================================================
// Antigravity Math Engine v1.7.1
// KaTeX 폰트 HEAD 인라인 주입 방식 - PPT 서체 불일치 완전 해결
// ============================================================
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

// ── 폰트 주입 상태 플래그 ────────────────────────────────────
let _fontsInjected = false;

/**
 * KaTeX 폰트를 base64로 변환하여 <head>에 <style> 태그로 직접 주입합니다.
 * html-to-image가 DOM 클론 시 인라인 스타일을 자동으로 포함하므로
 * PNG에 폰트가 완전히 임베딩됩니다.
 */
async function injectKaTeXFonts() {
    if (_fontsInjected) return;
    if (document.getElementById('katex-font-embed')) { _fontsInjected = true; return; }

    try {
        const BASE = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist';

        // 1. KaTeX CSS 가져오기
        let cssText = await fetch(`${BASE}/katex.min.css`).then(r => r.text());

        // 2. 모든 폰트 파일명 추출 (따옴표 포함/미포함 모두 처리)
        const fontSet = new Set();
        cssText.replace(/url\(['"]?fonts\/([^'"\)]+)['"]?\)/g, (_, f) => fontSet.add(f));

        // 3. 폰트 파일 → base64 병렬 변환
        const fontMap = {};
        await Promise.all([...fontSet].map(async (file) => {
            try {
                const buf = await fetch(`${BASE}/fonts/${file}`).then(r => r.arrayBuffer());
                // Uint8Array → base64 (대용량 안전 방식)
                const bytes = new Uint8Array(buf);
                const chunkSize = 8192;
                let binary = '';
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
                }
                const mime = file.endsWith('.woff2') ? 'font/woff2'
                           : file.endsWith('.woff')  ? 'font/woff'
                           : 'font/truetype';
                fontMap[file] = `data:${mime};base64,${btoa(binary)}`;
            } catch (e) {
                console.warn('폰트 로드 실패:', file, e);
            }
        }));

        // 4. CSS 내 상대경로를 Data URL로 치환
        const embeddedCSS = cssText.replace(
            /url\(['"]?fonts\/([^'"\)]+)['"]?\)/g,
            (_, file) => fontMap[file] ? `url('${fontMap[file]}')` : `url('fonts/${file}')`
        );

        // 5. ★ 핵심: <head>에 인라인 <style>로 직접 주입
        //    html-to-image는 DOM 클론 시 인라인 스타일을 자동 포함 → PNG에 폰트 완전 임베딩
        const styleTag = document.createElement('style');
        styleTag.id = 'katex-font-embed';
        styleTag.textContent = embeddedCSS;
        document.head.appendChild(styleTag);

        _fontsInjected = true;
        console.log(`✅ KaTeX 폰트 ${Object.keys(fontMap).length}개 HEAD 주입 완료 → PNG 복사 준비됨`);

    } catch (err) {
        console.error('KaTeX 폰트 주입 실패:', err);
    }
}

// ── 수식 프리셋 데이터베이스 ─────────────────────────────────
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
    { category: "CSAT", name: "[260428] 조건 (나) 수식 2", latex: "\\left\\{ g(-1), \\, -\\frac{7}{2}g(1) \\right\\}", tags: "킬러" },
    { category: "CSAT", name: "[260428] 구하는 값", latex: "g(-5)", tags: "킬러" },
    { category: "CSAT", name: "[260428] 단서 조건", latex: "\\left( g(-1) \\neq -\\frac{7}{2}g(1) \\right)", tags: "킬러" },
    { category: "CSAT", name: "[260506] f(x) 정의", latex: "f(x) = x^2 + 6x + 12", tags: "수능 킬러" },
    { category: "CSAT", name: "[260506] 조건 극한식", latex: "\\lim_{x \\to a} \\frac{x^2}{(f(x))^2 - k(x+2)f(x)}", tags: "수능 킬러" },
    { category: "CSAT", name: "[260509] 미정계수의 결정 기본", latex: "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = L", tags: "수능 필수 극한" },
    { category: "CSAT", name: "[260509] 미정계수 성질 ①", latex: "\\lim_{x \\to a} g(x) = 0 \\implies \\lim_{x \\to a} f(x) = 0", tags: "수능 필수 극한" },
    { category: "CSAT", name: "[260509] 미정계수 성질 ②", latex: "L \\neq 0, \\, \\lim_{x \\to a} f(x) = 0 \\implies \\lim_{x \\to a} g(x) = 0", tags: "수능 필수 극한" },
    { category: "CSAT", name: "[260509] 미정계수 예제 (루트)", latex: "\\lim_{x \\to 1} \\frac{\\sqrt{x+3}-k}{x-1} = \\frac{1}{4}", tags: "수능 필수 극한" },
    { category: "CSAT", name: "[260509] 극한값의 존재 조건", latex: "\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a+} f(x) = \\lim_{x \\to a-} f(x) = L", tags: "수능 필수 극한" },
    { category: "CSAT", name: "[260509] 좌우극한 불일치 결론", latex: "\\therefore \\lim_{x \\to 1+} f(x) \\neq \\lim_{x \\to 1-} f(x)", tags: "수능 필수 극한" },

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
    { category: "Math I/II", name: "절댓값 표시", latex: "\\left| x \\right|", tags: "basic" },
    { category: "Math I/II", name: "부등호 (이상/이하)", latex: "\\ge, \\le", tags: "basic" },

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
];

let currentCategory = 'All';

// ── 라이브러리 프리셋 초기화 ─────────────────────────────────
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
        
        const mathContainer = document.createElement('div');
        mathContainer.className = 'preset-math';
        
        div.innerHTML = `<div>${p.name}</div>`;
        div.appendChild(mathContainer);
        
        const renderMath = () => {
            if (window.katex) {
                try {
                    // 라이브러리도 displayMode: true로 통일 → 동일한 KaTeX Serif 서체 사용
                    katex.render(p.latex, mathContainer, {
                        throwOnError: false,
                        displayMode: true,
                        trust: true,
                        strict: false
                    });
                } catch (e) {
                    console.error('KaTeX Library Render Error:', e);
                    mathContainer.textContent = p.latex;
                }
            } else {
                setTimeout(renderMath, 100);
            }
        };
        renderMath();

        div.onclick = () => {
            latexInput.value = p.latex;
            updatePreview();
            window.scrollTo({ top: document.querySelector('.preview-card').offsetTop - 20, behavior: 'smooth' });
        };
        presetGrid.appendChild(div);
    });
}

// ── 카테고리 탭 ───────────────────────────────────────────────
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

// ── 실시간 프리뷰 업데이트 ───────────────────────────────────
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

// ── 캡처 옵션 (폰트는 HEAD 주입으로 처리) ────────────────────
function getCaptureOptions(withBackground = false) {
    return {
        pixelRatio: 4,
        backgroundColor: withBackground ? '#ffffff' : null,
        style: { padding: '20px 24px' },
        // 외부 리소스를 직접 fetch하지 않음 (이미 HEAD에 인라인으로 있음)
        skipFonts: false,
    };
}

// ── 클립보드 PNG 복사 ─────────────────────────────────────────
async function copyToClipboard() {
    const originalHTML = copyBtn.innerHTML;
    try {
        const katexElement = output.querySelector('.katex-display');
        if (!katexElement) { alert('먼저 수식을 입력해 주세요.'); return; }

        copyBtn.innerHTML = '⏳ 처리 중...';
        copyBtn.disabled = true;

        // 폰트가 HEAD에 주입됐는지 확인 (최초 1회)
        await injectKaTeXFonts();
        await document.fonts.ready;

        const blob = await htmlToImage.toBlob(katexElement, getCaptureOptions(false));
        if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            copyBtn.innerHTML = '✅ 복사 완료!';
            copyBtn.style.background = 'var(--success-color)';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.background = '';
                copyBtn.disabled = false;
            }, 2000);
        }
    } catch (err) {
        console.error('copyToClipboard 오류:', err);
        copyBtn.innerHTML = originalHTML;
        copyBtn.disabled = false;
        alert('클립보드 복사 실패\n' + err.message);
    }
}

// ── PNG 다운로드 ──────────────────────────────────────────────
async function downloadImage() {
    const originalHTML = downloadSvgBtn.innerHTML;
    try {
        const katexElement = output.querySelector('.katex-display');
        if (!katexElement) { alert('먼저 수식을 입력해 주세요.'); return; }

        downloadSvgBtn.innerHTML = '⏳ 생성 중...';
        downloadSvgBtn.disabled = true;

        await injectKaTeXFonts();
        await document.fonts.ready;

        const dataUrl = await htmlToImage.toPng(katexElement, getCaptureOptions(false));
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `math-eq-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        downloadSvgBtn.innerHTML = '✅ 다운로드 완료!';
        setTimeout(() => { downloadSvgBtn.innerHTML = originalHTML; downloadSvgBtn.disabled = false; }, 2000);

    } catch (err) {
        console.error('downloadImage 오류:', err);
        downloadSvgBtn.innerHTML = originalHTML;
        downloadSvgBtn.disabled = false;
        alert('이미지 생성 실패: ' + err.message);
    }
}

// ── 이벤트 리스너 ────────────────────────────────────────────
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

// ── 초기화 ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    initPresets();
    updatePreview();

    // 백그라운드에서 KaTeX 폰트를 HEAD에 미리 주입 (첫 복사 시 지연 제거)
    injectKaTeXFonts();
});
