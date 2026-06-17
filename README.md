# AI Quantec 카드뉴스 자동 생성기

`ai_quantec_cardnews.py`는 세미나 사진 여러 장과 전체 행사 원고 1개를 입력받아 4장 카드뉴스 문구를 자동 분해하고 이미지를 배정해 PNG를 생성합니다.

## 실행 예시

```bash
/Users/myoungsooeum/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  ai_quantec_cardnews.py \
  --images photo1.jpg photo2.jpg photo3.jpg photo4.jpg \
  --script-file full_script.txt \
  --output-dir ./generated_cards \
  --output-mode collage
```

## Python API

```python
from ai_quantec_cardnews import generate_cards

generate_cards(
    image_paths=["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg"],
    full_script="전체 행사 설명문...",
    output_dir="./generated_cards",
    output_mode="collage",
    brand_name="AI Quantec",
    partner_name="DF717",
    brand_logo_path="brand_logo.png",
    partner_logo_path="partner_logo.png",
    use_partner_logo=True,
)
```

## 반영된 규칙

- 페이지별 스크립트 입력 없이 `full_script` 하나만 사용합니다.
- 1장 행사 개요, 2장 현장 스케치, 3장 투자 인사이트, 4장 브랜드 마무리로 자동 구성합니다.
- 사진은 파일명과 이미지 특성 기반 휴리스틱으로 표지/청중/자료/마무리 장면에 배정합니다.
- 4장은 `AI is eating the world`, `earth`, `world`, `closing`, `지구` 등의 파일명 힌트가 있는 사진을 우선합니다.
- 원본 비율을 유지하고 정사각형으로 크롭하며, 강제 늘림은 하지 않습니다.
- 브랜드 로고는 `--brand-logo-path ...`를 지정하면 우상단에 삽입합니다.
- 협력사 로고는 `--use-partner-logo --partner-logo-path ...`를 함께 지정한 경우에만 좌상단에 삽입합니다.
- 두 로고 모두 같은 기준 폭으로 원본 비율을 유지합니다.
- 장소/날짜 배지는 별도 박스로 만들지 않고 본문 안에만 자연스럽게 포함합니다.
