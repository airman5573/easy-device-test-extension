# 쉬운 기기 테스트

하나의 URL을 여러 화면 크기에서 동시에 확인하는 Chrome 확장 프로그램입니다. 툴바 아이콘을 누르면 새 탭으로 열리고, 입력한 주소를 여러 반응형 프레임에 나란히 표시합니다.

## 주요 기능

- Chrome 툴바 아이콘으로 확장 페이지 열기
- 하나의 URL을 여러 기기/브레이크포인트 프레임에 동시 로드
- 기본 프레임: Tailwind 기본 브레이크포인트 `sm`, `md`, `lg`, `xl`, `2xl`
- 기기 추가, 검색, 사용자 지정 크기 입력
- 회전, 새로고침, 닫기, 순서 변경, 초기화, 확대/축소
- iframe 로드가 막힌 사이트를 위한 스크린샷 캡처 모드
- 가능한 페이지에서 프레임 간 스크롤 동기화

## 기술 스택

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- Zod
- Chrome Extension Manifest V3

## 설치

```bash
npm install
```

## 개발

```bash
npm run dev
```

Vite 개발 서버는 UI 작업용입니다. Chrome 확장 기능은 빌드 후 Chrome에 로드해서 확인하세요.

## 검사 및 빌드

```bash
npm run typecheck
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## Chrome에 확장 프로그램 로드하기

1. 빌드합니다.

   ```bash
   npm run build
   ```

2. Chrome에서 아래 주소를 엽니다.

   ```text
   chrome://extensions
   ```

3. **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 클릭합니다.
5. 프로젝트의 `dist/` 폴더를 선택합니다.
6. 툴바에서 **쉬운 기기 테스트** 아이콘을 클릭합니다.

## 사용 방법

1. 확장 프로그램을 엽니다.
2. 상단 입력창에 확인할 URL을 입력합니다.
3. **Go**를 누르거나 Enter를 입력합니다.
4. 각 프레임에서 화면 크기별 결과를 확인합니다.
5. 필요하면 기기 추가, 회전, 확대/축소, 새로고침, 스크롤 동기화를 사용합니다.

## 기본 화면 크기

| 이름 | 크기 |
| --- | --- |
| `sm` | `640 × 982` |
| `md` | `768 × 982` |
| `lg` | `1024 × 982` |
| `xl` | `1280 × 982` |
| `2xl` | `1536 × 982` |

## 제한 사항

일부 사이트는 보안 설정 때문에 iframe 안에서 표시되지 않을 수 있습니다. 이 경우 캡처 모드를 사용하면 임시 탭에서 해당 화면 크기로 스크린샷을 찍어 프레임에 표시합니다. 캡처 결과는 정적인 이미지이므로 실제 페이지처럼 조작할 수는 없습니다.

스크롤 동기화는 가능한 페이지에서만 동작합니다. 사이트 구조, 브라우저 보안 정책, iframe 차단 여부에 따라 정확히 동작하지 않을 수 있습니다.

## 개인정보 및 권한

확장 프로그램은 스크롤 동기화와 캡처 모드를 위해 `http://*/*`, `https://*/*`, `tabs`, `storage`, `debugger` 권한을 사용합니다.

- `storage`: 화면 구성과 설정 저장
- `tabs`: 확장 페이지와 임시 캡처 탭 제어
- `debugger`: 사용자가 캡처를 요청했을 때 기기 크기 에뮬레이션 및 스크린샷 생성
- 호스트 권한: 가능한 페이지에서 iframe 스크롤 동기화 지원

개인정보 처리방침:

```text
https://airman5573.github.io/chrome-responsive-ui-extension-privacy/
```

## 프로젝트 구조

```text
public/manifest.json           Chrome 확장 프로그램 매니페스트
public/icons/                  확장 프로그램 아이콘
src/                           React 앱, 상태 관리, 스키마, 컴포넌트
src/extension/background.ts    툴바 클릭 시 확장 페이지를 여는 서비스 워커
src/extension/scrollContentScript.ts
                               스크롤 동기화용 콘텐츠 스크립트
vite.config.ts                 앱/서비스 워커/콘텐츠 스크립트 빌드 설정
dist/                          빌드 결과물
1.html, 2.html                 초기 화면 참고용 정적 목업
```
