const GREEN = "#9EEA2D";
const BLUE = "#4C5BFF";
const WHITE = "#FFFFFF";
const DARK_NAVY = "#061226";
const SIZE = 1200;
const SAFE = 72;
const DEFAULT_BRAND_LOGO_SRC = "./ai-quantec-header-logo.png";

const highlightRules = [
  ["데이터 기반 자산배분", GREEN],
  ["기관 수준 리스크 관리", BLUE],
  ["기술과 데이터를 기반으로", GREEN],
  ["가장 강력한 투자 파트너", BLUE],
  ["AI Quantec", GREEN],
];

const els = {
  imageInput: document.querySelector("#imageInput"),
  imageDropZone: document.querySelector("#imageDropZone"),
  imageFileSummary: document.querySelector("#imageFileSummary"),
  scriptInput: document.querySelector("#scriptInput"),
  brandInput: document.querySelector("#brandInput"),
  partnerInput: document.querySelector("#partnerInput"),
  eventTitleInput: document.querySelector("#eventTitleInput"),
  brandLogoInput: document.querySelector("#brandLogoInput"),
  partnerLogoToggle: document.querySelector("#partnerLogoToggle"),
  partnerLogoInput: document.querySelector("#partnerLogoInput"),
  partnerLogoField: document.querySelector("#partnerLogoField"),
  headerBrandLogo: document.querySelector("#headerBrandLogo"),
  headerBrandFallback: document.querySelector("#headerBrandFallback"),
  generateBtn: document.querySelector("#generateBtn"),
  sampleBtn: document.querySelector("#sampleBtn"),
  downloadAllBtn: document.querySelector("#downloadAllBtn"),
  downloadCollageBtn: document.querySelector("#downloadCollageBtn"),
  cardGrid: document.querySelector("#cardGrid"),
  collageCanvas: document.querySelector("#collageCanvas"),
  statusPill: document.querySelector("#statusPill"),
};

let generatedCards = [];
let headerLogoUrl = "";

els.imageInput.addEventListener("change", () => {
  updateImageFileSummary([...els.imageInput.files]);
});

["dragenter", "dragover"].forEach((eventName) => {
  els.imageDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.imageDropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.imageDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.imageDropZone.classList.remove("is-dragging");
  });
});

els.imageDropZone.addEventListener("drop", (event) => {
  const imageFiles = [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) {
    updateImageFileSummary([]);
    return;
  }
  const transfer = new DataTransfer();
  imageFiles.forEach((file) => transfer.items.add(file));
  els.imageInput.files = transfer.files;
  updateImageFileSummary(imageFiles);
});

els.partnerLogoToggle.addEventListener("change", () => {
  els.partnerLogoField.classList.toggle("is-visible", els.partnerLogoToggle.checked);
});

els.brandLogoInput.addEventListener("change", () => {
  if (headerLogoUrl) URL.revokeObjectURL(headerLogoUrl);
  const file = els.brandLogoInput.files[0];
  if (!file) {
    headerLogoUrl = "";
    els.headerBrandLogo.src = DEFAULT_BRAND_LOGO_SRC;
    els.headerBrandLogo.classList.add("is-visible");
    els.headerBrandFallback.classList.add("is-hidden");
    return;
  }
  headerLogoUrl = URL.createObjectURL(file);
  els.headerBrandLogo.src = headerLogoUrl;
  els.headerBrandLogo.classList.add("is-visible");
  els.headerBrandFallback.classList.add("is-hidden");
});

els.generateBtn.addEventListener("click", async () => {
  try {
    setStatus("생성중");
    els.generateBtn.disabled = true;
    generatedCards = [];

    const files = [...els.imageInput.files];
    const fullScript = els.scriptInput.value.trim();
    if (!files.length) throw new Error("세미나 사진을 1장 이상 선택하세요.");
    if (!fullScript) throw new Error("전체 행사 원고를 입력하세요.");

    const brandName = els.brandInput.value.trim() || "AI Quantec";
    const partnerName = els.partnerInput.value.trim();
    const eventTitle = els.eventTitleInput.value.trim();
    const brandLogo = els.brandLogoInput.files[0] ? await loadImageFile(els.brandLogoInput.files[0]) : null;
    const partnerLogo = els.partnerLogoToggle.checked && els.partnerLogoInput.files[0] ? await loadImageFile(els.partnerLogoInput.files[0]) : null;
    const images = await Promise.all(files.map(loadImageInfo));
    const copies = buildCardCopy(fullScript, brandName, partnerName, eventTitle);
    const assignments = assignImages(images);

    generatedCards = [1, 2, 3, 4].map((page) => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      renderCard(canvas, assignments[page], copies[page - 1], page, brandLogo, partnerLogo);
      return canvas;
    });

    renderPreview(generatedCards);
    renderCollage(generatedCards);
    els.downloadAllBtn.disabled = false;
    els.downloadCollageBtn.disabled = false;
    setStatus("완료");
  } catch (error) {
    alert(error.message);
    setStatus("확인");
  } finally {
    els.generateBtn.disabled = false;
  }
});

els.sampleBtn.addEventListener("click", async () => {
  setStatus("생성중");
  els.sampleBtn.disabled = true;
  try {
    const sampleScript =
      "6월 12일 유진투자증권 본사 16층 HRD센터에서 AI Quantec이 주최한 AI 알고리즘 투자전략 세미나가 개최되었습니다. " +
      "이번 세미나는 DF717과 함께 데이터 기반 자산배분 전략과 AI 알고리즘 운용 구조를 공유하며 새로운 투자 방향성을 제시한 뜻깊은 시간이었습니다. " +
      "이른 시간부터 많은 분들이 참석해 주셨으며, 세미나 내내 높은 집중도로 발표를 경청하는 모습이 인상적이었습니다. " +
      "글로벌 금융시장 트렌드와 매크로 인사이트에 대한 관심도 뜨거웠습니다. " +
      "실제 운용 데이터를 기반으로 한 성과 리뷰와 시장 대응 시나리오가 공개되며 참석자들의 관심은 더욱 높아졌습니다. " +
      "기관 수준 리스크 관리와 데이터 기반 자산배분 전략의 가치가 다시 한번 조명되었습니다. " +
      "세미나 말미에는 다양한 의견과 날카로운 질문이 이어졌습니다. " +
      "앞으로도 AI Quantec은 기술과 데이터를 기반으로 여러분의 가장 강력한 투자 파트너가 되겠습니다.";
    els.scriptInput.value = sampleScript;
    const images = makeSampleImages();
    const copies = buildCardCopy(sampleScript, "AI Quantec", "DF717", "");
    const assignments = assignImages(images);
    generatedCards = [1, 2, 3, 4].map((page) => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      renderCard(canvas, assignments[page], copies[page - 1], page, null, null);
      return canvas;
    });
    renderPreview(generatedCards);
    renderCollage(generatedCards);
    els.downloadAllBtn.disabled = false;
    els.downloadCollageBtn.disabled = false;
    setStatus("완료");
  } finally {
    els.sampleBtn.disabled = false;
  }
});

els.downloadAllBtn.addEventListener("click", () => {
  generatedCards.forEach((canvas, index) => downloadCanvas(canvas, `card_${index + 1}.png`));
});

els.downloadCollageBtn.addEventListener("click", () => {
  downloadCanvas(els.collageCanvas, "collage_2x2.png");
});

function setStatus(text) {
  els.statusPill.textContent = text;
}

function updateImageFileSummary(files) {
  if (!files.length) {
    els.imageFileSummary.textContent = "선택된 사진 없음";
    return;
  }
  const names = files.slice(0, 3).map((file) => file.name).join(", ");
  const suffix = files.length > 3 ? ` 외 ${files.length - 3}장` : "";
  els.imageFileSummary.textContent = `${files.length}장 선택됨: ${names}${suffix}`;
}

function normalizeSpace(text) {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
  const normalized = normalizeSpace(text);
  let sentences = normalized
    .split(/(?<=[.!?。！？다요음임됨함였다했다습니다])\s+/u)
    .map((item) => item.replace(/^[-•\s]+|[-•\s]+$/g, ""))
    .filter((item) => item.length > 5);
  if (sentences.length <= 1) {
    sentences = text
      .split(/[\n\r]+/)
      .map((item) => item.replace(/^[-•\s]+|[-•\s]+$/g, ""))
      .filter((item) => item.length > 5);
  }
  return sentences;
}

function buildCardCopy(fullScript, brandName, partnerName, eventTitle) {
  const script = normalizeSpace(fullScript);
  const sentences = splitSentences(script);
  const title = eventTitle || extractEventTitle(script) || "AI 알고리즘 투자전략 세미나";

  let overview = pickSentences(sentences, ["개최", "세미나", "행사", "주최", "본사", "센터", "일", "월", "장소"], 2);
  let sketch = pickSentences(sentences, ["참석", "경청", "집중", "현장", "분위기", "몰입", "열기"], 2);
  let insight = pickSentences(sentences, ["데이터", "자산배분", "알고리즘", "운용", "성과", "리스크", "시장", "전략", "시나리오"], 2);
  let closing = pickSentences(sentences, ["질문", "질의", "응답", "토론", "의견", "마무리", "앞으로", "파트너"], 2);

  if (!overview.length) overview = sentences.slice(0, 2).map(compressSentence);
  if (!sketch.length) sketch = ["세미나 현장에는 투자 전략과 시장 변화에 관심을 가진 참석자들의 높은 몰입도가 이어졌습니다."];
  if (!insight.length) insight = ["AI 기반 운용 전략과 데이터 기반 자산배분의 가치가 실전 투자 관점에서 조명되었습니다."];
  if (!closing.length) closing = ["세미나 말미에는 다양한 의견과 질문이 이어지며 깊이 있는 교류의 시간이 마련되었습니다."];

  let overviewBody = joinLimited(overview, 165);
  if (partnerName && script.includes(partnerName) && !overviewBody.includes(partnerName)) {
    overviewBody = appendOnce(overviewBody, `${partnerName}과 함께한 이번 자리는 더욱 뜻깊은 교류의 시간이었습니다.`, 210);
  }

  let closingBody = joinLimited(closing, 130);
  closingBody = appendOnce(
    closingBody,
    `앞으로도 ${brandName}은 기술과 데이터를 기반으로 여러분의 가장 강력한 투자 파트너가 되겠습니다.`,
    220,
  );

  return [
    { title, body: overviewBody },
    { title: "현장 스케치", body: joinLimited(sketch, 155) },
    { title: "실전 투자 인사이트", body: joinLimited(insight, 165) },
    { title: brandName, body: closingBody },
  ];
}

function extractEventTitle(script) {
  const patterns = [
    /([A-Za-z0-9가-힣\s·-]+(?:세미나|포럼|컨퍼런스|설명회|간담회|행사))/u,
    /행사명\s*[:：]\s*([^\n.]+)/u,
    /제목\s*[:：]\s*([^\n.]+)/u,
  ];
  for (const pattern of patterns) {
    const match = script.match(pattern);
    if (!match) continue;
    const title = normalizeSpace(match[1]).replace(/[. ]+$/g, "");
    if (title.length >= 4 && title.length <= 36) return title;
  }
  return "";
}

function pickSentences(sentences, keywords, limit) {
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: keywords.reduce((sum, keyword) => sum + (sentence.includes(keyword) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((item) => compressSentence(item.sentence));
}

function compressSentence(sentence, maxLen = 96) {
  const normalized = normalizeSpace(sentence).replace(/\([^)]{12,}\)/g, "");
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen).replace(/[,\s，]+$/g, "")}...`;
}

function joinLimited(sentences, maxChars) {
  const lines = [];
  let total = 0;
  for (const sentence of sentences) {
    if (lines.length && total + sentence.length > maxChars) break;
    lines.push(sentence);
    total += sentence.length;
  }
  return lines.join("\n");
}

function appendOnce(body, sentence, maxChars) {
  if (body.includes(sentence)) return body;
  if (body.length + sentence.length + 1 > maxChars) return body;
  return body ? `${body}\n${sentence}` : sentence;
}

async function loadImageInfo(file) {
  const image = await loadImageFile(file);
  const stats = inspectImage(image);
  const name = file.name.toLowerCase();
  return {
    image,
    name: file.name,
    width: image.naturalWidth,
    height: image.naturalHeight,
    ...stats,
    filenameScore: {
      cover: scoreName(name, ["cover", "title", "speaker", "presenter", "screen", "표지", "발표"]),
      audience: scoreName(name, ["audience", "crowd", "room", "hall", "attendee", "청중", "현장", "참석"]),
      insight: scoreName(name, ["slide", "data", "chart", "screen", "strategy", "insight", "자료", "전략"]),
      closing: scoreName(name, ["ai is eating", "eating", "world", "earth", "closing", "마무리", "지구"]),
    },
  };
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} 이미지를 읽지 못했습니다.`));
    };
    image.src = url;
  });
}

function makeSampleImages() {
  return [
    makeSampleImage("speaker_screen_cover.jpg", "#222C44", "AI 알고리즘 투자전략 세미나"),
    makeSampleImage("audience_room_sketch.jpg", "#2A303A", "참석자 집중도 높은 현장"),
    makeSampleImage("slide_data_strategy.jpg", "#1A2640", "데이터 기반 자산배분"),
    makeSampleImage("ai_is_eating_the_world_earth_closing.jpg", "#0A182C", "AI is eating the world"),
  ];
}

function makeSampleImage(name, background, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(790, 110, 720, 540);
  ctx.fillStyle = "#050A14";
  ctx.fillRect(70, 170, 430, 700);
  ctx.fillStyle = "#D1A982";
  ctx.beginPath();
  ctx.arc(260, 280, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2D4D86";
  ctx.fillRect(155, 355, 215, 465);
  ctx.fillStyle = "#8A8278";
  for (let i = 0; i < 9; i += 1) {
    const x = 620 + (i % 3) * 130;
    const y = 720 + Math.floor(i / 3) * 70;
    ctx.beginPath();
    ctx.arc(x + 26, y + 26, 26, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = '700 58px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillStyle = "#08101E";
  ctx.fillText(title, 830, 180);
  ctx.font = '500 36px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
  ctx.fillStyle = "#2D416D";
  ctx.fillText("AI Quantec Seminar", 830, 280);
  return {
    image: canvas,
    name,
    width: canvas.width,
    height: canvas.height,
    brightness: 80,
    contrast: 42,
    edgeScore: 13,
    centerBrightness: 120,
    filenameScore: {
      cover: scoreName(name.toLowerCase(), ["cover", "title", "speaker", "presenter", "screen", "표지", "발표"]),
      audience: scoreName(name.toLowerCase(), ["audience", "crowd", "room", "hall", "attendee", "청중", "현장", "참석"]),
      insight: scoreName(name.toLowerCase(), ["slide", "data", "chart", "screen", "strategy", "insight", "자료", "전략"]),
      closing: scoreName(name.toLowerCase(), ["ai is eating", "eating", "world", "earth", "closing", "마무리", "지구"]),
    },
  };
}

function inspectImage(image) {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, 160, 160);
  const data = ctx.getImageData(0, 0, 160, 160).data;
  const grays = [];
  let centerTotal = 0;
  let centerCount = 0;
  for (let y = 0; y < 160; y += 1) {
    for (let x = 0; x < 160; x += 1) {
      const index = (y * 160 + x) * 4;
      const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
      grays.push(gray);
      if (x >= 48 && x < 112 && y >= 48 && y < 112) {
        centerTotal += gray;
        centerCount += 1;
      }
    }
  }
  const brightness = grays.reduce((sum, value) => sum + value, 0) / grays.length;
  const variance = grays.reduce((sum, value) => sum + (value - brightness) ** 2, 0) / grays.length;
  let edgeTotal = 0;
  for (let y = 1; y < 159; y += 1) {
    for (let x = 1; x < 159; x += 1) {
      const index = y * 160 + x;
      const gx = grays[index + 1] - grays[index - 1];
      const gy = grays[index + 160] - grays[index - 160];
      edgeTotal += Math.hypot(gx, gy);
    }
  }
  return {
    brightness,
    contrast: Math.sqrt(variance),
    edgeScore: edgeTotal / (158 * 158),
    centerBrightness: centerTotal / centerCount,
  };
}

function scoreName(name, words) {
  return words.reduce((sum, word) => sum + (name.includes(word) ? 1 : 0), 0);
}

function assignImages(images) {
  let available = [...images];
  const assignments = {};
  const choose = (scorer) => {
    const pool = available.length ? available : images;
    const selected = pool.reduce((best, item) => (scorer(item) > scorer(best) ? item : best), pool[0]);
    available = available.filter((item) => item !== selected);
    return selected;
  };

  assignments[4] = choose((x) => x.filenameScore.closing * 10 + x.filenameScore.insight * 2 + x.edgeScore * 0.15 + x.centerBrightness * 0.01);
  assignments[2] = choose((x) => x.filenameScore.audience * 8 + (x.width > x.height ? 1 : 0) + x.contrast * 0.03 - x.centerBrightness * 0.002);
  assignments[3] = choose((x) => x.filenameScore.insight * 8 + x.filenameScore.cover * 2 + x.edgeScore * 0.2 + x.contrast * 0.02);
  assignments[1] = choose((x) => x.filenameScore.cover * 8 + x.filenameScore.insight * 2 + x.centerBrightness * 0.01 + x.contrast * 0.02);
  return assignments;
}

function renderCard(canvas, imageInfo, copy, page, brandLogo, partnerLogo) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawCropped(ctx, imageInfo.image, page === 4 ? "right" : "center");
  colorGrade(ctx);
  drawGradient(ctx, page);

  const titleSize = page === 1 ? 78 : 62;
  const baseBodySize = page === 1 ? 35 : 34;
  const titleFont = `800 ${titleSize}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;

  const layout = page === 4 ? { x: SAFE, y: 650, max: 520 } : page === 2 ? { x: SAFE, y: 660, max: 720 } : { x: SAFE, y: 620, max: 760 };
  let y = layout.y;
  ctx.textBaseline = "top";
  ctx.fillStyle = WHITE;
  ctx.font = titleFont;
  const titleLines = wrapPlain(ctx, copy.title, layout.max).slice(0, 2);
  for (const line of titleLines) {
    ctx.fillText(line, layout.x, y);
    y += titleSize * 1.12;
  }
  y += 20;
  const availableHeight = SIZE - y - 120;
  const fitted = fitBodyText(ctx, copy.body, layout.max, availableHeight, baseBodySize, page === 4);
  drawRichText(ctx, fitted.text, layout.x, y, layout.max, fitted.font, fitted.boldFont, fitted.size, fitted.maxLines);
  drawPageMark(ctx, page);
  if (partnerLogo) pasteLogo(ctx, partnerLogo, "partner");
  if (brandLogo) pasteLogo(ctx, brandLogo, "brand");
}

function fitBodyText(ctx, text, maxWidth, availableHeight, baseSize, preserveEnding) {
  const minSize = preserveEnding ? 25 : 28;
  for (let size = baseSize; size >= minSize; size -= 1) {
    const font = `500 ${size}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    const boldFont = `800 ${size}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
    const maxLines = Math.max(3, Math.floor(availableHeight / (size * 1.38)));
    const lineCount = countRichLines(ctx, text, maxWidth, font, boldFont);
    if (lineCount <= maxLines) return { text, size, font, boldFont, maxLines };
  }

  const size = minSize;
  const font = `500 ${size}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  const boldFont = `800 ${size}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  const maxLines = Math.max(3, Math.floor(availableHeight / (size * 1.38)));
  const fittedText = preserveEnding ? preserveClosingEnding(ctx, text, maxWidth, font, boldFont, maxLines) : trimToFitLines(ctx, text, maxWidth, font, boldFont, maxLines);
  return { text: fittedText, size, font, boldFont, maxLines };
}

function countRichLines(ctx, text, maxWidth, font, boldFont) {
  return text
    .split("\n")
    .reduce((total, paragraph) => total + wrapTokens(ctx, tokenizeHighlights(paragraph), font, boldFont, maxWidth).length, 0);
}

function trimToFitLines(ctx, text, maxWidth, font, boldFont, maxLines) {
  const sentences = splitSentences(text.replace(/\n/g, " "));
  for (let count = sentences.length; count >= 1; count -= 1) {
    const candidate = sentences.slice(0, count).join("\n");
    if (countRichLines(ctx, candidate, maxWidth, font, boldFont) <= maxLines) return candidate;
  }
  return text;
}

function preserveClosingEnding(ctx, text, maxWidth, font, boldFont, maxLines) {
  const lines = text.split("\n").filter(Boolean);
  const finalLine = lines.find((line) => line.includes("가장 강력한 투자 파트너")) || lines[lines.length - 1] || text;
  const leadLines = lines.filter((line) => line !== finalLine);
  const shortLead = leadLines.length ? compressSentence(leadLines[0], 64) : "";
  const candidates = [
    [shortLead, finalLine].filter(Boolean).join("\n"),
    finalLine,
    finalLine.replace("여러분의 가장 강력한 투자 파트너가 되겠습니다.", "가장 강력한 투자 파트너가 되겠습니다."),
  ];

  for (const candidate of candidates) {
    if (countRichLines(ctx, candidate, maxWidth, font, boldFont) <= maxLines) return candidate;
  }
  return candidates[candidates.length - 1];
}

function drawCropped(ctx, image, focus) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(SIZE / sourceWidth, SIZE / sourceHeight);
  const drawW = Math.ceil(sourceWidth * scale);
  const drawH = Math.ceil(sourceHeight * scale);
  const dx = focus === "right" ? SIZE - drawW : (SIZE - drawW) / 2;
  const dy = (SIZE - drawH) / 2;
  ctx.drawImage(image, dx, dy, drawW, drawH);
}

function colorGrade(ctx) {
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = clamp((avg + (data[i] - avg) * 0.9) * 0.94 * 1.05);
    data[i + 1] = clamp((avg + (data[i + 1] - avg) * 0.9) * 0.99 * 1.05);
    data[i + 2] = clamp((avg + (data[i + 2] - avg) * 0.9) * 1.06 * 1.05);
  }
  ctx.putImageData(imageData, 0, 0);
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function drawGradient(ctx, page) {
  const bottom = ctx.createLinearGradient(0, SIZE * 0.48, 0, SIZE);
  bottom.addColorStop(0, "rgba(6, 18, 38, 0)");
  bottom.addColorStop(1, "rgba(6, 18, 38, 0.72)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (page === 2 || page === 4) {
    const side = ctx.createLinearGradient(0, 0, SIZE * 0.62, 0);
    side.addColorStop(0, "rgba(6, 18, 38, 0.54)");
    side.addColorStop(1, "rgba(6, 18, 38, 0)");
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
}

function drawRichText(ctx, text, x, y, maxWidth, font, boldFont, fontSize, maxLines) {
  const paragraphs = text.split("\n");
  let rendered = 0;
  for (let p = 0; p < paragraphs.length; p += 1) {
    const tokens = tokenizeHighlights(paragraphs[p]);
    const lines = wrapTokens(ctx, tokens, font, boldFont, maxWidth);
    for (const line of lines) {
      if (rendered >= maxLines) return;
      let cursorX = x;
      for (const segment of line) {
        ctx.font = segment.bold ? boldFont : font;
        ctx.fillStyle = segment.color;
        ctx.fillText(segment.text, cursorX, y);
        cursorX += ctx.measureText(segment.text).width;
      }
      y += fontSize * 1.38;
      rendered += 1;
    }
    if (p < paragraphs.length - 1) y += 8;
  }
}

function tokenizeHighlights(text) {
  const matches = [];
  for (const [phrase, color] of highlightRules) {
    let start = text.indexOf(phrase);
    while (start !== -1) {
      matches.push({ start, end: start + phrase.length, color });
      start = text.indexOf(phrase, start + phrase.length);
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));

  const tokens = [];
  let cursor = 0;
  let occupiedUntil = -1;
  for (const match of matches) {
    if (match.start < occupiedUntil) continue;
    if (match.start > cursor) tokens.push(...splitKeepSpaces(text.slice(cursor, match.start), WHITE, false));
    tokens.push({ text: text.slice(match.start, match.end), color: match.color, bold: true });
    cursor = match.end;
    occupiedUntil = match.end;
  }
  if (cursor < text.length) tokens.push(...splitKeepSpaces(text.slice(cursor), WHITE, false));
  return tokens;
}

function splitKeepSpaces(text, color, bold) {
  const parts = text.match(/\S+\s*/g) || [];
  return parts.map((part) => ({ text: part, color, bold }));
}

function wrapPlain(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = `${line} ${word}`.trim();
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrapTokens(ctx, tokens, font, boldFont, maxWidth) {
  const lines = [];
  let line = [];
  let width = 0;
  for (let token of tokens) {
    ctx.font = token.bold ? boldFont : font;
    let tokenWidth = ctx.measureText(token.text).width;
    if (line.length && width + tokenWidth > maxWidth) {
      lines.push(line);
      line = [];
      width = 0;
      token = { ...token, text: token.text.trimStart() };
      tokenWidth = ctx.measureText(token.text).width;
    }
    if (tokenWidth > maxWidth) {
      for (const chunk of splitLongToken(ctx, token.text, maxWidth)) {
        if (line.length) lines.push(line);
        line = [{ ...token, text: chunk }];
        width = ctx.measureText(chunk).width;
      }
    } else {
      line.push(token);
      width += tokenWidth;
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

function splitLongToken(ctx, token, maxWidth) {
  const chunks = [];
  let current = "";
  for (const char of token) {
    const candidate = current + char;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function drawPageMark(ctx, page) {
  const badgeX = SAFE;
  const badgeY = SIZE - 84;
  const badgeW = 94;
  const badgeH = 40;

  ctx.fillStyle = GREEN;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
  ctx.fill();
  ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  ctx.fillStyle = DARK_NAVY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${page}/4`, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(SAFE + 118, SIZE - 64);
  ctx.lineTo(SAFE + 258, SIZE - 64);
  ctx.stroke();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function pasteLogo(ctx, logo, logoType = "brand") {
  const maxW = 180;
  const logoWidth = logo.naturalWidth || logo.width;
  const logoHeight = logo.naturalHeight || logo.height;
  const ratio = maxW / logoWidth;
  const width = maxW;
  const height = Math.max(1, Math.round(logoHeight * ratio));
  const x = logoType === "partner" ? SAFE : SIZE - width - SAFE;
  ctx.drawImage(logo, x, SAFE, width, height);
}

function renderPreview(cards) {
  els.cardGrid.innerHTML = "";
  cards.forEach((canvas, index) => {
    const article = document.createElement("article");
    article.className = "card-result";
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = SIZE;
    previewCanvas.height = SIZE;
    previewCanvas.getContext("2d").drawImage(canvas, 0, 0);

    const toolbar = document.createElement("div");
    toolbar.className = "card-toolbar";
    const label = document.createElement("span");
    label.textContent = `card_${index + 1}.png`;
    const button = document.createElement("button");
    button.className = "secondary-btn";
    button.type = "button";
    button.textContent = "다운로드";
    button.addEventListener("click", () => downloadCanvas(canvas, `card_${index + 1}.png`));
    toolbar.append(label, button);
    article.append(previewCanvas, toolbar);
    els.cardGrid.append(article);
  });
}

function renderCollage(cards) {
  const ctx = els.collageCanvas.getContext("2d");
  ctx.fillStyle = DARK_NAVY;
  ctx.fillRect(0, 0, SIZE * 2, SIZE * 2);
  cards.forEach((canvas, index) => {
    const x = index % 2 === 0 ? 0 : SIZE;
    const y = index < 2 ? 0 : SIZE;
    ctx.drawImage(canvas, x, y);
  });
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

window.CardNewsApp = {
  buildCardCopy,
  assignImages,
  renderCard,
  renderCollage,
};
