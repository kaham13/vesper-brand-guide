# VESPER

가상의 향수 브랜드 VESPER의 브랜드 가이드와 WINTER WALTZ 광고 포스터입니다.
기존 디자인과 콘텐츠를 유지한 정적 웹사이트입니다.

## 실행

별도 설치 없이 `index.html`을 브라우저에서 엽니다. HTML, CSS, SVG는 같은 폴더에 둡니다.
원시 HTML·CSS·JavaScript로 작성했으며, 프레임워크·패키지 의존성·서버·API·환경 변수를 사용하지 않습니다.
서체가 없는 기기에서는 기존에 지정된 시스템 대체 서체를 사용합니다.

## 파일

- `index.html`: 브랜드 가이드와 페이지 내 이동 기능
- `style.css`: 반응형 스타일
- `winter-waltz-poster.svg`: 1080 × 1350 px 광고 포스터
- `vercel.json`: 정적 배포 설정
- `.gitignore`: Git 제외 규칙
- `.vercelignore`: 배포 제외 규칙
- `scripts/check-site.mjs`: 경로·대소문자·스크립트 문법·비밀정보 패턴 검사
- `README.md`: 실행 및 배포 안내

## 배포 전 검사

Node.js가 설치된 환경에서 다음 명령을 실행합니다. 패키지 설치나 빌드는 필요하지 않습니다.

```sh
node scripts/check-site.mjs
```

검사 명령은 정적 파일 경로와 대소문자, 페이지 앵커, SVG 내부 참조,
인라인 JavaScript 문법, 알려진 자격증명 패턴을 확인합니다.
패턴 검사는 모든 종류의 비밀정보를 보장해서 탐지하지 않으므로 공개할 파일을 함께 검토합니다.

## GitHub

개인 계정에 `vesper-brand-guide`라는 Public 저장소를 만들고 `main` 브랜치를 사용합니다.
이 이름이 이미 존재한다면 기존 저장소를 덮어쓰지 말고 다른 이름을 정합니다.
위 파일 목록의 소스와 문서가 공개됩니다. `node_modules`, `dist`, `.env`와 환경별 파일,
로컬 도구 설정은 Git에 포함하지 않습니다. 비밀 키나 개인정보는 추가하지 않습니다.

GitHub 웹에서 업로드할 때는 숨김 파일인 `.gitignore`와 `.vercelignore`도 빠뜨리지 않습니다.

## Vercel 가져오기 설정

| 항목 | 값 |
| --- | --- |
| Framework Preset | Other |
| Root Directory | 저장소 루트 (`./`) |
| Build Command | 비워 둠 |
| Install Command | 비워 둠 |
| Output Directory | `.` |
| Environment Variables | 필요 없음 |
| Production Branch | `main` |

`vercel.json`에도 같은 설정이 지정되어 있습니다. `public` 폴더를 새로 만들지 않습니다.
이 프로젝트는 정적 파일이므로 `npm run build`를 지정하지 않습니다.

Vercel에서 개인 GitHub 저장소를 Import한 뒤 Deploy합니다.
목록에 저장소가 없으면 Configure GitHub App에서 해당 저장소 접근을 허용합니다.
배포가 Ready 상태가 되면 Domains에 표시된 짧은 `이름.vercel.app` 주소를 제출합니다.
시크릿 창과 휴대폰에서 접속하고 포스터 표시·다운로드·페이지 내 이동을 확인합니다.
이후 `main`으로 푸시하면 연결된 Vercel 프로젝트가 다시 배포됩니다.

## 참고

- [수업 배포 가이드](https://affectivedesign.kr/teaching/2026-2-guide-deploy)
- [Vercel 빌드 설정](https://vercel.com/docs/builds/configure-a-build)

브랜드와 제품은 가상의 프로젝트이며, 포스터 그래픽은 이 프로젝트를 위해 직접 그린 SVG입니다.
