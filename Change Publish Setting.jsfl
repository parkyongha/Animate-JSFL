var doc = fl.getDocumentDOM();

if (!doc) {
	fl.trace("문서를 먼저 열어주세요.");
}

var fileName = getFileSegment(doc.name);

fl.trace("이건가" + fileName);

// 현재 퍼블리시 프로필 이름 가져오기
var profileName = doc.currentPublishProfile;
fl.trace("현재 퍼블리시 프로필: " + profileName);

// 퍼블리시 프로필 XML 문자열 추출
var profileXML = doc.exportPublishProfileString(profileName);
//fl.trace("원본 퍼블리시 프로필 XML:\n" + profileXML);

// filename 변경: bin/BW_5775307.js -> bin/fileName.js
var modifiedProfileXML =
	profileXML.replace(/(<Property name="filename">bin\/)[^.]+(\.js<\/Property>)/, "$1" + fileName + "$2")
// soundsPath 변경: BW_5775307/sounds/ -> fileName/sounds/
.replace(/(<Property name="soundsPath">)[^\/]+(\/sounds\/<\/Property>)/, "$1" + fileName + "$2")
// imagesPath 변경: BW_5775307/images/ -> fileName/images/
.replace(/(<Property name="imagesPath">)[^\/]+(\/images\/<\/Property>)/, "$1" + fileName + "$2")
// libraryPath 변경: BW_5775307/libs/ -> fileName/libs/
.replace(/(<Property name="libraryPath">)[^\/]+(\/libs\/<\/Property>)/, "$1" + fileName + "$2");

// 예)
// 변경 전
// <Property name="filename">bin/BW_5775307.js</Property>
// <Property name="soundsPath">BW_5775307/sounds/</Property>
// <Property name="imagesPath">BW_5775307/images/</Property>
// <Property name="libraryPath">BW_5775307/libs/</Property>

// 변경 후
// <Property name="filename">bin/fileName.js</Property>
// <Property name="soundsPath">fileName/sounds/</Property>
// <Property name="imagesPath">fileName/images/</Property>
// <Property name="libraryPath">fileName/libs/</Property>

// 수정된 XML 문자열을 다시 적용
doc.importPublishProfileString(modifiedProfileXML);

// 변경 사항 확인 (필요 시, 현재 프로필을 재설정할 수도 있음)
doc.currentPublishProfile = profileName;

fl.trace("퍼블리시 설정이 업데이트되었습니다.");

function getFileSegment(fileName) {

	// 확장자 제거 (대소문자 구분 없이)
	var baseName = fileName.replace(/\.xfl$/i, "");
	// 밑줄("_")로 분리
	var parts = baseName.split("_");

	// 마지막 두 요소가 존재하면 추출
	if (parts.length >= 2) {
		var extracted = parts.slice(-2).join("_");
		return extracted;
	} else {
		fl.trace("추출할 수 없는 파일 이름 형식입니다.");
		return null;
	}

}
